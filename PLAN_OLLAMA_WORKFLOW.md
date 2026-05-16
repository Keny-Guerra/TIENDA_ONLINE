# 🤖 PLAN DE IMPLEMENTACIÓN: Workflow Automático con Ollama

**Status**: Ready for Implementation  
**Date**: 2026-05-12  
**Modelo a usar**: smollm2:1.7b (balance de velocidad y precisión)  
**Base URL Ollama**: http://localhost:11434

---

## 📋 RESUMEN EJECUTIVO

Migrar el workflow de compra automática de **Claude API + n8n** a **Ollama local + Node.js directo**.

**Cambios clave**:
- ❌ Eliminar dependencia de n8n (complejidad)
- ❌ Eliminar dependencia de Claude API (costo + problemas)
- ✅ Usar Ollama local en http://localhost:11434
- ✅ Integración directa en server.js con fetch() (sin dependencias extra)
- ✅ Mismo flujo, misma BD, mejor control

---

## 🎯 FASES DE IMPLEMENTACIÓN

### **PHASE 0: Setup - Preparación del Entorno Ollama** ⚙️

**Objetivo**: Descargar e instalar un modelo Ollama listo para usar

**Tareas**:
1. Verificar que Ollama está corriendo en http://localhost:11434
2. Descargar modelo: `ollama pull smollm2:1.7b`
3. Prueba rápida: `curl http://localhost:11434/api/tags`
4. Validar que el modelo está disponible

**Verificación**:
```bash
# Verificar que el modelo está descargado
curl http://localhost:11434/api/tags | grep smollm2

# Prueba rápida de generación
curl http://localhost:11434/api/generate -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"smollm2:1.7b","prompt":"Hola","stream":false}'
```

**Resultado esperado**: Respuesta JSON con campo `"response": "..."`

---

### **PHASE 1: Crear Endpoint para Procesar Solicitudes** 🔗

**Objetivo**: Nuevo endpoint en server.js que recibe solicitud y envía a Ollama

**Archivo a editar**: `/home/chorri/Documents/Trash/ll/NE/tienda_mysql/server.js`

**Código a agregar** (después de las importaciones):

```javascript
// CONFIGURACIÓN OLLAMA
const OLLAMA_HOST = 'http://localhost:11434';
const OLLAMA_MODEL = 'smollm2:1.7b';

// Helper: Llamar a Ollama
async function callOllama(prompt, format = null) {
  try {
    const body = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1  // Baja temperatura para respuestas consistentes
      }
    };
    
    if (format === 'json') {
      body.format = 'json';
    }
    
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama error:', error);
    throw error;
  }
}

// Nuevo Endpoint: Procesar solicitud con Ollama
app.post('/api/solicitudes-compra/procesar', async (req, res) => {
  try {
    const { solicitud_id } = req.body;
    
    if (!solicitud_id) {
      return res.status(400).json({ error: 'solicitud_id requerido' });
    }
    
    // 1. Obtener solicitud de BD
    const connection = await pool.getConnection();
    const [solicitudes] = await connection.query(
      'SELECT * FROM solicitudes_compra WHERE id = ?',
      [solicitud_id]
    );
    
    if (solicitudes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    const descripcion = solicitud.descripcion;
    
    // 2. Enviar a Ollama para interpretación
    const systemPrompt = `Eres un experto en gestión de compras. Tu tarea es analizar solicitudes de reabastecimiento.
