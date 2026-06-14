/**
 * CAPA DE TRANSACCIONES RESILIENTE
 * 
 * Manejo robusto de transacciones con:
 * - Rollback automático en errores
 * - Retry policy
 * - Event sourcing
 * - Logging detallado
 */

// ========== INTERFACES ==========

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMMITTED = 'COMMITTED',
    ROLLED_BACK = 'ROLLED_BACK',
    FAILED = 'FAILED'
}

export interface TransactionEvent {
    type: 'BEGIN' | 'COMMIT' | 'ROLLBACK' | 'ERROR';
    timestamp: Date;
    data?: any;
    error?: Error;
}

export interface ITransactionListener {
    onBegin(id: string): void;
    onCommit(id: string): void;
    onRollback(id: string): void;
    onError(id: string, error: Error): void;
}

// ========== TRANSACTION CONTEXT ==========

export class TransactionContext {
    private id: string;
    private status: TransactionStatus = TransactionStatus.PENDING;
    private events: TransactionEvent[] = [];
    private startTime: Date;
    private listeners: Set<ITransactionListener> = new Set();

    constructor() {
        this.id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.startTime = new Date();
    }

    getId(): string {
        return this.id;
    }

    getStatus(): TransactionStatus {
        return this.status;
    }

    getDuration(): number {
        return Date.now() - this.startTime.getTime();
    }

    addListener(listener: ITransactionListener): void {
        this.listeners.add(listener);
    }

    recordEvent(event: TransactionEvent): void {
        this.events.push(event);
    }

    getEvents(): TransactionEvent[] {
        return [...this.events];
    }

    markCommitted(): void {
        this.status = TransactionStatus.COMMITTED;
        this.recordEvent({
            type: 'COMMIT',
            timestamp: new Date()
        });
        this.listeners.forEach(l => l.onCommit(this.id));
    }

    markRolledBack(): void {
        this.status = TransactionStatus.ROLLED_BACK;
        this.recordEvent({
            type: 'ROLLBACK',
            timestamp: new Date()
        });
        this.listeners.forEach(l => l.onRollback(this.id));
    }

    markFailed(error: Error): void {
        this.status = TransactionStatus.FAILED;
        this.recordEvent({
            type: 'ERROR',
            timestamp: new Date(),
            error
        });
        this.listeners.forEach(l => l.onError(this.id, error));
    }

    markBegin(): void {
        this.recordEvent({
            type: 'BEGIN',
            timestamp: new Date()
        });
        this.listeners.forEach(l => l.onBegin(this.id));
    }
}

// ========== RETRY POLICY ==========

export interface RetryPolicy {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
}

export class DefaultRetryPolicy implements RetryPolicy {
    maxAttempts = 3;
    delayMs = 100;
    backoffMultiplier = 2;
}

// ========== TRANSACTION MANAGER ==========

export class TransactionManager {
    private activeTransactions = new Map<string, TransactionContext>();
    private retryPolicy: RetryPolicy;
    private transactionLog: TransactionEvent[] = [];

    constructor(retryPolicy: RetryPolicy = new DefaultRetryPolicy()) {
        this.retryPolicy = retryPolicy;
    }

    /**
     * Iniciar una nueva transacción
     */
    begin(): TransactionContext {
        const context = new TransactionContext();
        context.markBegin();
        this.activeTransactions.set(context.getId(), context);
        console.log(`[TXN] Iniciada: ${context.getId()}`);
        return context;
    }

    /**
     * Confirmar transacción
     */
    commit(context: TransactionContext): void {
        if (context.getStatus() !== TransactionStatus.PENDING) {
            throw new Error(`No se puede confirmar transacción en estado: ${context.getStatus()}`);
        }
        context.markCommitted();
        this.activeTransactions.delete(context.getId());
        console.log(`[TXN] Confirmada: ${context.getId()} (${context.getDuration()}ms)`);
    }

