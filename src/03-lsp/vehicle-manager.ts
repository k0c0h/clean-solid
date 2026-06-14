
/**
 * VIOLACIÓN AL PRINCIPIO DE SUSTITUCIÓN DE LISKOV (LSP)
 * 
 * En la flota de la reserva, intentamos manejar diversos vehículos.
 * Sin embargo, el cliente se ve obligado a conocer los detalles internos
 * de cada marca para poder operar, rompiendo la transparencia de la abstracción.
 */

export class Tesla { constructor(public model: string) {} }
export class Audi  { constructor(public model: string) {} }
export class Toyota{ constructor(public model: string) {} }
export class Honda { constructor(public model: string) {} }
export class Ford  { constructor(public model: string) {} }

export class VehicleManager {

    /**
     * VIOLACIÓN: Este método rompe LSP y OCP. 
     * Si agregamos una nueva marca (ej. Volvo), debemos venir aquí a agregar otro 'if' o 'case'.
     * Además, no podemos tratar a todos los vehículos por igual.
     */
    static printVehicleDetails( vehicles: (Tesla | Audi | Toyota | Honda | Ford)[] ) {
        
        vehicles.forEach( vehicle => {

            if( vehicle instanceof Tesla ) {
                console.log('Tesla Model:', vehicle.model, 'Carga eléctrica al 100%');
            }
            if( vehicle instanceof Audi ) {
                console.log('Audi Model:', vehicle.model, 'Tracción Quattro activada');
            }
            if( vehicle instanceof Toyota ) {
                console.log('Toyota Model:', vehicle.model, 'Motor híbrido listo');
            }
            if( vehicle instanceof Honda ) {
                console.log('Honda Model:', vehicle.model, 'VTEC activado');
            }
            if( vehicle instanceof Ford ) {
                console.log('Ford Model:', vehicle.model, 'Built Tough');
            }

        });
    }

}
