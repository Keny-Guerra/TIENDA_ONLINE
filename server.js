const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('🔧 Conectando a BD:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

// ✅ CONFIGURACIÓN OLLAMA
const OLLAMA_HOST = 'http://localhost:11434';
const OLLAMA_MODEL = 'qwen2.5:3b';

// Helper: Llamar a Ollama para interpretación con IA
async function callOllama(systemPrompt, userPrompt, format = null) {
  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const body = {
      model: OLLAMA_MODEL,
      prompt: fullPrompt,
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
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000)
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('❌ Error Ollama:', error.message);
    throw error;
  }
}

// Función de inicialización - crear tablas si no existen
async function inicializarBD() {
  try {
    const connection = await pool.getConnection();

    // Crear tabla pedido_items si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        pedido_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('✅ BD inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando BD:', error.message);
  }
}

// Inicializar BD
inicializarBD();

// =====================================================
// ENDPOINTS: PRODUCTOS
// =====================================================

app.get('/api/productos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM productos');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/productos:', error.message);
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error GET /api/productos/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

app.get('/api/productos/categoria/:categoria', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM productos WHERE categoria = ?', [req.params.categoria]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/productos/categoria:', error.message);
    res.status(500).json({ error: 'Error al obtener productos por categoría' });
  }
});

app.get('/api/deporte/:deporte', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM productos WHERE deporte = ?', [req.params.deporte]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/deporte:', error.message);
    res.status(500).json({ error: 'Error al obtener productos por deporte' });
  }
});

// =====================================================
// ENDPOINTS: PROVEEDORES
// =====================================================

app.get('/api/proveedores', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM proveedores WHERE activo = TRUE');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/proveedores:', error.message);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

app.get('/api/proveedores/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM proveedores WHERE id = ?', [req.params.id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error GET /api/proveedores/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

// =====================================================
// ENDPOINTS: PRECIOS
// =====================================================

app.get('/api/precios/producto/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT p.*, pr.nombre as proveedor_nombre, pr.ciudad, pr.pais
       FROM precios p
       JOIN proveedores pr ON p.proveedor_id = pr.id
       WHERE p.producto_id = ? AND p.activo = TRUE
       ORDER BY p.precio_venta ASC`,
      [req.params.id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/precios/producto/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener precios' });
  }
});

app.get('/api/precios/proveedor/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT p.*, prod.nombre as producto_nombre, prod.categoria, prod.deporte
       FROM precios p
       JOIN productos prod ON p.producto_id = prod.id
       WHERE p.proveedor_id = ? AND p.activo = TRUE`,
      [req.params.id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/precios/proveedor/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener precios del proveedor' });
  }
});

// =====================================================
// ENDPOINTS: ENTREGAS
// =====================================================

app.get('/api/entregas/producto/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT e.*, pr.nombre as proveedor_nombre, pr.ciudad, pr.pais, pr.telefono, pr.email
       FROM entregas e
       JOIN proveedores pr ON e.proveedor_id = pr.id
       WHERE e.producto_id = ? AND e.disponible = TRUE
       ORDER BY e.dias_promedio ASC`,
      [req.params.id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/entregas/producto/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener opciones de entrega' });
  }
});

// =====================================================
// ENDPOINTS: INVENTARIO
// =====================================================

app.get('/api/inventario/producto/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT i.*, pr.nombre as proveedor_nombre, pr.ciudad, pr.pais
       FROM inventario i
       JOIN proveedores pr ON i.proveedor_id = pr.id
       WHERE i.producto_id = ?
       ORDER BY i.cantidad_disponible DESC`,
      [req.params.id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error GET /api/inventario/producto/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// =====================================================
// ENDPOINT: INFORMACIÓN COMPLETA DE PRODUCTO
// =====================================================

app.get('/api/producto-completo/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Obtener producto
    const [producto] = await connection.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

    // Obtener precios con proveedores
    const [precios] = await connection.query(
      `SELECT p.*, pr.nombre as proveedor_nombre
       FROM precios p
       JOIN proveedores pr ON p.proveedor_id = pr.id
       WHERE p.producto_id = ? AND p.activo = TRUE`,
      [req.params.id]
    );

    // Obtener entregas
    const [entregas] = await connection.query(
      `SELECT e.*, pr.nombre as proveedor_nombre
       FROM entregas e
       JOIN proveedores pr ON e.proveedor_id = pr.id
       WHERE e.producto_id = ? AND e.disponible = TRUE`,
      [req.params.id]
    );

    // Obtener inventario
    const [inventario] = await connection.query(
      `SELECT i.*, pr.nombre as proveedor_nombre
       FROM inventario i
       JOIN proveedores pr ON i.proveedor_id = pr.id
       WHERE i.producto_id = ?`,
      [req.params.id]
    );

    connection.release();

    if (producto.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      producto: producto[0],
      precios,
      entregas,
      inventario
    });
  } catch (error) {
    console.error('❌ Error GET /api/producto-completo/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener información completa' });
  }
});

