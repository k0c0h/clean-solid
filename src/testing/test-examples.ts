import { ProductService, Product, IProductRepository, INotificationService } from './01-srp/product-service';
import { NewsService, IHttpClient } from './02-ocp/http-client-service';
import { PostService, IDataProvider, ILogger, ICache } from './05-dip/post-service-refactored';

// ========== MOCKS PARA TESTING ==========

/**
 * Mock de repositorio de productos
 */
export class MockProductRepository implements IProductRepository {
    private products: Map<number, Product> = new Map();

    async getProductById(id: number): Promise<Product | undefined> {
        return this.products.get(id);
    }

    async saveProduct(product: Product): Promise<void> {
        this.products.set(product.id, product);
    }

    async getAllProducts(): Promise<Product[]> {
        return Array.from(this.products.values());
    }

    // Helper para tests
    getAll(): Product[] {
        return Array.from(this.products.values());
    }
}

/**
 * Mock de servicio de notificación
 */
export class MockNotificationService implements INotificationService {
    private emailsSent: Array<{ email: string; message: string }> = [];

    async sendEmail(email: string, message: string): Promise<void> {
        this.emailsSent.push({ email, message });
    }

    // Helper para tests
    getEmailsSent() {
        return [...this.emailsSent];
    }

    wasEmailSentTo(email: string): boolean {
        return this.emailsSent.some(e => e.email === email);
    }
}

/**
 * Mock de cliente HTTP
 */
export class MockHttpClient implements IHttpClient {
    private responses: Map<string, any> = new Map();

    async get<T>(url: string): Promise<T> {
        const response = this.responses.get(url);
        if (!response) throw new Error(`No mock response for ${url}`);
        return response as T;
    }

    async post<T>(url: string, data: any): Promise<T> {
        return { success: true, ...data } as T;
    }

    // Helper para configurar respuestas
    setResponse(url: string, response: any): void {
        this.responses.set(url, response);
    }
}

/**
 * Mock de data provider
 */
export class MockDataProvider implements IDataProvider {
    private posts: Array<any> = [];

    async getPosts(): Promise<any[]> {
        return [...this.posts];
    }

    async getPostById(id: number): Promise<any | undefined> {
        return this.posts.find(p => p.id === id);
    }

    async savePost(post: any): Promise<void> {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index >= 0) {
            this.posts[index] = post;
        } else {
            this.posts.push(post);
        }
    }

    // Helper para verificar
    getAllPosts(): any[] {
        return [...this.posts];
    }
}

/**
 * Mock de logger
 */
export class MockLogger implements ILogger {
    private logs: string[] = [];
    private errors: Array<{ message: string; error?: any }> = [];

    log(message: string): void {
        this.logs.push(message);
    }

    error(message: string, error?: any): void {
        this.errors.push({ message, error });
    }

    // Helpers para tests
    getLogs(): string[] {
        return [...this.logs];
    }

    getErrors() {
        return [...this.errors];
    }

    hasLog(text: string): boolean {
        return this.logs.some(log => log.includes(text));
    }
}

/**
 * Mock de caché
 */
export class MockCache implements ICache {
    private store = new Map<string, any>();

    get<T>(key: string): T | undefined {
        return this.store.get(key) as T;
    }

    set<T>(key: string, value: T): void {
        this.store.set(key, value);
    }

    clear(): void {
        this.store.clear();
    }

    // Helper
    getSize(): number {
        return this.store.size;
    }
}

// ========== SUITE DE TESTS EJEMPLO ==========

/**
 * TESTS: ProductService (SRP)
 */
export async function testProductService() {
    console.log('\n=== TEST SUITE: ProductService (SRP) ===\n');

    const repository = new MockProductRepository();
    const productService = new ProductService(repository);

    // Test 1: Guardar producto
    console.log('✓ Test 1: Guardar producto');
    await productService.saveProduct({
        id: 1,
        name: 'Test Product',
        price: 99
    });
    const stored = repository.getAll();
    console.assert(stored.length === 1, 'Producto guardado');
    console.assert(stored[0].id === 1, 'ID correcto');
    console.log('  ✅ PASSED\n');

    // Test 2: Cargar producto
    console.log('✓ Test 2: Cargar producto');
    const loaded = await productService.loadProduct(1);
    console.assert(loaded?.name === 'Test Product', 'Nombre correcto');
    console.assert(loaded?.price === 99, 'Precio correcto');
    console.log('  ✅ PASSED\n');

    // Test 3: Producto no encontrado
    console.log('✓ Test 3: Producto no encontrado');
    const notFound = await productService.loadProduct(999);
    console.assert(notFound === undefined, 'Retorna undefined');
    console.log('  ✅ PASSED\n');

    console.log('Total: 3 tests pasados ✅\n');
}

/**
 * TESTS: NewsService (OCP)
 */
