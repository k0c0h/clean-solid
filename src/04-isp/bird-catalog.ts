interface Bird {
    eat(): void;
    fly(): void;
    swim(): void;
}

export class Toucan implements Bird {
    public eat() { console.log('El Tucán está comiendo frutas.'); }
    public fly() { console.log('El Tucán vuela sobre la selva.'); }
    public swim() { console.log('El Tucán no suele nadar, pero implemento el método vacío.'); }
}

export class Hummingbird implements Bird {
    public eat() { console.log('El Colibrí busca néctar.'); }
    public fly() { console.log('El Colibrí aletea rápidamente.'); }
    public swim() { throw new Error('Un colibrí no puede nadar'); }
}

/**
 * VIOLACIÓN FLAGRANTE: El Avestruz es un ave, pero NO VUELA.
 * La interfaz Bird le obliga a implementar fly(), causando una excepción en tiempo de ejecución
 * o un comportamiento inesperado.
 */
export class Ostrich implements Bird {
    public eat() { console.log('El Avestruz come hierbas.'); }
    public fly() { 
        // ¡Error! Violación de ISP.
        throw new Error('Las avestruces NO vuelan.'); 
    }
    public swim() { console.log('El Avestruz puede nadar si es necesario.'); }
}
