// SRP - Servicios separados por responsabilidad
import {
    ProductService,
    EmailNotificationService,
    ProductRepository,
    SimpleTransactionHandler,
    useSRPExample
} from './01-srp/product-service';

// OCP - Clientes HTTP extensibles
import {
    NewsService,
    PhotosService,
    VideoService,
    HttpClientFactory,
    useOCPExample
} from './02-ocp/http-client-service';

// LSP - Vehículos intercambiables
import {
    VehicleManager,
    Tesla,
    Audi,
    useLSPExample
} from './03-lsp/vehicle-service';

// ISP - Interfaces segregadas
import {
    BirdCatalog,
    Toucan,
    Hummingbird,
    Ostrich,
    Duck,
    useISPExample
} from './04-isp/bird-service';

// DIP - Inyección de dependencias
import {
    PostServiceFactory,
    useDIPExample
} from './05-dip/post-service-refactored';

// Transacciones resilientes
import {
    TransactionManager,
    DefaultRetryPolicy,
    AuditLogger,
    useTransactionExample
} from './transactions/transaction-manager';

// ========== APLICACIÓN INTEGRADA ==========

/**
 * Sistema unificado que demuestra todos los principios
 */
export class RefactoredApplication {
    private productService: ProductService;
    private notificationService: EmailNotificationService;
    private transactionManager: TransactionManager;
    private newsService: NewsService;
    private postService = PostServiceFactory.createWithLocalDatabase();

    constructor() {
        // Configurar servicios con DIP
        const repository = new ProductRepository();
        const transactionHandler = new SimpleTransactionHandler();
        this.productService = new ProductService(repository, transactionHandler);
        this.notificationService = new EmailNotificationService();

        // Transacciones con retry policy
        const retryPolicy = new DefaultRetryPolicy();
        retryPolicy.maxAttempts = 2;
        retryPolicy.delayMs = 50;
        this.transactionManager = new TransactionManager(retryPolicy);

        // Servicios HTTP con OCP
        const httpClient = HttpClientFactory.create('mock');
        this.newsService = new NewsService(httpClient);
    }

    /**
     * Flujo de negocio integrado
     */
    async executeBusinessFlow() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║     APLICACIÓN REFACTORIZADA CON SOLID Y PATRONES DE DISEÑO      ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

        try {
            // 1. Crear producto (SRP + Transacciones)
            console.log('📦 PASO 1: Crear Nuevo Producto\n');
            const context = this.transactionManager.begin();
            const auditLogger = new AuditLogger();
            context.addListener(auditLogger);

            await this.transactionManager.executeWithRetry(
                async () => {
                    return await this.productService.saveProduct({
                        id: 101,
                        name: '🦅 Guía de Aves de la Reserva',
                        price: 45,
                        stock: 50
                    });
                },
                context
            );
            this.transactionManager.commit(context);

            // 2. Obtener noticias (OCP - cliente intercambiable)
            console.log('\n📰 PASO 2: Obtener Noticias\n');
            try {
                const news = await this.newsService.getLatestNews();
                console.log(`Noticias obtenidas: ${news.length} resultados`);
            } catch (error) {
                console.log('(Mock client - simulated response)');
            }

            // 3. Gestionar flota de vehículos (LSP)
            console.log('\n🚗 PASO 3: Gestionar Flota de Vehículos\n');
            const vehicles = [
                new Tesla('Model S'),
                new Audi('Q7')
            ];
            VehicleManager.printVehicleDetails(vehicles);

            // 4. Catálogo de aves (ISP)
            console.log('\n🦆 PASO 4: Catálogo de Aves de la Reserva\n');
            const birds = [
                new Toucan(),
                new Hummingbird(),
                new Ostrich(),
                new Duck()
            ];
            BirdCatalog.displayInfo(birds);

            // 5. Obtener posts (DIP)
            console.log('\n📝 PASO 5: Sistema de Posts (DIP)\n');
            const posts = await this.postService.getPosts();
            console.log(`Posts obtenidos: ${posts.length}`);
            posts.slice(0, 2).forEach(post => {
                console.log(`  - ${post.title}`);
            });

            // 6. Enviar notificaciones (SRP)
            console.log('\n📧 PASO 6: Sistema de Notificaciones\n');
            await this.notificationService.sendEmail(
                'admin@reserva.com',
                'Nuevo producto agregado: Guía de Aves'
            );

            console.log('\n✅ Flujo de negocio completado exitosamente\n');

        } catch (error) {
            console.error('❌ Error en flujo de negocio:', error);
        }
    }

    /**
     * Demostración de cada principio SOLID
     */
    async demonstrateSOLID() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║        DEMOSTRACIÓN DE PRINCIPIOS SOLID Y PATRONES                 ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝');

        await useSRPExample();
        await useOCPExample();
        useLSPExample();
        useISPExample();
        await useDIPExample();
        await useTransactionExample();
    }
}

// ========== PUNTO DE ENTRADA ==========

export async function main() {
    const app = new RefactoredApplication();

    // Ejecutar flujo de negocio integrado
    await app.executeBusinessFlow();

    // Mostrar cada principio SOLID en detalle
    console.log('\n');
    await app.demonstrateSOLID();

    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                 ✨ REFACTORIZACIÓN COMPLETADA ✨                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log('📚 RESUMEN DE MEJORAS:');
    console.log('');
    console.log('1️⃣  SRP (Responsabilidad Única):');
    console.log('   - ProductService: Solo gestiona productos');
    console.log('   - EmailNotificationService: Solo envía correos');
    console.log('   - ProductRepository: Solo persiste datos');
    console.log('');
    console.log('2️⃣  OCP (Abierto/Cerrado):');
    console.log('   - Múltiples clientes HTTP sin modificar NewsService');
    console.log('   - Fácil agregar nuevos servicios');
    console.log('');
    console.log('3️⃣  LSP (Sustitución de Liskov):');
    console.log('   - Todos los vehículos son intercambiables');
    console.log('   - Sin if/instanceof en código cliente');
    console.log('');
    console.log('4️⃣  ISP (Segregación de Interfaz):');
    console.log('   - Interfaces pequeñas y específicas');
    console.log('   - Cada ave implementa solo lo que necesita');
    console.log('');
    console.log('5️⃣  DIP (Inversión de Dependencias):');
    console.log('   - PostService depende de IDataProvider');
    console.log('   - Fácil cambiar entre Local, JSON, REST');
    console.log('');
    console.log('🔄 Resiliencia Transaccional:');
    console.log('   - Retry automático con backoff exponencial');
    console.log('   - Rollback en caso de error');
    console.log('   - Auditoría y logging detallado');
    console.log('');
    console.log('🎯 Resultado: Código mantenible, extensible y resiliente\n');
}

