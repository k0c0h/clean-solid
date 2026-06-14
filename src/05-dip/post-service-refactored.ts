export interface Post {
    id: number;
    title: string;
    body: string;
}

/**
 * Abstracción para fuentes de datos
 * El servicio de posts depende SOLO de esta interfaz
 */
export interface IDataProvider {
    getPosts(): Promise<Post[]>;
    getPostById(id: number): Promise<Post | undefined>;
    savePost(post: Post): Promise<void>;
}

/**
 * Abstracción para caché
 */
export interface ICache {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): void;
    clear(): void;
}

/**
 * Abstracción para logging
 */
export interface ILogger {
    log(message: string): void;
    error(message: string, error?: any): void;
}

// ========== IMPLEMENTACIONES DE BAJO NIVEL ==========

/**
 * Base de datos local
 */
export class LocalDatabaseService implements IDataProvider {
    private posts: Post[] = [
        { id: 1, title: 'Avistamiento de Jaguar', body: 'Se reportó un jaguar cerca del río.' },
        { id: 2, title: 'Nuevas Orquídeas', body: 'Han florecido las especies raras en el jardín botánico.' }
    ];

    async getPosts(): Promise<Post[]> {
        return [...this.posts];
    }

    async getPostById(id: number): Promise<Post | undefined> {
        return this.posts.find(p => p.id === id);
    }

    async savePost(post: Post): Promise<void> {
        const exists = this.posts.findIndex(p => p.id === post.id);
        if (exists >= 0) {
            this.posts[exists] = post;
        } else {
            this.posts.push(post);
        }
    }
}

/**
 * Base de datos JSON
 */
export class JsonDatabaseService implements IDataProvider {
    private posts: Post[] = [
        { id: 1, title: 'JSON Post 1', body: 'Contenido desde JSON' },
        { id: 2, title: 'JSON Post 2', body: 'Más contenido' }
    ];

    async getPosts(): Promise<Post[]> {
        return [...this.posts];
    }

    async getPostById(id: number): Promise<Post | undefined> {
        return this.posts.find(p => p.id === id);
    }

    async savePost(post: Post): Promise<void> {
        const exists = this.posts.findIndex(p => p.id === post.id);
        if (exists >= 0) {
            this.posts[exists] = post;
        } else {
            this.posts.push(post);
        }
    }
}

/**
 * API REST como proveedor de datos
 */
export class RestApiDataProvider implements IDataProvider {
    constructor(private baseUrl: string = 'https://jsonplaceholder.typicode.com') {}

    async getPosts(): Promise<Post[]> {
        try {
            const response = await fetch(`${this.baseUrl}/posts?_limit=5`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching from API:', error);
            return [];
        }
    }

    async getPostById(id: number): Promise<Post | undefined> {
        try {
            const response = await fetch(`${this.baseUrl}/posts/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching post from API:', error);
            return undefined;
        }
    }

    async savePost(post: Post): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                body: JSON.stringify(post)
            });
        } catch (error) {
            console.error('Error saving post to API:', error);
        }
    }
}

// ========== IMPLEMENTACIONES DE CACHÉ ==========

export class SimpleCache implements ICache {
    private store = new Map<string, { value: any; expiry?: number }>();

    get<T>(key: string): T | undefined {
        const item = this.store.get(key);
        if (!item) return undefined;

        if (item.expiry && Date.now() > item.expiry) {
            this.store.delete(key);
            return undefined;
        }

        return item.value as T;
    }

    set<T>(key: string, value: T, ttl?: number): void {
        this.store.set(key, {
            value,
            expiry: ttl ? Date.now() + ttl : undefined
        });
    }

    clear(): void {
        this.store.clear();
    }
}

// ========== IMPLEMENTACIONES DE LOGGER ==========

export class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }

    error(message: string, error?: any): void {
        console.error(`[ERROR] ${message}`, error);
    }
}

// ========== SERVICIO DE POSTS (NIVEL ALTO) ==========

/**
 * ✅ PostService SOLO depende de interfaces
 * ✅ No conoce detalles de LocalDatabase, JsonDatabase, etc
 * ✅ Usa inyección de dependencias en el constructor
 */
export class PostService {
    constructor(
        private dataProvider: IDataProvider,
        private cache: ICache,
        private logger: ILogger
    ) {}

    async getPosts(): Promise<Post[]> {
        this.logger.log('Obteniendo posts...');

        // Verificar caché
        const cached = this.cache.get<Post[]>('posts');
        if (cached) {
            this.logger.log('Posts obtenidos desde caché');
            return cached;
        }

        try {
            const posts = await this.dataProvider.getPosts();
            this.cache.set('posts', posts, 60000); // 1 minuto
            this.logger.log(`${posts.length} posts obtenidos`);
            return posts;
        } catch (error) {
            this.logger.error('Error obteniendo posts', error);
            throw error;
        }
    }

    async getPostById(id: number): Promise<Post | undefined> {
        this.logger.log(`Obteniendo post ${id}...`);

        const cacheKey = `post_${id}`;
        const cached = this.cache.get<Post>(cacheKey);
        if (cached) {
            this.logger.log(`Post ${id} obtenido desde caché`);
            return cached;
        }

        try {
            const post = await this.dataProvider.getPostById(id);
            if (post) {
                this.cache.set(cacheKey, post, 60000);
                this.logger.log(`Post ${id} obtenido exitosamente`);
            }
            return post;
        } catch (error) {
            this.logger.error(`Error obteniendo post ${id}`, error);
            throw error;
        }
    }

    async savePost(post: Post): Promise<void> {
        this.logger.log(`Guardando post ${post.id}...`);

        try {
            await this.dataProvider.savePost(post);
            this.cache.clear(); // Limpiar caché tras cambio
            this.logger.log(`Post ${post.id} guardado exitosamente`);
        } catch (error) {
            this.logger.error(`Error guardando post`, error);
            throw error;
        }
    }
}

// ========== FACTORY PARA INYECCIÓN DE DEPENDENCIAS ==========

export class PostServiceFactory {
    static createWithLocalDatabase(): PostService {
        return new PostService(
            new LocalDatabaseService(),
            new SimpleCache(),
            new ConsoleLogger()
        );
    }

    static createWithJsonDatabase(): PostService {
        return new PostService(
            new JsonDatabaseService(),
            new SimpleCache(),
            new ConsoleLogger()
        );
    }

    static createWithRestApi(): PostService {
        return new PostService(
            new RestApiDataProvider(),
            new SimpleCache(),
            new ConsoleLogger()
        );
    }

    /**
     * Crear con proveedor personalizado
     */
    static createCustom(
        provider: IDataProvider,
        cache: ICache,
        logger: ILogger
    ): PostService {
        return new PostService(provider, cache, logger);
    }
}

// ========== USO ==========

export async function useDIPExample() {
    console.log('\n=== REFACTORIZACIÓN DIP ===\n');

    try {
        // ✅ Cambiar proveedor de datos SIN modificar PostService
        const localService = PostServiceFactory.createWithLocalDatabase();
        console.log('--- Local Database ---');
        console.log(await localService.getPosts());

        const jsonService = PostServiceFactory.createWithJsonDatabase();
        console.log('\n--- JSON Database ---');
        console.log(await jsonService.getPosts());

        // Demostrar caché
        console.log('\n--- Caché en Acción ---');
        console.log('Primera llamada:');
        await localService.getPosts();
        console.log('\nSegunda llamada (desde caché):');
        await localService.getPosts();

    } catch (error) {
        console.error('Error:', error);
    }
}
