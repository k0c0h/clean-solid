
/**
 * VIOLACIÓN AL PRINCIPIO DE ABIERTO/CERRADO (OCP)
 * 
 * En este módulo de noticias de la reserva, el servicio depende directamente
 * de la librería externa 'axios'. Si quisiéramos usar 'fetch' u otra librería,
 * tendríamos que modificar este código interno.
 */

import axios from 'axios';

export class NewsService {

    // VIOLACIÓN: Dependencia rígida de axios.get()
    // Si la API cambia o queremos cambiar de cliente HTTP, este código debe "abrirse" para modificación.
    async getLatestNews() {
        console.log('Obteniendo noticias de la reserva biológica...');
        const resp = await axios.get('https://jsonplaceholder.typicode.com/posts');
        return resp.data;
    }

}

export class PhotosService {

    async getGallery() {
        // Otra violación repetida: si mañana axios desaparece, tenemos que buscar todos los archivos que lo usan.
        const resp = await axios.get('https://jsonplaceholder.typicode.com/photos');
        return resp.data;
    }

}