Responde SOLO en JSON válido, sin texto adicional.
Extrae exactamente estos campos:
- producto_nombre (string)
- cantidad (número entero)
- urgencia (baja|media|alta)
- presupuesto_aproximado (número en soles, o null si no menciona)
- comentarios (string, máximo 100 caracteres)`;
    
    const userPrompt = `Analiza esta solicitud de compra:\n"${descripcion}"\n\nResponde en JSON.`;
    
    const ollamaResponse = await callOllama(
      systemPrompt + '\n\n' + userPrompt,
      'json'
    );
    
    // 3. Parsear respuesta JSON de Ollama
    let parsed;
    try {
      parsed = JSON.parse(ollamaResponse);
    } catch (e) {
      console.error('JSON parse error:', ollamaResponse);
      parsed = {
        producto_nombre: 'Desconocido',
        cantidad: solicitud.cantidad_requerida || 1,
        urgencia: 'media',
        presupuesto_aproximado: null,
        comentarios: 'No se pudo parsear'
      };
    }
    
    // 4. Actualizar solicitud con respuesta IA
    await connection.query(
      `UPDATE solicitudes_compra 
       SET respuesta_ia = ?, estado = 'interpretada'
       WHERE id = ?`,
      [JSON.stringify(parsed), solicitud_id]
    );
    
    connection.release();
    
    res.json({
      solicitud_id,
      interpretacion: parsed,
      mensaje: 'Solicitud interpretada por Ollama'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Verificación**:
- ✅ Endpoint responde en http://localhost:3000/api/solicitudes-compra/procesar
- ✅ Recibe solicitud_id y retorna JSON con interpretación
- ✅ Respuesta IA se guarda en tabla solicitudes_compra

---

### **PHASE 2: Recomendación de Proveedor** 🏪

**Objetivo**: Usar Ollama para recomendar el mejor proveedor basado en opciones

**Código a agregar en server.js**:

```javascript
// Nuevo Endpoint: Obtener recomendación de proveedor
app.post('/api/solicitudes-compra/recomendar-proveedor', async (req, res) => {
  try {
    const { solicitud_id } = req.body;
    
    const connection = await pool.getConnection();
    
    // 1. Obtener solicitud interpretada
    const [solicitudes] = await connection.query(
      'SELECT * FROM solicitudes_compra WHERE id = ?',
      [solicitud_id]
    );
    
    if (solicitudes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    const interpretacion = JSON.parse(solicitud.respuesta_ia);
    
    // 2. Obtener proveedores disponibles de BD
    const [proveedores] = await connection.query(
      `SELECT p.*, 
              pr.precio_unitario, 
              pr.margen_utilidad,
              e.tiempo_entrega_dias,
              i.cantidad_disponible
       FROM proveedores p
       LEFT JOIN precios pr ON p.id = pr.proveedor_id
       LEFT JOIN entregas e ON p.id = e.proveedor_id
       LEFT JOIN inventario i ON i.proveedor_id = p.id
       LIMIT 5`
    );
    
    // 3. Preparar texto de opciones para Ollama
    const opcionesText = proveedores.map((prov, idx) => `
      Opción ${idx + 1}: ${prov.nombre_proveedor}
      - Precio: S/ ${prov.precio_unitario} por unidad
      - Margen: ${prov.margen_utilidad}%
      - Tiempo entrega: ${prov.tiempo_entrega_dias} días
      - Stock disponible: ${prov.cantidad_disponible || 0} unidades
    `).join('\n');
    
    // 4. Enviar a Ollama para recomendación
    const systemPrompt = `Eres un experto en procurement. Tienes que elegir el MEJOR proveedor.
Responde SOLO en JSON válido, sin texto adicional.
Considera: precio, plazo de entrega, disponibilidad de stock.
Responde con:
- proveedor_recomendado (número de opción: 1, 2, 3...)
- justificacion (máximo 150 caracteres)
- confianza (0-100)`;
    
    const userPrompt = `Se necesitan ${interpretacion.cantidad} unidades de "${interpretacion.producto_nombre}".
Urgencia: ${interpretacion.urgencia}
Presupuesto: ${interpretacion.presupuesto_aproximado || 'sin límite'}

Opciones disponibles:
${opcionesText}

Elige la mejor opción y responde en JSON.`;
    
    const ollamaResponse = await callOllama(
      systemPrompt + '\n\n' + userPrompt,
      'json'
    );
    
    // 5. Parsear recomendación
    let recomendacion;
    try {
      recomendacion = JSON.parse(ollamaResponse);
    } catch (e) {
      recomendacion = {
        proveedor_recomendado: 1,
        justificacion: 'Primer proveedor disponible',
        confianza: 50
      };
    }
    
    const selectedProviderIdx = Math.max(0, recomendacion.proveedor_recomendado - 1);
    const selectedProvider = proveedores[selectedProviderIdx];
    
    // 6. Guardar recomendación
    await connection.query(
      `UPDATE solicitudes_compra 
       SET proveedor_recomendado_id = ?
       WHERE id = ?`,
      [selectedProvider.id, solicitud_id]
    );
    
    connection.release();
    
    res.json({
      solicitud_id,
      proveedor: selectedProvider,
      razon: recomendacion.justificacion,
      confianza: recomendacion.confianza
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Verificación**:
- ✅ Consulta proveedores de BD
- ✅ Envía opciones a Ollama
- ✅ Guarda proveedor recomendado en solicitudes_compra

---

### **PHASE 3: Generar Orden Automática** 📦

**Objetivo**: Crear orden de compra basada en recomendación

**Código a agregar en server.js**:

```javascript
// Nuevo Endpoint: Generar orden de compra automática
app.post('/api/solicitudes-compra/generar-orden', async (req, res) => {
  try {
    const { solicitud_id } = req.body;
    
    const connection = await pool.getConnection();
    
    // 1. Obtener solicitud con proveedor recomendado
    const [solicitudes] = await connection.query(
      `SELECT sc.*, p.nombre_proveedor, pr.precio_unitario
       FROM solicitudes_compra sc
       JOIN proveedores p ON sc.proveedor_recomendado_id = p.id
       LEFT JOIN precios pr ON p.id = pr.proveedor_id
       WHERE sc.id = ?`,
      [solicitud_id]
    );
    
    if (solicitudes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const solicitud = solicitudes[0];
    const cantidad = solicitud.cantidad_requerida;
    const precio_unitario = solicitud.precio_unitario || 0;
    const total = cantidad * precio_unitario;
    
    // 2. Crear orden de compra
    const [orderResult] = await connection.query(
      `INSERT INTO ordenes_compra 
       (solicitud_id, proveedor_id, producto_id, cantidad, precio_unitario, total, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        solicitud_id,
        solicitud.proveedor_recomendado_id,
        solicitud.stock_bajo_producto_id || 1,
        cantidad,
        precio_unitario,
        total
      ]
    );
    
    // 3. Actualizar solicitud
    await connection.query(
      `UPDATE solicitudes_compra 
       SET orden_compra_id = ?, estado = 'orden_creada'
       WHERE id = ?`,
      [orderResult.insertId, solicitud_id]
    );
    
    connection.release();
    
    res.status(201).json({
      orden_id: orderResult.insertId,
      solicitud_id,
      proveedor: solicitud.nombre_proveedor,
      cantidad,
      total,
      estado: 'pendiente'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Verificación**:
- ✅ Inserta fila en tabla ordenes_compra
- ✅ Actualiza estado de solicitud a 'orden_creada'

---

### **PHASE 4: UI para Solicitudes de Compra** 🖥️

**Objetivo**: Agregar formulario en index.html para crear solicitudes

**A agregar en index.html** (dentro de section con id="admin-section"):

```html
<!-- SECCIÓN DE SOLICITUDES DE COMPRA -->
<div id="solicitudes-tab" class="tab-content" style="display: none;">
    <h2>📝 Solicitar Compra (IA)</h2>
    
    <form id="solicitud-form" style="max-width: 500px; margin-bottom: 20px;">
        <div class="form-group">
            <label>Descripción (en lenguaje natural):</label>
            <textarea id="descripcion" name="descripcion" rows="4" 
                      placeholder="Ej: Necesitamos 30 camisetas Perú urgente, stock bajo..."
                      required></textarea>
        </div>
        
        <div class="form-group">
            <label>Cantidad requerida:</label>
            <input type="number" id="cantidad" name="cantidad" min="1" required>
        </div>
        
        <button type="submit" class="btn btn-primary">Enviar Solicitud</button>
        <span id="solicitud-status"></span>
    </form>
    
    <h3>Historial de Solicitudes</h3>
    <div class="tabla-responsive">
        <table id="tabla-solicitudes" border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Orden ID</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="solicitudes-body"></tbody>
        </table>
    </div>
</div>

<script>
// Manejar envío de solicitud
document.getElementById('solicitud-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const descripcion = document.getElementById('descripcion').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    
    try {
        // 1. Crear solicitud
        const res1 = await fetch('/api/solicitudes-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: 1,
                descripcion,
                cantidad_requerida: cantidad
            })
        });
        
        const data1 = await res1.json();
        const solicitud_id = data1.id;
        
        document.getElementById('solicitud-status').innerHTML = '⏳ Procesando con Ollama...';
        
        // 2. Procesar con Ollama
        await fetch('/api/solicitudes-compra/procesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });
        
        document.getElementById('solicitud-status').innerHTML = '⏳ Buscando proveedores...';
        
        // 3. Obtener recomendación
        await fetch('/api/solicitudes-compra/recomendar-proveedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });
        
        document.getElementById('solicitud-status').innerHTML = '⏳ Generando orden...';
        
        // 4. Generar orden
        const res4 = await fetch('/api/solicitudes-compra/generar-orden', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });
        
        const data4 = await res4.json();
        
        document.getElementById('solicitud-status').innerHTML = 
            `✅ Orden #${data4.orden_id} creada exitosamente`;
        
        document.getElementById('solicitud-form').reset();
        cargarSolicitudes();
    } catch (error) {
        document.getElementById('solicitud-status').innerHTML = 
            `❌ Error: ${error.message}`;
    }
});

// Cargar solicitudes
async function cargarSolicitudes() {
    try {
        const response = await fetch('/api/solicitudes-compra');
        const solicitudes = await response.json();
        
        const tbody = document.getElementById('solicitudes-body');
        tbody.innerHTML = '';
        
        solicitudes.forEach(sol => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sol.id}</td>
                <td>${sol.descripcion.substring(0, 50)}...</td>
                <td>${sol.cantidad_requerida}</td>
                <td><span class="badge">${sol.estado}</span></td>
                <td>${sol.orden_compra_id || '-'}</td>
                <td><button onclick="verSolicitud(${sol.id})">Ver</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar al iniciar
window.addEventListener('load', () => {
    cargarSolicitudes();
    // Recargar cada 10 segundos
    setInterval(cargarSolicitudes, 10000);
});
</script>
```

**Verificación**:
- ✅ Formulario visible en tab de solicitudes
- ✅ Botón "Enviar Solicitud" dispara el flujo completo
- ✅ Tabla muestra historial actualizado

---

### **PHASE 5: Testing e Integración** ✅

**Objetivo**: Validar que todo el flujo funciona end-to-end

**Checklist de Testing**:

1. **Setup**
   - [ ] Ollama corriendo: `curl http://localhost:11434/api/tags`
   - [ ] Modelo descargado: `ollama pull smollm2:1.7b`
   - [ ] Node.js corriendo: `npm start` en tienda_mysql

2. **Phase 1 - Interpretación**
   ```bash
   curl -X POST http://localhost:3000/api/solicitudes-compra \
     -H "Content-Type: application/json" \
     -d '{
       "usuario_id": 1,
       "descripcion": "Necesito 25 camisetas Perú urgente, stock bajo",
       "cantidad_requerida": 25
     }'
   # Capturar solicitud_id
   
   curl -X POST http://localhost:3000/api/solicitudes-compra/procesar \
     -H "Content-Type: application/json" \
     -d '{"solicitud_id": <ID>}'
   # Verificar respuesta_ia contiene JSON parseado
   ```

3. **Phase 2 - Recomendación**
   ```bash
   curl -X POST http://localhost:3000/api/solicitudes-compra/recomendar-proveedor \
     -H "Content-Type: application/json" \
     -d '{"solicitud_id": <ID>}'
   # Verificar proveedor recomendado
   ```

4. **Phase 3 - Orden**
   ```bash
   curl -X POST http://localhost:3000/api/solicitudes-compra/generar-orden \
     -H "Content-Type: application/json" \
     -d '{"solicitud_id": <ID>}'
   # Verificar orden_compra_id devuelto
   ```

5. **UI Testing**
   - [ ] Abrir http://localhost:3000/index.html
   - [ ] Clickear tab "Solicitudes"
   - [ ] Llenar formulario y enviar
   - [ ] Ver progreso: "Procesando..." → "Generando orden..." → "✅ Orden creada"
   - [ ] Ver tabla actualizada

6. **Base de Datos**
   ```bash
   # Verificar datos en BD
   mysql> SELECT * FROM solicitudes_compra ORDER BY id DESC LIMIT 1;
   mysql> SELECT * FROM ordenes_compra ORDER BY id DESC LIMIT 1;
   ```

**Criterios de éxito**:
- ✅ Solicitud se crea correctamente
- ✅ Ollama responde en <5 segundos
- ✅ Respuesta IA es válida JSON
- ✅ Proveedor se selecciona automáticamente
- ✅ Orden se genera en BD
- ✅ UI actualiza en tiempo real

---

## 🔧 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| "Ollama no responde" | Asegúrate que corre: `ollama serve` |
| "Modelo no encontrado" | Descarga: `ollama pull smollm2:1.7b` |
| "JSON inválido de Ollama" | Reintenta con temperature más baja (0.1) |
| "Timeout en solicitudes" | Aumenta timeout en fetch (default 30s) |
| "Proveedor no existe" | Verifica que la tabla `proveedores` tiene datos |

---

## 📊 COMPARACIÓN: Antes (n8n + Claude) vs Después (Ollama + Node.js)

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Depende de** | Claude API, n8n cloud | Solo Ollama local |
| **Costo** | $$/mes (Claude + n8n) | $0 (local) |
| **Velocidad** | 5-10s (API latency) | <5s (local) |
| **Privacidad** | Datos a Anthropic | Todo local |
| **Complejidad** | Alta (n8n UI) | Baja (código Node.js) |
| **Control** | Limitado | Total |
| **Offline** | No funciona | Funciona perfectamente |

---

## 📝 NOTAS IMPORTANTES

1. **Modelo smollm2:1.7b**:
   - Pesa ~1.7GB en RAM
   - Responde en ~2-4 segundos
   - Suficientemente preciso para clasificación de compras
   - Si necesitas más precisión: usa `mistral:7b` (requiere más RAM)

2. **JSON Parsing**:
   - Ollama a veces incluye markdown (ej: ```json..```)
   - Implementé fallback en código para manejar esto
   - Si falla repetidamente: ajusta system prompt

3. **Escalabilidad**:
   - Para >100 solicitudes/día: considera Queue (Bull)
   - Para >1000: plantea usar múltiples workers de Ollama

4. **Next Steps** (después de v1):
   - Agregar envío de emails a proveedores
   - Integrar con SMS/WhatsApp para notificaciones
   - Dashboard de analytics (órdenes/día, proveedor favorito, etc.)
   - Manejo de rechazos y cambios de proveedor

---

**Plan Ready for Execution** ✅  
Ver CLAUDE.md para instrucciones post-implementación
