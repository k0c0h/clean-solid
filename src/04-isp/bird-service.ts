export interface Eater {
    eat(): void;
}

/**
 * Interface para aves que pueden volar
 */
export interface Flyer {
    fly(): void;
}

/**
 * Interface para aves que pueden nadar
 */
export interface Swimmer {
    swim(): void;
}

/**
 * Interface para características generales de aves
 */
export interface BirdInfo {
    name: string;
    habitat: string;
    getDescription(): string;
}

// ========== IMPLEMENTACIONES ESPECÍFICAS ==========

/**
 * Tucán: Come, Vuela, NO NADA
 * Solo implementa lo que realmente hace
 */
export class Toucan implements Eater, Flyer, BirdInfo {
    constructor(
        public name: string = 'Tucán',
        public habitat: string = 'Selva tropical'
    ) {}

    eat(): void {
        console.log('🍌 El Tucán está comiendo frutas.');
    }

    fly(): void {
        console.log('🦅 El Tucán vuela sobre la selva.');
    }

    getDescription(): string {
        return `${this.name}: Un ave colorida que habita en ${this.habitat}`;
    }
}

/**
 * Colibrí: Come, Vuela, NO NADA
 * Solo implementa lo que realmente necesita
 */
export class Hummingbird implements Eater, Flyer, BirdInfo {
    constructor(
        public name: string = 'Colibrí',
        public habitat: string = 'Jardín de flores'
    ) {}

    eat(): void {
        console.log('🌸 El Colibrí busca néctar.');
    }

    fly(): void {
        console.log('⚡ El Colibrí aletea rápidamente (100 aleteos/seg).');
    }

    getDescription(): string {
        return `${this.name}: Un ave diminuta que habita en ${this.habitat}`;
    }
}

/**
 * Avestruz: Come, NADA, NO VUELA
 * Implementa solo lo que le corresponde
 */
export class Ostrich implements Eater, Swimmer, BirdInfo {
    constructor(
        public name: string = 'Avestruz',
        public habitat: string = 'Sabana africana'
    ) {}

    eat(): void {
        console.log('🌱 El Avestruz come hierbas y semillas.');
    }

    swim(): void {
        console.log('🏊 El Avestruz puede nadar si es necesario.');
    }

    getDescription(): string {
        return `${this.name}: Ave no voladora que habita en ${this.habitat}`;
    }
}

/**
 * Pato: Come, Vuela, Nada
 * Implementa TODO lo que necesita
 */
export class Duck implements Eater, Flyer, Swimmer, BirdInfo {
    constructor(
        public name: string = 'Pato',
        public habitat: string = 'Lago'
    ) {}

    eat(): void {
        console.log('🌾 El Pato busca alimentos en el agua.');
    }

    fly(): void {
        console.log('✈️ El Pato vuela en formación V.');
    }

    swim(): void {
        console.log('🏊 El Pato nada con elegancia.');
    }

    getDescription(): string {
        return `${this.name}: Ave acuática que habita en ${this.habitat}`;
    }
}

/**
 * Búho: Come, Vuela, NO NADA
 */
export class Owl implements Eater, Flyer, BirdInfo {
    constructor(
        public name: string = 'Búho',
        public habitat: string = 'Bosque nocturno'
    ) {}

    eat(): void {
        console.log('🍗 El Búho caza roedores nocturnamente.');
    }

    fly(): void {
        console.log('🌙 El Búho vuela silenciosamente en la noche.');
    }

    getDescription(): string {
        return `${this.name}: Ave depredadora que habita en ${this.habitat}`;
    }
}

// ========== CATÁLOGO DE AVES ==========

export class BirdCatalog {
    /**
     * Hacer que todas las aves coman
     * Solo funciona con aves que implementan Eater
     */
    static feedAllEaters(eaters: Eater[]): void {
        console.log('\n--- Alimentando aves ---\n');
        eaters.forEach((eater, index) => {
            console.log(`[${index + 1}]`);
            eater.eat();
        });
    }

    /**
     * Hacer que todas las aves voladores vuelen
     * Solo funciona con aves que implementan Flyer
     */
    static launchFlyers(flyers: Flyer[]): void {
        console.log('\n--- Haciendo volar aves ---\n');
        flyers.forEach((flyer, index) => {
            console.log(`[${index + 1}]`);
            flyer.fly();
        });
    }

    /**
     * Hacer que todas las aves nadadoras naden
     */
    static launchSwimmers(swimmers: Swimmer[]): void {
        console.log('\n--- Haciendo nadar aves ---\n');
        swimmers.forEach((swimmer, index) => {
            console.log(`[${index + 1}]`);
            swimmer.swim();
        });
    }

    /**
     * Mostrar información de aves
     */
    static displayInfo(birds: BirdInfo[]): void {
        console.log('\n--- Información de Aves ---\n');
        birds.forEach(bird => {
            console.log(`📋 ${bird.getDescription()}`);
        });
    }

    /**
     * Simulador de día en el zoológico
     */
    static simulateDayAtZoo(birds: any[]): void {
        console.log('\n=== Un Día en el Zoológico ===\n');

        // Separar por capacidad
        const eaters = birds.filter((b: any) => typeof b.eat === 'function');
        const flyers = birds.filter((b: any) => typeof b.fly === 'function');
        const swimmers = birds.filter((b: any) => typeof b.swim === 'function');

        console.log(`Total de aves: ${birds.length}`);
        console.log(`Aves que comen: ${eaters.length}`);
        console.log(`Aves que vuelan: ${flyers.length}`);
        console.log(`Aves que nadan: ${swimmers.length}\n`);

        this.feedAllEaters(eaters);
        this.launchFlyers(flyers);
        this.launchSwimmers(swimmers);
    }
}

// ========== USO ==========

export function useISPExample() {
    console.log('\n=== REFACTORIZACIÓN ISP ===\n');

    // Crear aves
    const toucan = new Toucan();
    const hummingbird = new Hummingbird();
    const ostrich = new Ostrich();
    const duck = new Duck();
    const owl = new Owl();

    // Array de todas las aves
    const allBirds = [toucan, hummingbird, ostrich, duck, owl];
    const flyers = [toucan, hummingbird, duck, owl];
    const swimmers = [ostrich, duck];
    const eaters = allBirds;

    // ✅ Ya no hay errores de métodos faltantes
    // Cada ave solo implementa lo que necesita

    BirdCatalog.feedAllEaters(eaters);
    BirdCatalog.launchFlyers(flyers);
    BirdCatalog.launchSwimmers(swimmers);
    BirdCatalog.displayInfo(allBirds);

    // Simulación completa
    BirdCatalog.simulateDayAtZoo(allBirds);
}