// =====================================================
// ENDPOINT: DASHBOARD (Resumen de BD)
// =====================================================

app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [[{ totalProductos }]] = await connection.query('SELECT COUNT(*) as totalProductos FROM productos');
    const [[{ totalProveedores }]] = await connection.query('SELECT COUNT(*) as totalProveedores FROM proveedores WHERE activo = TRUE');
    const [[{ totalPedidos, ingresoTotal }]] = await connection.query('SELECT COUNT(*) as totalPedidos, COALESCE(SUM(total),0) as ingresoTotal FROM pedidos');
    const [[{ solicitudesPendientes }]] = await connection.query("SELECT COUNT(*) as solicitudesPendientes FROM solicitudes_compra WHERE estado = 'pendiente'");
    const [[{ ordenesPendientes }]] = await connection.query("SELECT COUNT(*) as ordenesPendientes FROM ordenes_compra WHERE estado = 'pendiente'");
    const [[{ stockBajoCount }]] = await connection.query('SELECT COUNT(*) as stockBajoCount FROM productos WHERE stock <= 5');

    const [stockBajo] = await connection.query(
      'SELECT id, nombre, categoria, deporte, stock FROM productos WHERE stock <= 10 ORDER BY stock ASC LIMIT 10'
    );

    const [solicitudesPorEstado] = await connection.query(
      'SELECT estado, COUNT(*) as total FROM solicitudes_compra GROUP BY estado ORDER BY total DESC'
    );

    const [ultimasOrdenes] = await connection.query(
      `SELECT oc.id, oc.cantidad, oc.total, oc.estado, oc.created_at,
              p.nombre as producto, prov.nombre as proveedor
       FROM ordenes_compra oc
       LEFT JOIN productos p ON oc.producto_id = p.id
       LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id
       ORDER BY oc.created_at DESC LIMIT 5`
    );

    const [topProductos] = await connection.query(
      `SELECT p.nombre, p.categoria, SUM(oc.cantidad) as total_pedido
       FROM ordenes_compra oc
       JOIN productos p ON oc.producto_id = p.id
       GROUP BY p.id, p.nombre, p.categoria
       ORDER BY total_pedido DESC LIMIT 5`
    );

    connection.release();

    res.json({
      kpis: { totalProductos, totalProveedores, totalPedidos, ingresoTotal: parseFloat(ingresoTotal).toFixed(2), solicitudesPendientes, ordenesPendientes, stockBajoCount },
      stockBajo,
      solicitudesPorEstado,
      ultimasOrdenes,
      topProductos
    });
  } catch (error) {
    console.error('❌ Error GET /api/dashboard:', error.message);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

// =====================================================
// CRUD: CREAR PRODUCTO (POST)
// =====================================================

app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda } = req.body;

    if (!nombre || !categoria || !deporte || !precioOriginal) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO productos (nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, categoria, deporte, descripcion || '', especificaciones || '', precioOriginal, precioOferta || precioOriginal, descuento || 0, stock || 0, vistaFrente || '', vistaEspalda || '']
    );
    connection.release();

    res.status(201).json({ id: result.insertId, mensaje: 'Producto creado', nombre });
  } catch (error) {
    console.error('❌ Error POST /api/productos:', error.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// =====================================================
// CRUD: ACTUALIZAR PRODUCTO (PUT)
// =====================================================

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE productos SET nombre=?, categoria=?, deporte=?, descripcion=?, especificaciones=?, precioOriginal=?, precioOferta=?, descuento=?, stock=?, vistaFrente=?, vistaEspalda=? WHERE id=?',
      [nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda, req.params.id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado', id: req.params.id });
  } catch (error) {
    console.error('❌ Error PUT /api/productos/:id:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// =====================================================
// CRUD: ELIMINAR PRODUCTO (DELETE)
// =====================================================

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM productos WHERE id=?', [req.params.id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado', id: req.params.id });
  } catch (error) {
    console.error('❌ Error DELETE /api/productos/:id:', error.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// =====================================================
// CRUD: CREAR PRECIO (POST)
// =====================================================

app.post('/api/precios', async (req, res) => {
  try {
    const { producto_id, proveedor_id, precio_costo, precio_venta, margen_ganancia, cantidad_minima, cantidad_maxima } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO precios (producto_id, proveedor_id, precio_costo, precio_venta, margen_ganancia, cantidad_minima, cantidad_maxima) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [producto_id, proveedor_id, precio_costo, precio_venta, margen_ganancia || 0, cantidad_minima || 1, cantidad_maxima || null]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, mensaje: 'Precio agregado' });
  } catch (error) {
    console.error('❌ Error POST /api/precios:', error.message);
    res.status(500).json({ error: 'Error al agregar precio' });
  }
});

// =====================================================
// CRUD: ACTUALIZAR PRECIO (PUT)
// =====================================================

app.put('/api/precios/:id', async (req, res) => {
  try {
    const { precio_costo, precio_venta, margen_ganancia, cantidad_minima, cantidad_maxima } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE precios SET precio_costo=?, precio_venta=?, margen_ganancia=?, cantidad_minima=?, cantidad_maxima=? WHERE id=?',
      [precio_costo, precio_venta, margen_ganancia, cantidad_minima, cantidad_maxima, req.params.id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }

    res.json({ mensaje: 'Precio actualizado' });
  } catch (error) {
    console.error('❌ Error PUT /api/precios/:id:', error.message);
    res.status(500).json({ error: 'Error al actualizar precio' });
  }
});

// =====================================================
// CRUD: ELIMINAR PRECIO (DELETE)
// =====================================================

app.delete('/api/precios/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM precios WHERE id=?', [req.params.id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }

    res.json({ mensaje: 'Precio eliminado' });
  } catch (error) {
    console.error('❌ Error DELETE /api/precios/:id:', error.message);
    res.status(500).json({ error: 'Error al eliminar precio' });
  }
});