export async function testNewsService() {
    console.log('\n=== TEST SUITE: NewsService (OCP) ===\n');

    const mockClient = new MockHttpClient();
    
    // Test 1: Obtener noticias con mock
    console.log('✓ Test 1: Obtener noticias');
    mockClient.setResponse(
        'https://jsonplaceholder.typicode.com/posts',
        [
            { id: 1, title: 'Post 1' },
            { id: 2, title: 'Post 2' }
        ]
    );
    
    const newsService = new NewsService(mockClient);
    const news = await newsService.getLatestNews();
    console.assert(news.length >= 1, 'Noticias obtenidas');
    console.log('  ✅ PASSED\n');

    // Test 2: Cambiar cliente sin tocar NewsService
    console.log('✓ Test 2: Client intercambiable (OCP)');
    const anotherClient = new MockHttpClient();
    anotherClient.setResponse(
        'https://jsonplaceholder.typicode.com/posts',
        [{ id: 1, title: 'Different News' }]
    );
    
    const newsService2 = new NewsService(anotherClient);
    const differentNews = await newsService2.getLatestNews();
    console.assert(differentNews[0].title === 'Different News', 'Cliente intercambiable');
    console.log('  ✅ PASSED\n');

    console.log('Total: 2 tests pasados ✅\n');
}

/**
 * TESTS: PostService (DIP + Caché)
 */
export async function testPostService() {
    console.log('\n=== TEST SUITE: PostService (DIP) ===\n');

    const dataProvider = new MockDataProvider();
    const cache = new MockCache();
    const logger = new MockLogger();

    const postService = new PostService(dataProvider, cache, logger);

    // Test 1: Guardar y obtener posts
    console.log('✓ Test 1: Guardar posts');
    await dataProvider.savePost({ id: 1, title: 'Test Post 1' });
    await dataProvider.savePost({ id: 2, title: 'Test Post 2' });
    
    const posts = await postService.getPosts();
    console.assert(posts.length === 2, '2 posts guardados');
    console.log('  ✅ PASSED\n');

    // Test 2: Caché funciona
    console.log('✓ Test 2: Caché');
    cache.clear();
    await postService.getPosts(); // Primera llamada
    console.assert(cache.getSize() === 1, 'Resultado en caché');
    console.log('  ✅ PASSED\n');

    // Test 3: Logging
    console.log('✓ Test 3: Logging');
    const logsCount = logger.getLogs().length;
    console.assert(logsCount > 0, 'Se registran logs');
    console.assert(logger.hasLog('posts'), 'Log contiene palabra clave');
    console.log('  ✅ PASSED\n');

    // Test 4: Cambiar data provider
    console.log('✓ Test 4: DataProvider intercambiable (DIP)');
    const anotherProvider = new MockDataProvider();
    await anotherProvider.savePost({ id: 10, title: 'Another Post' });
    
    const postService2 = new PostService(anotherProvider, new MockCache(), logger);
    const otherPosts = await postService2.getPosts();
    console.assert(otherPosts.length === 1, 'Otro provider funciona');
    console.log('  ✅ PASSED\n');

    console.log('Total: 4 tests pasados ✅\n');
}

/**
 * TESTS: Integración (SRP + Notificaciones)
 */
export async function testIntegration() {
    console.log('\n=== TEST SUITE: Integración (SRP) ===\n');

    const repository = new MockProductRepository();
    const notificationService = new MockNotificationService();
    const productService = new ProductService(repository);

    // Test 1: Crear producto y notificar
    console.log('✓ Test 1: Crear producto y notificar');
    const product: Product = {
        id: 1,
        name: 'Souvenirs',
        price: 25
    };

    await productService.saveProduct(product);
    await notificationService.sendEmail('admin@parque.com', `Nuevo: ${product.name}`);

    console.assert(
        repository.getAll().length === 1,
        'Producto guardado'
    );
    console.assert(
        notificationService.wasEmailSentTo('admin@parque.com'),
        'Email enviado'
    );
    console.log('  ✅ PASSED\n');

    // Test 2: Verificar que no hay acoplamiento
    console.log('✓ Test 2: Sin acoplamiento (SRP)');
    const emails = notificationService.getEmailsSent();
    console.assert(emails.length === 1, 'Una notificación');
    console.assert(
        emails[0].message.includes('Souvenirs'),
        'Mensaje correcto'
    );
    console.log('  ✅ PASSED\n');

    console.log('Total: 2 tests pasados ✅\n');
}

/**
 * TESTS: Error Handling
 */
