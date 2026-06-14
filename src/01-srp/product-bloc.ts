
/**
 * VIOLACIÓN AL PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP)
 * 
 * Este archivo muestra una clase "Dios" o un componente que hace demasiadas cosas.
 * En el contexto de la Reserva Ecológica, el ProductBloc gestiona el inventario de la tienda
 * de souvenirs y, al mismo tiempo, se encarga de las notificaciones por correo.
 */

interface Product {
    id: number;
    name: string;
}

export class ProductBloc {

    private products: Product[] = [];

    // Responsabilidad 1: Carga de productos (Lógica de Negocio/Persistencia)
    loadProduct(id: number) {
        console.log(`Cargando producto con ID: ${id} desde el inventario del parque...`);
        // Simulación de carga
        return this.products.find(p => p.id === id);
    }

    // Responsabilidad 2: Guardado de productos (Lógica de Persistencia)
    saveProduct(product: Product) {
        console.log(`Guardando el producto ${product.name} en la base de datos de la reserva...`);
        this.products.push(product);
    }

    // Responsabilidad 3: Envío de notificaciones (Servicio de Infraestructura)
    // ESTA ES LA VIOLACIÓN: El Bloc no debería saber CÓMO enviar correos electrónicos.
    notifyCustomer(email: string, message: string) {
        console.log(`[Mailer] Enviando correo a ${email}: ${message}`);
        // Lógica directa de envío de correo acoplada aquí
    }

}
