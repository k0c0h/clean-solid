// ========== INTERFACES ==========

export interface IHttpClient {
    get<T>(url: string): Promise<T>;
    post<T>(url: string, data: any): Promise<T>;
}

export interface INewsProvider {
    getLatestNews(): Promise<any>;
}

// ========== IMPLEMENTACIONES DE HTTP CLIENT ==========

/**
 * Implementación compatible con el nombre original "AxiosHttpClient",
 * pero sin depender del paquete axios para evitar errores de resolución.
 */
export class AxiosHttpClient implements IHttpClient {
    async get<T>(url: string): Promise<T> {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json() as T;
        } catch (error) {
            console.error(`Error en GET ${url}:`, error);
            throw error;
        }
    }

    async post<T>(url: string, data: any): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json() as T;
        } catch (error) {
            console.error(`Error en POST ${url}:`, error);
            throw error;
        }
    }
}

/**
 * Implementación con Fetch (extensión sin tocar NewsService)
 */
export class FetchHttpClient implements IHttpClient {
    async get<T>(url: string): Promise<T> {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json() as T;
        } catch (error) {
            console.error(`Error en GET ${url}:`, error);
            throw error;
        }
    }

    async post<T>(url: string, data: any): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json() as T;
        } catch (error) {
            console.error(`Error en POST ${url}:`, error);
            throw error;
        }
    }
}

/**
 * Implementación mock para pruebas
 */
export class MockHttpClient implements IHttpClient {
    async get<T>(url: string): Promise<T> {
        console.log(`[Mock] GET ${url}`);
        return {
            id: 1,
            title: 'Mock News',
            body: 'This is a mock response'
        } as T;
    }

    async post<T>(url: string, data: any): Promise<T> {
        console.log(`[Mock] POST ${url}`, data);
        return { success: true, ...data } as T;
    }
}

// ========== SERVICIOS (CERRADOS PARA MODIFICACIÓN) ==========

/**
 * Servicio de noticias - ABIERTO para extensión, CERRADO para modificación
 * No conoce detalles de cómo se obtienen los datos
 */
export class NewsService implements INewsProvider {
    constructor(private httpClient: IHttpClient) {}

    async getLatestNews() {
        try {
            console.log('Obteniendo noticias de la reserva biológica...');
            const news = await this.httpClient.get<any[]>(
                'https://jsonplaceholder.typicode.com/posts'
            );
            return news.slice(0, 5); // Primeras 5 noticias
        } catch (error) {
            console.error('Error obteniendo noticias:', error);
            throw error;
        }
    }
}

/**
 * Servicio de galería
 */
export class PhotosService implements INewsProvider {
    constructor(private httpClient: IHttpClient) {}

    async getLatestNews() {
        try {
            console.log('Obteniendo galería de fotos...');
            const photos = await this.httpClient.get<any[]>(
                'https://jsonplaceholder.typicode.com/photos'
            );
            return photos.slice(0, 10); // Primeras 10 fotos
        } catch (error) {
            console.error('Error obteniendo fotos:', error);
            throw error;
        }
    }
}

/**
 * Servicios adicionales sin modificar servicios existentes
 */
export class VideoService implements INewsProvider {
    constructor(private httpClient: IHttpClient) {}

    async getLatestNews() {
        try {
            console.log('Obteniendo videos de la reserva...');
            const videos = await this.httpClient.get<any[]>(
                'https://jsonplaceholder.typicode.com/comments'
            );
            return videos.slice(0, 5);
        } catch (error) {
            console.error('Error obteniendo videos:', error);
            throw error;
        }
    }
}

// ========== FACTORY PATTERN ==========

export class HttpClientFactory {
    static create(type: 'axios' | 'fetch' | 'mock' = 'axios'): IHttpClient {
        switch (type) {
            case 'fetch':
                return new FetchHttpClient();
            case 'mock':
                return new MockHttpClient();
            case 'axios':
            default:
                return new AxiosHttpClient();
        }
    }
}

// ========== USO ==========

export async function useOCPExample() {
    console.log('\n=== REFACTORIZACIÓN OCP ===\n');

    try {
        // Usar con Axios
        const axiosClient = HttpClientFactory.create('axios');
        const newsService = new NewsService(axiosClient);
        console.log('Noticias:', await newsService.getLatestNews());

        // Cambiar a Mock sin modificar NewsService
        const mockClient = HttpClientFactory.create('mock');
        const mockNewsService = new NewsService(mockClient);
        console.log('\nNoticias (Mock):', await mockNewsService.getLatestNews());

        // Agregar nuevo servicio de videos sin tocar código existente
        const videosService = new VideoService(axiosClient);
        console.log('\nVideos:', await videosService.getLatestNews());
    } catch (error) {
        console.error('Error:', error);
    }
}