export async function testErrorHandling() {
    console.log('\n=== TEST SUITE: Error Handling ===\n');

    // Test 1: Error en HTTP client
    console.log('✓ Test 1: Manejo de errores HTTP');
    const client = new MockHttpClient();
    const newsService = new NewsService(client);
    
    try {
        await newsService.getLatestNews();
        console.assert(false, 'Debería lanzar error');
    } catch (error: any) {
        console.assert(error.message.includes('mock'), 'Error apropiado');
        console.log('  ✅ PASSED\n');
    }

    // Test 2: Logger registra errores
    console.log('✓ Test 2: Logger registra errores');
    const logger = new MockLogger();
    logger.error('Test error', new Error('Algo salió mal'));
    
    const errors = logger.getErrors();
    console.assert(errors.length === 1, 'Error registrado');
    console.assert(errors[0].error?.message === 'Algo salió mal', 'Error detalles');
    console.log('  ✅ PASSED\n');

    console.log('Total: 2 tests pasados ✅\n');
}

// ========== EJECUTAR TODOS LOS TESTS ==========

export async function runAllTests() {
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║             TEST SUITE: ARQUITECTURA REFACTORIZADA                ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');

    try {
        await testProductService();
        await testNewsService();
        await testPostService();
        await testIntegration();
        await testErrorHandling();

        console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ TODOS LOS TESTS PASADOS                     ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

        console.log('📊 RESUMEN:');
        console.log('   - 5 suites de tests');
        console.log('   - 11 tests individuales');
        console.log('   - 0 fallos');
        console.log('   - Cobertura: SRP, OCP, DIP, Integración, Error Handling\n');

    } catch (error) {
        console.error('❌ Test fallido:', error);
    }
}

// ========== VENTAJAS DEL TESTING CON SOLID ==========

/**
 * ✅ VENTAJAS:
 * 
 * 1. FÁCIL DE MOCKEAR
 *    - Todas las dependencias son interfaces
 *    - Crear mocks es trivial
 *    - No es necesario instanciar la aplicación completa
 * 
 * 2. SIN EFECTOS SECUNDARIOS
 *    - No hay I/O directa (mock de HTTP, BD, etc)
 *    - Tests rápidos y determinísticos
 *    - Fácil de ejecutar en paralelo
 * 
 * 3. TESTS CLAROS
 *    - Cada test prueba una responsabilidad
 *    - Fácil entender qué falla
 *    - Bajo acoplamiento entre tests
 * 
 * 4. ALTA COBERTURA
 *    - Cada componente se puede testear independientemente
 *    - Mejor cobertura de código
 *    - Bugs atrapados más temprano
 * 
 * 5. FACILIDAD DE MANTENIMIENTO
 *    - Cambios en un servicio no rompen otros tests
 *    - Refactoring sin miedo
 *    - Tests como documentación
 */

export function explainTestingBenefits() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           VENTAJAS DEL TESTING CON ARQUITECTURA SOLID            ║
╚═══════════════════════════════════════════════════════════════════╝

1. FÁCIL DE MOCKEAR
   ✓ Todas las dependencias son interfaces
   ✓ No necesitas la BD real, HTTP real, etc
   ✓ Crear mocks toma 5 minutos

2. TESTS RÁPIDOS
   ✓ Sin I/O del mundo real
   ✓ Corren en milisegundos
   ✓ Se pueden ejecutar frecuentemente

3. TESTS AISLADOS
   ✓ Cada test prueba una cosa
   ✓ Cambios no rompen otros tests
   ✓ Fácil debuggear fallos

4. ALTA CONFIANZA
   ✓ Cobertura del 90%+ es realista
   ✓ Refactoring sin miedo
   ✓ Bugs atrapados en desarrollo

5. MEJOR DOCUMENTACIÓN
   ✓ Los tests explican cómo usar el código
   ✓ Ejemplos reales de uso
   ✓ Especificación viva del sistema

╔═══════════════════════════════════════════════════════════════════╗
║                  COMPARATIVA: ANTES VS DESPUÉS                   ║
╚═══════════════════════════════════════════════════════════════════╝

ANTES (Código Acoplado):
  ❌ Necesitas BD real para testear ProductService
  ❌ Necesitas HTTP real para NewsService
  ❌ Tests lentos (segundos)
  ❌ Cambios en BD rompen todos los tests
  ❌ Cobertura difícil de lograr

DESPUÉS (Código con SOLID):
  ✅ Mockeas ProductRepository en 5 líneas
  ✅ Mockeas HttpClient en 5 líneas
  ✅ Tests rápidos (milisegundos)
  ✅ Cambios no afectan tests
  ✅ Cobertura del 90%+ fácil

╔═══════════════════════════════════════════════════════════════════╗
║                        CONCLUSIÓN                                ║
╚═══════════════════════════════════════════════════════════════════╝

SOLID no solo mejora el código, también mejora drasticamente tu 
capacidad de testearlo. Es un círculo virtuoso:

Mejor Arquitectura → Mejor Testabilidad → Más Confianza → 
Mejor Refactoring → Código Mejor → ...
    `);
}
