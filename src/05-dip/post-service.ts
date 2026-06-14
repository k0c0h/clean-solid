import { LocalDatabaseService } from '../data/local-database';

export class PostService {

    private posts: any[] = [];

    async getPosts() {
        /**
         * VIOLACIÓN: Instanciación directa de una dependencia.
         * No podemos inyectar un proveedor diferente (como JsonDatabaseService)
         * sin modificar el constructor o este método. 
         * El nivel superior (PostService) depende del nivel inferior (LocalDatabaseService).
         */
        const databaseProvider = new LocalDatabaseService();
        this.posts = await databaseProvider.getFakePosts();

        return this.posts;
    }

}
