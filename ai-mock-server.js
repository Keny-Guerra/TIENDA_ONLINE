/**
 * 🤖 AI Mock Server
 * Simula una API de IA local sin necesidad de Claude API
 * Para testing de n8n workflows
 */

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Simulación de recomendaciones de proveedores
const RECOMENDACIONES = {
  1: { proveedor_id: 1, razon: "Mejor precio en camisetas. TextilPeru ofrece descuento por volumen y entrega en 3 días" },
  2: { proveedor_id: 2, razon: "SportGear China tiene mejor calidad en zapatillas. Entrega en 7 días pero garantía de 1 año" },
  3: { proveedor_id: 3, razon: "Confecciones Brasil excelente para polos. Precio competitivo y entrega rápida en 2 días" },
  4: { proveedor_id: 4, razon: "Adidas Direct tiene stock garantizado. Marca reconocida, mejor para temas de calidad" },
  5: { proveedor_id: 5, razon: "Nike Distribution ideal para marcas premium. Mejor margen de ganancia a largo plazo" }
};

// Endpoint simulado de Claude/Ollama
app.post('/api/chat', (req, res) => {
  const { messages } = req.body;
  const lastMessage = messages[messages.length - 1].content;

  // Extraer información de la solicitud
  const productoMatch = lastMessage.match(/Producto ID:\s*(\d+)/i) || lastMessage.match(/product\s*(?:id)?:\s*(\d+)/i);
  const productoId = productoMatch ? parseInt(productoMatch[1]) : Math.floor(Math.random() * 5) + 1;

  // Obtener recomendación (simula lo que haría Claude)
  const recomendacion = RECOMENDACIONES[productoId] || RECOMENDACIONES[1];

  const respuesta = {
    proveedor_id: recomendacion.proveedor_id,
    razon: recomendacion.razon
  };

  console.log(`✅ [IA Mock] Producto ${productoId} → Proveedor ${respuesta.proveedor_id}`);

  res.json({
    choices: [
      {
        message: {
          content: JSON.stringify(respuesta)
        }
      }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Mock Server running' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🤖 AI MOCK SERVER RUNNING         ║
╚════════════════════════════════════════╝

URL: http://localhost:${PORT}
Health: http://localhost:${PORT}/health

Endpoints:
  POST /api/chat - Simula respuestas de IA

Status: ✅ Listo para n8n
  `);
});