// =====================================================
// CRUD: CREAR ENTREGA (POST)
// =====================================================

app.post('/api/entregas', async (req, res) => {
  try {
    const { producto_id, proveedor_id, dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO entregas (producto_id, proveedor_id, dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [producto_id, proveedor_id, dias_minimos, dias_maximos, dias_promedio || Math.ceil((dias_minimos + dias_maximos) / 2), costo_envio || 0, ubicacion_bodega || '']
    );
    connection.release();

    res.status(201).json({ id: result.insertId, mensaje: 'Entrega agregada' });
  } catch (error) {
    console.error('❌ Error POST /api/entregas:', error.message);
    res.status(500).json({ error: 'Error al agregar entrega' });
  }
});

// =====================================================
// CRUD: ACTUALIZAR ENTREGA (PUT)
// =====================================================

app.put('/api/entregas/:id', async (req, res) => {
  try {
    const { dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE entregas SET dias_minimos=?, dias_maximos=?, dias_promedio=?, costo_envio=?, ubicacion_bodega=? WHERE id=?',
      [dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega, req.params.id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.json({ mensaje: 'Entrega actualizada' });
  } catch (error) {
    console.error('❌ Error PUT /api/entregas/:id:', error.message);
    res.status(500).json({ error: 'Error al actualizar entrega' });
  }
});

// =====================================================
// CRUD: ELIMINAR ENTREGA (DELETE)
// =====================================================

app.delete('/api/entregas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM entregas WHERE id=?', [req.params.id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.json({ mensaje: 'Entrega eliminada' });
  } catch (error) {
    console.error('❌ Error DELETE /api/entregas/:id:', error.message);
    res.status(500).json({ error: 'Error al eliminar entrega' });
  }
});

// =====================================================
// RUTA PRINCIPAL
// =====================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          ✅ SERVIDOR TIENDA ONLINE FUNCIONANDO           ║
╚════════════════════════════════════════════════════════════╝

🌐 URL Tienda:        http://localhost:${PORT}
📊 API Productos:     http://localhost:${PORT}/api/productos
👥 API Proveedores:   http://localhost:${PORT}/api/proveedores
💰 API Precios:       http://localhost:${PORT}/api/precios/producto/1
📦 API Entregas:      http://localhost:${PORT}/api/entregas/producto/1
📈 Dashboard:         http://localhost:${PORT}/api/dashboard

ENDPOINTS DISPONIBLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTOS:
  GET /api/productos
  GET /api/productos/:id
  GET /api/productos/categoria/:categoria
  GET /api/deporte/:deporte

PROVEEDORES:
  GET /api/proveedores
  GET /api/proveedores/:id

PRECIOS:
  GET /api/precios/producto/:id
  GET /api/precios/proveedor/:id

ENTREGAS:
  GET /api/entregas/producto/:id

INVENTARIO:
  GET /api/inventario/producto/:id

INFORMACIÓN COMPLETA:
  GET /api/producto-completo/:id (Incluye todo)

DASHBOARD:
  GET /api/dashboard (Resumen estadísticas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

// =====================================================
// FASE 3: CARRITO PERSISTENTE
// =====================================================

app.get('/api/carrito/:sesionId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT c.*, p.nombre, p.precioOferta as precio, p.vistaFrente as imagen
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.sesion_id = ?`,
      [req.params.sesionId]
    );
    connection.release();
    res.json(items);
  } catch (error) {
    console.error('Error GET carrito:', error.message);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

app.post('/api/carrito', async (req, res) => {
  try {
    const { producto_id, cantidad, sesion_id } = req.body;
    const connection = await pool.getConnection();
    
    const [existing] = await connection.query(
      'SELECT * FROM carrito WHERE producto_id = ? AND sesion_id = ?',
      [producto_id, sesion_id]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE carrito SET cantidad = cantidad + ? WHERE producto_id = ? AND sesion_id = ?',
        [cantidad, producto_id, sesion_id]
      );
    } else {
      await connection.query(
        'INSERT INTO carrito (producto_id, cantidad, sesion_id) VALUES (?, ?, ?)',
        [producto_id, cantidad, sesion_id]
      );
    }
    connection.release();
    res.json({ mensaje: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error POST carrito:', error.message);
    res.status(500).json({ error: 'Error al agregar carrito' });
  }
});

app.delete('/api/carrito/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM carrito WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ mensaje: 'Producto removido del carrito' });
  } catch (error) {
    console.error('Error DELETE carrito:', error.message);
    res.status(500).json({ error: 'Error al remover carrito' });
  }
});

// =====================================================
// FASE 4: SISTEMA DE PEDIDOS
// =====================================================

app.post('/api/pedidos', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { cliente_nombre, cliente_email, cliente_telefono, items, proveedor_id } = req.body;

    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const fechaEntrega = new Date();
    fechaEntrega.setDate(fechaEntrega.getDate() + 5);

    await connection.beginTransaction();

    // 1. Crear pedido
    const [result] = await connection.query(
      'INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, proveedor_id, total, estado, fecha_entrega_estimada) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cliente_nombre, cliente_email, cliente_telefono, proveedor_id || 1, total, 'confirmado', fechaEntrega.toISOString().split('T')[0]]
    );

    const pedidoId = result.insertId;

    // 2. Procesar cada item: crear pedido_item y decrementar stock
    for (const item of items) {
      // Insertar en pedido_items
      await connection.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      );

      // Decrementar stock en inventario
      await connection.query(
        'UPDATE inventario SET cantidad_stock = cantidad_stock - ? WHERE producto_id = ? AND proveedor_id = ?',
        [item.cantidad, item.producto_id, proveedor_id || 1]
      );

      // También decrementar en tabla productos (para compatibilidad)
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      id: pedidoId,
      codigoPedido: `GOL-${pedidoId}`,
      total,
      estado: 'confirmado',
      fechaEntrega: fechaEntrega.toISOString().split('T')[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error POST pedidos:', error.message);
    res.status(500).json({ error: 'Error al crear pedido: ' + error.message });
  } finally {
    connection.release();
  }
});

app.get('/api/pedidos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [pedidos] = await connection.query(
      'SELECT * FROM pedidos ORDER BY id DESC LIMIT 100'
    );
    connection.release();
    res.json(pedidos);
  } catch (error) {
    console.error('Error GET pedidos:', error.message);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [pedidos] = await connection.query(
      'SELECT * FROM pedidos WHERE id = ?',
      [req.params.id]
    );
    connection.release();
    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedidos[0]);
  } catch (error) {
    console.error('Error GET pedido:', error.message);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
});

app.put('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );
    connection.release();
    res.json({ mensaje: 'Pedido actualizado', estado });
  } catch (error) {
    console.error('Error PUT pedido:', error.message);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

// =====================================================
// FASE 5: REPORTES Y ANALÍTICAS
// =====================================================

app.get('/api/reportes/ventas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [ventas] = await connection.query(
      'SELECT SUM(total) as totalVentas, COUNT(*) as totalPedidos, AVG(total) as ticketPromedio FROM pedidos WHERE estado = "confirmado"'
    );
    connection.release();
    res.json(ventas[0]);
  } catch (error) {
    console.error('Error GET reportes:', error.message);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

app.get('/api/reportes/productos-top', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [top] = await connection.query(
      `SELECT p.nombre, COUNT(*) as vendidos, SUM(pi.cantidad) as totalUnidades
       FROM pedido_items pi
       JOIN productos p ON pi.producto_id = p.id
       GROUP BY p.id, p.nombre
       ORDER BY totalUnidades DESC
       LIMIT 10`
    );
    connection.release();
    res.json(top);
  } catch (error) {
    console.error('Error GET productos-top:', error.message);
    res.status(500).json({ error: 'Error al obtener top productos' });
  }
});

app.get('/api/reportes/proveedores', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [prov] = await connection.query(
      `SELECT pr.nombre, COUNT(pe.id) as entregasDisponibles, AVG(pe.dias_promedio) as diasPromedio
       FROM proveedores pr
       LEFT JOIN entregas pe ON pr.id = pe.proveedor_id
       WHERE pr.activo = TRUE
       GROUP BY pr.id`
    );
    connection.release();
    res.json(prov);
  } catch (error) {
    console.error('Error GET proveedores:', error.message);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// =====================================================
// AUTENTICACIÓN - USUARIOS EN BD
// =====================================================

app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono, password, confirmPassword } = req.body;

    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    const connection = await pool.getConnection();

    const [existente] = await connection.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const [result] = await connection.query(
      'INSERT INTO usuarios (nombres, apellidos, email, telefono, password) VALUES (?, ?, ?, ?, ?)',
      [nombres, apellidos, email, telefono, password]
    );

    connection.release();

    res.status(201).json({
      id: result.insertId,
      nombres,
      apellidos,
      email,
      mensaje: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    console.error('Error registro:', error.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const connection = await pool.getConnection();
    const [usuarios] = await connection.query(
      'SELECT id, nombres, apellidos, email, telefono, estado, role FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    );
    connection.release();

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = usuarios[0];
    res.json({
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
      mensaje: '¡Bienvenido!'
    });
  } catch (error) {
    console.error('Error login:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// =====================================================
// SOLICITUDES DE COMPRA CON IA (WORKFLOW AUTOMÁTICO)
// =====================================================

app.post('/api/solicitudes-compra', async (req, res) => {
  try {
    const { usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO solicitudes_compra (usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida, estado) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, descripcion, stock_bajo_producto_id || null, cantidad_requerida || null, 'pendiente']
    );

    const solicitud_id = result.insertId;
    connection.release();

    // 🔗 Disparar webhook de n8n automáticamente en background
    (async () => {
      try {
        console.log('🔗 Disparando webhook n8n para solicitud:', solicitud_id);
        const n8nWebhookUrl = 'http://localhost:5678/webhook/solicitud-compra';

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: solicitud_id,
            usuario_id: usuario_id,
            descripcion: descripcion,
            stock_bajo_producto_id: stock_bajo_producto_id,
            cantidad_requerida: cantidad_requerida
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (n8nResponse.ok) {
          console.log('✅ Webhook n8n disparado exitosamente para solicitud:', solicitud_id);
        } else {
          console.warn('⚠️ Webhook n8n respondió con status:', n8nResponse.status);
        }
      } catch (error) {
        console.warn('⚠️ n8n webhook no disponible (pero solicitud creada):', error.message);
      }
    })();

    res.status(201).json({
      id: solicitud_id,
      estado: 'pendiente',
      mensaje: 'Solicitud registrada. Será procesada por IA'
    });
  } catch (error) {
    console.error('❌ Error solicitud compra:', error.message);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});

app.get('/api/solicitudes-compra', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [solicitudes] = await connection.query(
      `SELECT sc.*, u.nombres, u.apellidos, u.email, p.nombre as producto_nombre, prov.nombre as proveedor_nombre
       FROM solicitudes_compra sc
       LEFT JOIN usuarios u ON sc.usuario_id = u.id
       LEFT JOIN productos p ON sc.stock_bajo_producto_id = p.id
       LEFT JOIN proveedores prov ON sc.proveedor_recomendado_id = prov.id
       ORDER BY sc.created_at DESC
       LIMIT 50`
    );
    connection.release();
    res.json(solicitudes);
  } catch (error) {
    console.error('Error GET solicitudes:', error.message);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

app.get('/api/solicitudes-compra/usuario/:usuario_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [solicitudes] = await connection.query(
      `SELECT * FROM solicitudes_compra WHERE usuario_id = ? ORDER BY created_at DESC`,
      [req.params.usuario_id]
    );
    connection.release();
    res.json(solicitudes);
  } catch (error) {
    console.error('Error GET solicitudes usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

app.put('/api/solicitudes-compra/:id', async (req, res) => {
  try {
    const { estado, respuesta_ia, proveedor_recomendado_id, orden_compra_id } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE solicitudes_compra SET estado = ?, respuesta_ia = ?, proveedor_recomendado_id = ?, orden_compra_id = ? WHERE id = ?',
      [estado || 'pendiente', respuesta_ia || null, proveedor_recomendado_id || null, orden_compra_id || null, req.params.id]
    );

    connection.release();
    res.json({
      mensaje: 'Solicitud actualizada',
      solicitud_id: req.params.id,
      estado
    });
  } catch (error) {
    console.error('Error PUT solicitud:', error.message);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
});

// =====================================================
// ÓRDENES DE COMPRA AUTOMÁTICAS
// =====================================================

app.post('/api/ordenes-compra', async (req, res) => {
  try {
    const { solicitud_id, proveedor_id, producto_id, cantidad, precio_unitario, respuesta_ia_justificacion } = req.body;

    const total = cantidad * precio_unitario;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO ordenes_compra
       (solicitud_id, proveedor_id, producto_id, cantidad, precio_unitario, total, respuesta_ia_justificacion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [solicitud_id, proveedor_id, producto_id, cantidad, precio_unitario, total, respuesta_ia_justificacion, 'pendiente']
    );

    // Actualizar solicitud con la orden creada
    await connection.query(
      'UPDATE solicitudes_compra SET orden_compra_id = ?, estado = ? WHERE id = ?',
      [result.insertId, 'procesada', solicitud_id]
    );

    connection.release();

    res.status(201).json({
      id: result.insertId,
      solicitud_id,
      proveedor_id,
      producto_id,
      cantidad,
      total,
      estado: 'pendiente',
      mensaje: 'Orden de compra generada automáticamente'
    });
  } catch (error) {
    console.error('Error crear orden compra:', error.message);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

app.get('/api/ordenes-compra', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [ordenes] = await connection.query(
      `SELECT oc.*, p.nombre as producto_nombre, prov.nombre as proveedor_nombre, prov.email as proveedor_email
       FROM ordenes_compra oc
       LEFT JOIN productos p ON oc.producto_id = p.id
       LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id
       ORDER BY oc.created_at DESC
       LIMIT 100`
    );
    connection.release();
    res.json(ordenes);
  } catch (error) {
    console.error('Error GET ordenes:', error.message);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

app.get('/api/ordenes-compra/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [ordenes] = await connection.query(
      'SELECT * FROM ordenes_compra WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (ordenes.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(ordenes[0]);
  } catch (error) {
    console.error('Error GET orden:', error.message);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

app.put('/api/ordenes-compra/:id/estado', async (req, res) => {
  try {
    const { estado, enviado_por_email, enviado_por_api } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE ordenes_compra SET estado = ?, enviado_por_email = ?, enviado_por_api = ? WHERE id = ?',
      [estado || 'pendiente', enviado_por_email || 0, enviado_por_api || 0, req.params.id]
    );

    connection.release();
    res.json({ mensaje: 'Orden actualizada', estado });
  } catch (error) {
    console.error('Error actualizar orden:', error.message);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
});

// Endpoint: Generar orden de compra automática (llamado por n8n al final del workflow)
app.post('/api/solicitudes-compra/generar-orden', async (req, res) => {
  try {
    const { solicitud_id, proveedor_id } = req.body;

    const connection = await pool.getConnection();

    // Buscar solicitud sin JOIN a proveedores (para permitir NULL en proveedor_recomendado_id)
    const [solicitudes] = await connection.query(
      `SELECT * FROM solicitudes_compra WHERE id = ?`,
      [solicitud_id]
    );

    if (solicitudes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudes[0];
    const finalProveedor = proveedor_id || solicitud.proveedor_recomendado_id || 1;

    // Obtener datos del proveedor
    const [proveedores] = await connection.query(
      `SELECT p.nombre, pr.precio_venta
       FROM proveedores p
       LEFT JOIN precios pr ON p.id = pr.proveedor_id
       WHERE p.id = ?
       LIMIT 1`,
      [finalProveedor]
    );

    const proveedorData = proveedores[0] || { nombre: 'Proveedor desconocido', precio_venta: 0 };
    const cantidad = solicitud.cantidad_requerida || 1;
    const precio_unitario = proveedorData.precio_venta || 0;
    const total = cantidad * precio_unitario;

    const [orderResult] = await connection.query(
      `INSERT INTO ordenes_compra
       (solicitud_id, proveedor_id, producto_id, cantidad, precio_unitario, total, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        solicitud_id,
        finalProveedor,
        solicitud.stock_bajo_producto_id || 1,
        cantidad,
        precio_unitario,
        total
      ]
    );

    await connection.query(
      `UPDATE solicitudes_compra
       SET orden_compra_id = ?, estado = 'orden_creada', proveedor_recomendado_id = ?
       WHERE id = ?`,
      [orderResult.insertId, finalProveedor, solicitud_id]
    );

    connection.release();

    res.status(201).json({
      orden_id: orderResult.insertId,
      solicitud_id,
      proveedor: proveedorData.nombre,
      proveedor_id: finalProveedor,
      cantidad,
      total,
      estado: 'pendiente'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CHATBOT ADMIN - Powered by Ollama
// ============================================================

// Extrae la última respuesta del modelo (smollm2 tiende a repetir el historial)
function limpiarRespuestaOllama(texto) {
  const marcador = 'Asistente:';
  const idx = texto.lastIndexOf(marcador);
  let limpio = idx !== -1 ? texto.slice(idx + marcador.length) : texto;
  return limpio.split('\n').filter(l => !l.trim().startsWith('Admin:')).join('\n').trim();
}

// Detecta si el usuario quiere crear una orden de compra
function detectarTipoMensaje(msg) {
  const m = msg.toLowerCase();
  // Paso 4 primero — tiene prioridad sobre todo
  if (['solicita ', 'genera una orden', 'generar una orden', 'crear una orden',
       'crea una orden', 'quiero pedir', 'necesito que pidas',
       'haz una orden', 'realiza una orden'].some(p => m.includes(p))) return 'crear_orden';
  // Paso 2 — clasificar
  if (['clasifica', 'clasificar', 'es emergencia', 'es reposicion', 'qué tipo',
       'que tipo', 'prioridad', 'requiere aprobacion'].some(p => m.includes(p))) return 'clasificar';
  // Paso 3 — recomendar proveedor
  if (['qué proveedor', 'que proveedor', 'recomiendas', 'recomiendes',
       'mejor proveedor', 'cuál proveedor', 'cual proveedor'].some(p => m.includes(p))) return 'recomendar';
  // Paso 1 — interpretar
  if (['analiza', 'interpreta', 'extrae', 'analizar', 'interpretar',
       'qué datos', 'que datos'].some(p => m.includes(p))) return 'interpretar';
  return 'general';
}

function extraerDatosOrden(mensaje) {
  const cantMatch = mensaje.match(/(\d+)/);
  const cantidad = cantMatch ? parseInt(cantMatch[1]) : 1;
  return { cantidad, descripcion: mensaje };
}

app.post('/api/chatbot', async (req, res) => {
  let connection = null;
  try {
    const { mensaje, historial = [], usuario_id = 1 } = req.body;
    if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });

    connection = await pool.getConnection();

    const [productos] = await connection.query(
      'SELECT id, nombre, categoria, deporte, precioOriginal as precio, stock FROM productos ORDER BY nombre LIMIT 30'
    );
    const [proveedores] = await connection.query(
      'SELECT id, nombre, ciudad FROM proveedores WHERE activo = 1'
    );
    const [pedidos] = await connection.query(
      'SELECT COUNT(*) as total, SUM(total) as ingresos FROM pedidos'
    );
    const [ordenesPend] = await connection.query(
      'SELECT COUNT(*) as total FROM ordenes_compra WHERE estado = "pendiente"'
    );
    const [solicitudes] = await connection.query(
      'SELECT COUNT(*) as total FROM solicitudes_compra WHERE estado = "pendiente"'
    );

    const tipo = detectarTipoMensaje(mensaje);

    // ── PASO 4: Crear orden real → dispara n8n ──────────────────────────────
    if (tipo === 'crear_orden') {
      const { cantidad, descripcion } = extraerDatosOrden(mensaje);
      const mensajeLower = mensaje.toLowerCase();
      const scored = productos.map(p => {
        const palabras = p.nombre.toLowerCase().split(' ');
        const coincidencias = palabras.filter(w => w.length > 2 && mensajeLower.includes(w)).length;
        return { p, coincidencias };
      });
      scored.sort((a, b) => b.coincidencias - a.coincidencias);
      const productoMatch = (scored[0].coincidencias > 0 ? scored[0].p : null) || productos[0];

      const [result] = await connection.query(
        'INSERT INTO solicitudes_compra (usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida, estado) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, descripcion, productoMatch.id, cantidad, 'pendiente']
      );
      const solicitud_id = result.insertId;
      connection.release();

      try {
        await fetch('http://localhost:5678/webhook/solicitud-compra', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ solicitud_id, descripcion, cantidad_requerida: cantidad, stock_bajo_producto_id: productoMatch.id }),
          signal: AbortSignal.timeout(10000)
        });
      } catch (e) {
        console.warn('⚠️ n8n webhook no disponible:', e.message);
      }

      return res.json({
        respuesta: `📋 Solicitud #${solicitud_id} registrada y enviada a n8n.\n- Producto: ${productoMatch.nombre}\n- Cantidad: ${cantidad} unidades\n- n8n está ejecutando el workflow de 4 prompts para generar la orden...\n\nRevisa el tab "Órdenes de Compra" en unos segundos.`,
        accion: 'solicitud_creada',
        solicitud_id
      });
    }

    // ── PASOS 1-3: n8n orquesta (interpretar / clasificar / recomendar) ──────
    if (tipo === 'interpretar' || tipo === 'clasificar' || tipo === 'recomendar') {
      connection.release();
      const n8nResp = await fetch('http://localhost:5678/webhook/chatbot-consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, mensaje }),
        signal: AbortSignal.timeout(60000)
      });
      const data = await n8nResp.json();
      const respuesta = (Array.isArray(data) ? data[0]?.respuesta : data?.respuesta) || 'Sin respuesta del asistente.';
      return res.json({ respuesta });
    }

    // ── GENERAL: consultas libres sobre la tienda ───────────────────────────
    connection.release();
    const listaProductos = productos.map(p =>
      `${p.nombre} | stock: ${p.stock} | precio: S/${p.precio}`
    ).join('\n');
    const sistema = `Eres el asistente de GOLAZO STORE. Responde en español, breve y directo.

Datos del sistema:
- Pedidos totales: ${pedidos[0].total} | Ingresos: S/${pedidos[0].ingresos || 0}
- Órdenes pendientes: ${ordenesPend[0].total}
- Solicitudes pendientes: ${solicitudes[0].total}

Productos: ${listaProductos}`;
    const historialTexto = historial.slice(-4)
      .map(m => `${m.rol === 'usuario' ? 'Admin' : 'Asistente'}: ${m.texto}`).join('\n');
    const promptCompleto = historialTexto
      ? `${historialTexto}\nAdmin: ${mensaje}\nAsistente:`
      : `Admin: ${mensaje}\nAsistente:`;
    let respuesta = await callOllama(sistema, promptCompleto);
    respuesta = limpiarRespuestaOllama(respuesta);
    res.json({ respuesta });
  } catch (error) {
    if (connection) connection.release();
    console.error('Error chatbot:', error.message);
    const esTimeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    res.status(500).json({ error: esTimeout ? 'El asistente tardó demasiado. Intenta de nuevo.' : 'Error al procesar mensaje' });
  }
});

