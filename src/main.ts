import './style.css'

// Importar ejemplos refactorizados
import { main } from './refactored-main'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>✨ Refactorización SOLID - Sistema de Reserva Ecológica</h1>
  <p>Consulta la consola de JavaScript para ver los ejemplos de:</p>
  <ul>
    <li>🏗️ SRP - Responsabilidad Única</li>
    <li>🔓 OCP - Abierto/Cerrado</li>
    <li>🚗 LSP - Sustitución de Liskov</li>
    <li>🦆 ISP - Segregación de Interfaz</li>
    <li>💉 DIP - Inversión de Dependencias</li>
    <li>🔄 Transacciones Resilientes</li>
  </ul>
  <p><strong>Status:</strong> ✅ Aplicación ejecutándose</p>
`

// Ejecutar ejemplo
main().catch(console.error)