    /**
     * Revertir transacción
     */
    rollback(context: TransactionContext): void {
        if (context.getStatus() === TransactionStatus.COMMITTED) {
            throw new Error('No se puede revertir una transacción ya confirmada');
        }
        context.markRolledBack();
        this.activeTransactions.delete(context.getId());
        console.log(`[TXN] Revertida: ${context.getId()}`);
    }

    /**
     * Ejecutar operación con reintentos automáticos
     */
    async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: TransactionContext
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.retryPolicy.maxAttempts; attempt++) {
            try {
                console.log(`[TXN] Intento ${attempt}/${this.retryPolicy.maxAttempts}`);
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`[TXN] Error en intento ${attempt}: ${lastError.message}`);

                if (attempt < this.retryPolicy.maxAttempts) {
                    const delay = this.retryPolicy.delayMs * Math.pow(
                        this.retryPolicy.backoffMultiplier,
                        attempt - 1
                    );
                    console.log(`[TXN] Reintentando en ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        context.markFailed(lastError!);
        throw new Error(
            `Operación falló después de ${this.retryPolicy.maxAttempts} intentos: ${lastError?.message}`
        );
    }

    /**
     * Ejecutar múltiples operaciones en transacción
     */
    async executeTransaction<T>(
        operations: Array<() => Promise<any>>
    ): Promise<T[]> {
        const context = this.begin();
        const results: T[] = [];

        try {
            for (let i = 0; i < operations.length; i++) {
                const result = await this.executeWithRetry(operations[i], context);
                results.push(result);
            }
            this.commit(context);
            return results;
        } catch (error) {
            this.rollback(context);
            throw error;
        }
    }

    /**
     * Obtener transacciones activas
     */
    getActiveTransactions(): TransactionContext[] {
        return Array.from(this.activeTransactions.values());
    }

    /**
     * Obtener estadísticas
     */
    getStats(): object {
        const allTransactions = [
            ...this.activeTransactions.values(),
            ...this.transactionLog
        ];

        return {
            activeTransactions: this.activeTransactions.size,
            totalTransactions: allTransactions.length,
            averageDuration: allTransactions.length > 0
                ? allTransactions.reduce((sum, t) => sum + (t.getDuration ? t.getDuration() : 0), 0) /
                  allTransactions.length
                : 0
        };
    }
}

// ========== TRANSACTION LISTENER EXAMPLE ==========

export class AuditLogger implements ITransactionListener {
    onBegin(id: string): void {
        console.log(`📝 [AUDIT] Transacción iniciada: ${id}`);
    }

    onCommit(id: string): void {
        console.log(`✅ [AUDIT] Transacción confirmada: ${id}`);
    }

    onRollback(id: string): void {
        console.log(`⚠️ [AUDIT] Transacción revertida: ${id}`);
    }

    onError(id: string, error: Error): void {
        console.error(`❌ [AUDIT] Error en transacción ${id}: ${error.message}`);
    }
}

// ========== USO ==========

export async function useTransactionExample() {
    console.log('\n=== CAPA DE TRANSACCIONES RESILIENTE ===\n');

    const txnManager = new TransactionManager();
    const auditLogger = new AuditLogger();

    // Operación exitosa
    console.log('--- Operación Exitosa ---');
    const context1 = txnManager.begin();
    context1.addListener(auditLogger);

    try {
        const result = await txnManager.executeWithRetry(
            async () => {
                console.log('Ejecutando operación...');
                return { success: true, data: 'Resultado' };
            },
            context1
        );
        txnManager.commit(context1);
        console.log('Resultado:', result);
    } catch (error) {
        console.error('Error:', error);
    }

    // Operación con reintentos
    console.log('\n--- Operación con Reintentos ---');
    const context2 = txnManager.begin();
    context2.addListener(auditLogger);

    let attempts = 0;
    try {
        const result = await txnManager.executeWithRetry(
            async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Fallo temporal');
                }
                return { success: true };
            },
            context2
        );
        txnManager.commit(context2);
        console.log('Éxito después de reintentos:', result);
    } catch (error) {
        console.error('Error:', error);
        txnManager.rollback(context2);
    }

    // Estadísticas
    console.log('\n--- Estadísticas ---');
    console.log(txnManager.getStats());
}
