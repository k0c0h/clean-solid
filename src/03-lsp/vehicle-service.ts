/**
 * REFACTORIZACIÓN LSP - SUSTITUCIÓN DE LISKOV
 * 
 * Los objetos de clases derivadas deben poder sustituir a los de la clase base
 * sin romper la funcionalidad. Creamos una interfaz común que todos respetan.
 */

// ========== INTERFAZ BASE ==========

export interface Vehicle {
    model: string;
    startEngine(): void;
    stopEngine(): void;
    getInfo(): string;
}

// ========== IMPLEMENTACIONES ==========

export class Tesla implements Vehicle {
    constructor(public model: string, private batteryLevel: number = 100) {}

    startEngine(): void {
        console.log(`🔌 Tesla ${this.model}: Motor eléctrico iniciado`);
    }

    stopEngine(): void {
        console.log(`🔌 Tesla ${this.model}: Motor eléctrico detenido`);
    }

    getInfo(): string {
        return `Tesla ${this.model} - Batería: ${this.batteryLevel}% - Carga eléctrica al 100%`;
    }

    charge(): void {
        this.batteryLevel = 100;
        console.log('⚡ Cargando batería...');
    }
}

export class Audi implements Vehicle {
    constructor(public model: string, private fuelLevel: number = 100) {}

    startEngine(): void {
        console.log(`🏎️ Audi ${this.model}: Motor a gasolina iniciado`);
    }

    stopEngine(): void {
        console.log(`🏎️ Audi ${this.model}: Motor a gasolina detenido`);
    }

    getInfo(): string {
        return `Audi ${this.model} - Combustible: ${this.fuelLevel}% - Tracción Quattro activada`;
    }

    activateQuattro(): void {
        console.log('🏁 Tracción Quattro activada');
    }
}

export class Toyota implements Vehicle {
    constructor(public model: string) {}

    startEngine(): void {
        console.log(`🚗 Toyota ${this.model}: Motor híbrido iniciado`);
    }

    stopEngine(): void {
        console.log(`🚗 Toyota ${this.model}: Motor híbrido detenido`);
    }

    getInfo(): string {
        return `Toyota ${this.model} - Motor híbrido listo - Eficiencia: Máxima`;
    }

    optimizeEnergy(): void {
        console.log('⚙️ Optimizando consumo de energía...');
    }
}

export class Honda implements Vehicle {
    constructor(public model: string) {}

    startEngine(): void {
        console.log(`🏍️ Honda ${this.model}: Motor VTEC iniciado`);
    }

    stopEngine(): void {
        console.log(`🏍️ Honda ${this.model}: Motor VTEC detenido`);
    }

    getInfo(): string {
        return `Honda ${this.model} - VTEC activado - Rendimiento: Alto`;
    }

    enableVTEC(): void {
        console.log('🚀 VTEC activado a 5500 RPM');
    }
}

export class Ford implements Vehicle {
    constructor(public model: string) {}

    startEngine(): void {
        console.log(`🛻 Ford ${this.model}: Motor EcoBoost iniciado`);
    }

    stopEngine(): void {
        console.log(`🛻 Ford ${this.model}: Motor EcoBoost detenido`);
    }

    getInfo(): string {
        return `Ford ${this.model} - Built Tough - Potencia: Extrema`;
    }

    activateTerrain(): void {
        console.log('🏜️ Modo Todoterreno activado');
    }
}

// ========== GESTOR REFACTORIZADO ==========

/**
 * Ahora el VehicleManager trabaja SOLO con la interfaz Vehicle
 * No necesita conocer tipos específicos. LSP garantiza que todos funcionan igual.
 */
export class VehicleManager {
    static printVehicleDetails(vehicles: Vehicle[]): void {
        console.log('\n--- Detalles de Vehículos ---\n');
        
        vehicles.forEach(vehicle => {
            // ✅ Todos los vehículos funcionan IGUAL
            // No necesitamos if/instanceof
            vehicle.startEngine();
            console.log(vehicle.getInfo());
            vehicle.stopEngine();
            console.log('---');
        });
    }

    /**
     * Método extensible: nuevas marcas sin modificar este código
     */
    static performMaintenance(vehicles: Vehicle[]): void {
        console.log('\n--- Mantenimiento de Flota ---\n');
        
        vehicles.forEach(vehicle => {
            console.log(`Mantenimiento de ${vehicle.model}...`);
            vehicle.stopEngine();
            console.log(`✅ ${vehicle.model} listo para usar`);
            console.log('---');
        });
    }

    /**
     * Gestor de flota con estadísticas
     */
    static getFleetStats(vehicles: Vehicle[]): object {
        return {
            totalVehicles: vehicles.length,
            allReadyToUse: true, // Todos respetan la interfaz
            vehicles: vehicles.map(v => ({
                model: v.model,
                info: v.getInfo()
            }))
        };
    }
}

// ========== USO ==========

export function useLSPExample() {
    console.log('\n=== REFACTORIZACIÓN LSP ===\n');

    // Array de vehículos - todos son intercambiables
    const fleet: Vehicle[] = [
        new Tesla('Model S'),
        new Audi('Q7'),
        new Toyota('Prius'),
        new Honda('Civic'),
        new Ford('F-150')
    ];

    // ✅ Funciona perfectamente sin if/instanceof
    VehicleManager.printVehicleDetails(fleet);

    // Mantenimiento sin conocer tipos específicos
    VehicleManager.performMaintenance(fleet.slice(0, 2));

    // Estadísticas
    const stats = VehicleManager.getFleetStats(fleet);
    console.log('\nEstadísticas de Flota:', stats);
}
