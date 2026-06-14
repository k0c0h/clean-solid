/**
 * REFACTORIZACIÓN SRP - RESPONSABILIDAD ÚNICA
 * 
 * Separamos las responsabilidades en servicios específicos:
 * - ProductService: Solo gestiona productos
 * - NotificationService: Solo envía notificaciones
 * - ProductRepository: Solo persiste datos
 */

// ========== INTERFACES ==========

export interface Product {
    id: number;
    name: string;
    price?: number;
    stock?: number;
}

export interface IProductRepository {
    getProductById(id: number): Promise<Product | undefined>;
    saveProduct(product: Product): Promise<void>;
    getAllProducts(): Promise<Product[]>;
}

export interface INotificationService {
    sendEmail(email: string, message: string): Promise<void>;
}

export interface ITransactionHandler {
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

// ========== IMPLEMENTACIONES ==========

/**
 * Responsabilidad: SOLO gestionar productos
 * No sabe nada de correos, ni de persistencia directa
 */
export class ProductService {
    constructor(
        private productRepository: IProductRepository,
        private transactionHandler?: ITransactionHandler
    ) {}

    async loadProduct(id: number): Promise<Product | undefined> {
        try {
            console.log(`Cargando producto con ID: ${id} desde el inventario...`);
            return await this.productRepository.getProductById(id);
        } catch (error) {
            console.error(`Error al cargar producto ${id}:`, error);
            throw error;
        }
    }

    async saveProduct(product: Product): Promise<void> {
        try {
            if (this.transactionHandler) {
                await this.transactionHandler.begin();
            }

            console.log(`Guardando producto ${product.name}...`);
            await this.productRepository.saveProduct(product);

            if (this.transactionHandler) {
                await this.transactionHandler.commit();
            }
        } catch (error) {
            if (this.transactionHandler) {
                await this.transactionHandler.rollback();
            }
            console.error(`Error al guardar producto:`, error);
            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.getAllProducts();
    }
}

/**
 * Responsabilidad: SOLO enviar notificaciones por correo
 */
export class EmailNotificationService implements INotificationService {
    async sendEmail(email: string, message: string): Promise<void> {
        try {
            console.log(`[Mailer] Enviando correo a ${email}: ${message}`);
            // Simulación de envío
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Error al enviar correo:`, error);
            throw error;
        }
    }
}

/**
 * Responsabilidad: SOLO persistir productos
 */
export class ProductRepository implements IProductRepository {
    private products: Product[] = [];

    async getProductById(id: number): Promise<Product | undefined> {
        return this.products.find(p => p.id === id);
    }

    async saveProduct(product: Product): Promise<void> {
        const exists = this.products.findIndex(p => p.id === product.id);
        if (exists >= 0) {
            this.products[exists] = product;
        } else {
            this.products.push(product);
        }
    }

    async getAllProducts(): Promise<Product[]> {
        return [...this.products];
    }
}

/**
 * Manejo de transacciones
 */
export class SimpleTransactionHandler implements ITransactionHandler {
    private isActive = false;

    async begin(): Promise<void> {
        console.log('[Transaction] Iniciando transacción...');
        this.isActive = true;
    }

    async commit(): Promise<void> {
        if (!this.isActive) throw new Error('No hay transacción activa');
        console.log('[Transaction] Confirmando transacción...');
        this.isActive = false;
    }

    async rollback(): Promise<void> {
        if (!this.isActive) throw new Error('No hay transacción activa');
        console.log('[Transaction] Revirtiendo transacción...');
        this.isActive = false;
    }
}

// ========== USO ==========

export async function useSRPExample() {
    console.log('\n=== REFACTORIZACIÓN SRP ===\n');

    const repository = new ProductRepository();
    const notificationService = new EmailNotificationService();
    const transactionHandler = new SimpleTransactionHandler();

    // Inyectamos las dependencias
    const productService = new ProductService(repository, transactionHandler);

    // Usar el servicio
    try {
        const newProduct: Product = {
            id: 1,
            name: 'Souvenirs del Parque',
            price: 25,
            stock: 100
        };

        await productService.saveProduct(newProduct);
        
        const loaded = await productService.loadProduct(1);
        console.log('Producto cargado:', loaded);

        // Notificación es responsabilidad separada
        await notificationService.sendEmail(
            'admin@parque.com',
            `Nuevo producto agregado: ${newProduct.name}`
        );
    } catch (error) {
        console.error('Error en operación:', error);
    }
}
