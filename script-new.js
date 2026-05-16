// API Configuration
const API_URL = 'http://localhost:3000/api';

// VARIABLES GLOBALES
let productos = [];
let carrito = [];
let productosFiltrados = [];
let sesionId = localStorage.getItem('sesionId') || 'ses_' + Date.now();
localStorage.setItem('sesionId', sesionId);

// ELEMENTOS DEL DOM
const productosContainer = document.getElementById('productos-container');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');
const modal = document.getElementById('product-modal');
const categoriaTitulo = document.getElementById('categoria-titulo');

// ============================================
// CARGAR CARRITO DESDE LA BASE DE DATOS (PHASE 3)
// ============================================
async function cargarCarrioDelaBD() {
    try {
        const response = await fetch(`${API_URL}/carrito/${sesionId}`);
        if (!response.ok) return; // Si no hay carrito, continuamos

        const items = await response.json();
        carrito = items.map(item => ({
            id: item.producto_id,
            nombre: item.nombre,
            precio: parseFloat(item.precio),
            imagen: item.imagen,
            cantidad: item.cantidad,
            stock: 100, // Default, se actualiza con producto completo
            cartItemId: item.id // ID del registro en tabla carrito
        }));

        console.log('✅ Carrito cargado de BD:', carrito.length, 'items');
        actualizarCarrito();
    } catch (error) {
        console.error('Error al cargar carrito de BD:', error);
    }
}

// ============================================
// CARGAR PRODUCTOS DESDE LA API
// ============================================
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');

        productos = await response.json();
        productosFiltrados = [...productos];

        // Convertir vistaFrente y vistaEspalda a formato de objeto vistas
        productos = productos.map(p => ({
            ...p,
            vistas: {
                frente: p.vistaFrente,
                espalda: p.vistaEspalda
            }
        }));

        console.log('✅ Productos cargados desde BD:', productos.length);
        mostrarTodos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productosContainer.innerHTML = `
            <div class="no-productos">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar productos. Asegúrate que el servidor está ejecutándose.</p>
            </div>
        `;
    }
}

// ============================================
// FUNCIONES DE INFORMACIÓN DE LA EMPRESA
// ============================================
function mostrarInfo(seccion) {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');

    const seccionMostrar = document.getElementById(seccion);
    if (seccionMostrar) {
        seccionMostrar.style.display = 'block';
        categoriaTitulo.innerHTML = `<h2>${seccion.charAt(0).toUpperCase() + seccion.slice(1).replace('-', ' ')}</h2>`;
        productosContainer.innerHTML = '';
        seccionMostrar.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// FUNCIONES DE FILTRADO
// ============================================
function filtrarProductos(categoria, deporte) {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');

    productosFiltrados = productos.filter(p =>
        p.categoria === categoria && p.deporte === deporte
    );

    let titulo = '';
    if (categoria === 'camisetas') titulo = 'CAMISETAS';
    else if (categoria === 'zapatillas') titulo = 'ZAPATILLAS';
    else if (categoria === 'polos') titulo = 'POLOS';

    let deporteTitulo = '';
    if (deporte === 'futbol') deporteTitulo = 'FÚTBOL';
    else if (deporte === 'basquet') deporteTitulo = 'BÁSQUET';
    else if (deporte === 'voley') deporteTitulo = 'VÓLEY';

    categoriaTitulo.innerHTML = `<h2>${titulo} DE ${deporteTitulo} (${productosFiltrados.length} productos)</h2>`;
    mostrarProductos(productosFiltrados);

    if (productosFiltrados.length === 0) {
        productosContainer.innerHTML = '<div class="no-productos"><i class="fas fa-box-open"></i><p>No hay productos disponibles</p></div>';
    }
}

function mostrarTodos() {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
    productosFiltrados = [...productos];
    categoriaTitulo.innerHTML = `<h2>TODOS LOS PRODUCTOS (${productos.length} productos)</h2>`;
    mostrarProductos(productos);
}

// ============================================
// FUNCIÓN PARA MOSTRAR PRODUCTOS
// ============================================
function mostrarProductos(productosAMostrar) {
    productosContainer.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.onclick = () => verDetalle(producto.id);

        card.innerHTML = `
            <div class="producto-imagen">
                <div class="vista-1" style="background-image: url('${producto.vistas.frente}')"></div>
                <div class="vista-2" style="background-image: url('${producto.vistas.espalda}')"></div>
                <span class="descuento-badge">-${producto.descuento}%</span>
            </div>
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-categoria">
                    <i class="fas fa-tag"></i> ${producto.categoria} - ${producto.deporte}
                </p>
                <div class="producto-precios">
                    <span class="precio-original">S/ ${parseFloat(producto.precioOriginal).toFixed(2)}</span>
                    <span class="precio-oferta">S/ ${parseFloat(producto.precioOferta).toFixed(2)}</span>
                </div>
                <button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
                    <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
                </button>
            </div>
        `;

        productosContainer.appendChild(card);
    });
}

// ============================================
// FUNCIONES DEL MODAL
// ============================================
async function verDetalle(id) {
    const producto = productos.find(p => p.id === id);
    const modalBody = document.getElementById('modal-body');

    // Mostrar loading
    modalBody.innerHTML = `<div style="text-align: center; padding: 20px;">
        <i class="fas fa-spinner fa-spin"></i> Cargando información...
    </div>`;

    try {
        // Obtener información completa del producto (precios, entregas, inventario)
        const response = await fetch(`${API_URL}/producto-completo/${id}`);
        const data = await response.json();

        const { precios, entregas, inventario } = data;

        // Obtener el mejor precio y la entrega más rápida
        const mejorPrecio = precios.length > 0 ? precios[0] : null;
        const entregarapida = entregas.length > 0 ? entregas[0] : null;

        let preciosHTML = '';
        if (precios.length > 0) {
            preciosHTML = `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>💰 Precios por Proveedor:</strong>
                    <table style="width: 100%; font-size: 12px; margin-top: 8px;">
                        <tr style="background: #e3f2fd;">
                            <th style="padding: 5px;">Proveedor</th>
                            <th style="padding: 5px;">Costo</th>
                            <th style="padding: 5px;">Venta</th>
                            <th style="padding: 5px;">Margen</th>
                        </tr>
                        ${precios.map(p => `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 5px;"><strong>${p.proveedor_nombre}</strong></td>
                                <td style="padding: 5px;">S/ ${parseFloat(p.precio_costo).toFixed(2)}</td>
                                <td style="padding: 5px; color: green; font-weight: bold;">S/ ${parseFloat(p.precio_venta).toFixed(2)}</td>
                                <td style="padding: 5px;">${parseFloat(p.margen_ganancia).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        let entregasHTML = '';
        if (entregas.length > 0) {
            entregasHTML = `
                <div style="background: #f3e5f5; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>📦 Opciones de Entrega:</strong>
                    <table style="width: 100%; font-size: 12px; margin-top: 8px;">
                        <tr style="background: #f3e5f5;">
                            <th style="padding: 5px;">Proveedor</th>
                            <th style="padding: 5px;">Días</th>
                            <th style="padding: 5px;">Envío</th>
                            <th style="padding: 5px;">Ubicación</th>
                        </tr>
                        ${entregas.map(e => `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 5px;"><strong>${e.proveedor_nombre}</strong></td>
                                <td style="padding: 5px;">${e.dias_minimos}-${e.dias_maximos} (Prom: ${e.dias_promedio})</td>
                                <td style="padding: 5px; color: #d32f2f;">S/ ${parseFloat(e.costo_envio).toFixed(2)}</td>
                                <td style="padding: 5px; font-size: 11px;">${e.ubicacion_bodega}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        let inventarioHTML = '';
        if (inventario.length > 0) {
            const totalStock = inventario.reduce((sum, inv) => sum + inv.cantidad_disponible, 0);
            inventarioHTML = `
                <div style="background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>📊 Inventario Total:</strong> <span style="color: green; font-weight: bold;">${totalStock} unidades</span>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal-imagenes">
                <img src="${producto.vistas.frente}" alt="${producto.nombre}" class="modal-imagen">
                <img src="${producto.vistas.espalda}" alt="${producto.nombre}" class="modal-imagen">
            </div>
            <div class="modal-info">
                <h2>${producto.nombre}</h2>
                <p><i class="fas fa-tag"></i> <strong>Categoría:</strong> ${producto.categoria} - ${producto.deporte}</p>
                <p>${producto.descripcion}</p>
                <p><i class="fas fa-tshirt"></i> <strong>Especificaciones:</strong> ${producto.especificaciones}</p>

                <div class="modal-precios">
                    <span class="modal-precio-original">S/ ${parseFloat(producto.precioOriginal).toFixed(2)}</span>
                    <span class="modal-precio-oferta">S/ ${parseFloat(producto.precioOferta).toFixed(2)}</span>
                </div>
                <p><i class="fas fa-gift"></i> <strong>Ahorras:</strong> S/ ${(parseFloat(producto.precioOriginal) - parseFloat(producto.precioOferta)).toFixed(2)} (${producto.descuento}%)</p>

                ${preciosHTML}
                ${entregasHTML}
                ${inventarioHTML}

                ${mejorPrecio ? `
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;">
                        <strong>✨ Mejor Opción:</strong> ${mejorPrecio.proveedor_nombre} - S/ ${parseFloat(mejorPrecio.precio_venta).toFixed(2)}
                    </div>
                ` : ''}

                ${entregarapida ? `
                    <div style="background: #c8e6c9; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4caf50;">
                        <strong>⚡ Entrega Más Rápida:</strong> ${entregarapida.proveedor_nombre} - ${entregarapida.dias_promedio} días
                    </div>
                ` : ''}

                <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id}); cerrarModal();">
                    <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        modalBody.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <i class="fas fa-exclamation-circle"></i> Error al cargar la información
            </div>
        `;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// FUNCIONES DEL CARRITO (DATABASE BACKED - PHASE 3)
// ============================================
async function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            mostrarNotificacion('Stock máximo alcanzado', 'error');
            return;
        }
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precioOferta),
            imagen: producto.vistas.frente,
            cantidad: 1,
            stock: producto.stock
        });
    }

    try {
        await fetch(`${API_URL}/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                producto_id: producto.id,
                cantidad: 1,
                sesion_id: sesionId
            })
        });
        mostrarNotificacion(`✓ ${producto.nombre} agregado al carrito`);
        actualizarCarrito();
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacion('Error al agregar al carrito', 'error');
    }
}

async function eliminarDelCarrito(id, event) {
    if (event) event.stopPropagation();
    const producto = carrito.find(item => item.id === id);
    carrito = carrito.filter(item => item.id !== id);

    try {
        const item = carrito.find(i => i.id === id);
        if (item) {
            await fetch(`${API_URL}/carrito/${item.cartItemId}`, { method: 'DELETE' });
        }
        mostrarNotificacion(`✗ ${producto.nombre} eliminado del carrito`);
        actualizarCarrito();
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
    }
}

async function actualizarCantidad(id, nuevaCantidad, event) {
    if (event) event.stopPropagation();
    const item = carrito.find(item => item.id === id);
    if (item) {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
        } else if (nuevaCantidad <= item.stock) {
            item.cantidad = nuevaCantidad;
            actualizarCarrito();
        } else {
            mostrarNotificacion('Stock máximo alcanzado', 'error');
        }
    }
}

function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;

    cartItems.innerHTML = '';
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        const itemHTML = `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p class="cart-item-precio">S/ ${item.precio.toFixed(2)}</p>
                    <div class="cantidad-control">
                        <button class="cantidad-btn" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1}, event)">-</button>
                        <span>${item.cantidad}</span>
                        <button class="cantidad-btn" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1}, event)">+</button>
                    </div>
                </div>
                <div class="btn-eliminar" onclick="eliminarDelCarrito(${item.id}, event)">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;

        cartItems.innerHTML += itemHTML;
    });

    cartTotal.textContent = `S/ ${total.toFixed(2)}`;
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
}

// ============================================
// FUNCIÓN DE NOTIFICACIÓN
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;

    if (tipo === 'error') {
        notificacion.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
    }

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// ============================================
// FUNCIÓN DE BÚSQUEDA
// ============================================
document.querySelector('.search-box i').addEventListener('click', function() {
    const termino = document.querySelector('.search-box input').value.toLowerCase().trim();

    if (termino === '') {
        mostrarTodos();
        return;
    }

    const resultados = productos.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.categoria.includes(termino) ||
        p.deporte.includes(termino)
    );

    productosFiltrados = resultados;
    categoriaTitulo.innerHTML = `<h2>RESULTADOS: "${termino}" (${resultados.length} productos)</h2>`;
    mostrarProductos(resultados);

    if (resultados.length === 0) {
        productosContainer.innerHTML = '<div class="no-productos"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>';
    }
});

document.querySelector('.search-box input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.querySelector('.search-box i').click();
    }
});

// ============================================
// EVENTOS Y INICIALIZACIÓN
// ============================================
window.onclick = function(event) {
    if (event.target === modal) {
        cerrarModal();
    }
}

document.addEventListener('click', function(e) {
    if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-icon') && cartSidebar.classList.contains('active')) {
        toggleCart();
    }
});

// ============================================
// AUTENTICACIÓN DE USUARIO - CON BD MYSQL
// ============================================
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let metodoPagoSeleccionado = null;

function toggleUserSidebar() {
    const userMenu = document.getElementById('user-menu-invitado');
    const userMenuReg = document.getElementById('user-menu-registrado');
    const userMenuAdmin = document.getElementById('user-menu-admin');

    if (usuarioActual) {
        if (usuarioActual.role === 'admin') {
            const isVisible = userMenuAdmin.style.display === 'block';
            userMenuAdmin.style.display = isVisible ? 'none' : 'block';
        } else {
            const isVisible = userMenuReg.style.display === 'block';
            userMenuReg.style.display = isVisible ? 'none' : 'block';
        }
        if (userMenu) userMenu.style.display = 'none';
    } else {
        const isVisible = userMenu.style.display === 'block';
        userMenu.style.display = isVisible ? 'none' : 'block';
        if (userMenuReg) userMenuReg.style.display = 'none';
        if (userMenuAdmin) userMenuAdmin.style.display = 'none';
    }
}

function abrirAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'flex';
    cambiarTab('login');
}

function cerrarAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

// Cerrar modal al hacer click fuera del contenido
document.addEventListener('click', function(event) {
    const modal = document.getElementById('auth-modal');
    const modalContent = document.querySelector('.auth-modal-content');
    if (modal && event.target === modal) {
        cerrarAuthModal();
    }
});

function cambiarTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

async function registrarUsuario() {
    const nombres = document.getElementById('reg-nombres')?.value.trim();
    const apellidos = document.getElementById('reg-apellidos')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const telefono = document.getElementById('reg-telefono')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = document.getElementById('reg-confirm-password')?.value;

    if (!nombres || !apellidos || !email || !telefono || !password || !confirmPassword) {
        mostrarNotificacion('❌ Todos los campos son obligatorios', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarNotificacion('❌ La contraseña debe tener mínimo 6 caracteres', 'error');
        return;
    }

    if (password !== confirmPassword) {
        mostrarNotificacion('❌ Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombres, apellidos, email, telefono, password, confirmPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion('❌ ' + data.error, 'error');
            return;
        }

        usuarioActual = data;
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));

        // Limpiar formulario
        document.getElementById('reg-nombres').value = '';
        document.getElementById('reg-apellidos').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-telefono').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm-password').value = '';

        mostrarNotificacion('✅ ¡Registro exitoso! Bienvenido ' + nombres);
        cerrarAuthModal();
        actualizarUIUsuario();
    } catch (error) {
        console.error('Error registro:', error);
        mostrarNotificacion('❌ Error al registrar', 'error');
    }
}

async function iniciarSesion() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        mostrarNotificacion('❌ Email y contraseña requeridos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion('❌ ' + data.error, 'error');
            return;
        }

        usuarioActual = data;
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));

        // Limpiar formulario
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';

        mostrarNotificacion('✅ ¡Bienvenido ' + usuarioActual.nombres + ' [' + usuarioActual.role.toUpperCase() + ']');
        cerrarAuthModal();
        actualizarUIUsuario();

        // Si es admin, redirigir al panel admin después de 1 segundo
        if (usuarioActual.role === 'admin') {
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error login:', error);
        mostrarNotificacion('❌ Error al iniciar sesión', 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    actualizarUIUsuario();
    mostrarNotificacion('✅ Sesión cerrada');
    toggleUserSidebar();
}

function actualizarUIUsuario() {
    const userStatus = document.getElementById('user-status');
    const userMenuInvitado = document.getElementById('user-menu-invitado');
    const userMenuRegistrado = document.getElementById('user-menu-registrado');
    const userMenuAdmin = document.getElementById('user-menu-admin');

    if (usuarioActual) {
        userStatus.classList.add('logged-in');
        userMenuInvitado.style.display = 'none';

        // Mostrar menú según rol
        if (usuarioActual.role === 'admin') {
            userMenuRegistrado.style.display = 'none';
            userMenuAdmin.style.display = 'block';
        } else {
            userMenuRegistrado.style.display = 'block';
            userMenuAdmin.style.display = 'none';
        }

        document.getElementById('user-name').textContent = usuarioActual.nombres + ' ' + usuarioActual.apellidos;
        document.getElementById('user-email').textContent = '[' + usuarioActual.role.toUpperCase() + '] ' + usuarioActual.email;
    } else {
        userStatus.classList.remove('logged-in');
        userMenuInvitado.style.display = 'block';
        userMenuRegistrado.style.display = 'none';
        userMenuAdmin.style.display = 'none';
    }
}

// ============================================
// FUNCIONES DE PAGO
// ============================================
function abrirPagoModal() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }

    if (!usuarioActual) {
        mostrarNotificacion('Debes iniciar sesión para comprar', 'error');
        abrirAuthModal();
        return;
    }

    actualizarResumenCompra();
    document.getElementById('pago-modal').style.display = 'flex';
    toggleCart();
}

function actualizarResumenCompra() {
    const resumenItems = document.getElementById('resumen-items');
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = 15.00;
    const total = subtotal + envio;

    resumenItems.innerHTML = '';
    carrito.forEach(item => {
        const itemHTML = `
            <div class="resumen-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="resumen-item-img">
                <div class="resumen-item-info">
                    <h4>${item.nombre}</h4>
                    <p>Cantidad: ${item.cantidad}</p>
                </div>
                <div class="resumen-item-precio">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
        `;
        resumenItems.innerHTML += itemHTML;
    });

    document.getElementById('resumen-subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('resumen-envio').textContent = `S/ ${envio.toFixed(2)}`;
    document.getElementById('resumen-total').textContent = `S/ ${total.toFixed(2)}`;
}

// ============================================
// STEP NAVIGATION FUNCTIONS
// ============================================
function irAPaso2() {
    const step1Content = document.getElementById('step1-content');
    const step2Content = document.getElementById('step2-content');
    const step1Progress = document.getElementById('step1');
    const step2Progress = document.getElementById('step2');

    step1Content.classList.remove('active');
    step2Content.classList.add('active');
    step1Progress.classList.remove('active');
    step2Progress.classList.add('active');

    document.querySelector('.pago-modal-content').scrollTop = 0;
}

function volverAPaso1() {
    const step1Content = document.getElementById('step1-content');
    const step2Content = document.getElementById('step2-content');
    const step1Progress = document.getElementById('step1');
    const step2Progress = document.getElementById('step2');

    step2Content.classList.remove('active');
    step1Content.classList.add('active');
    step2Progress.classList.remove('active');
    step1Progress.classList.add('active');

    document.querySelector('.pago-modal-content').scrollTop = 0;
}

function irAPaso3() {
    console.log('🔄 Transitando a Paso 3...');
    const step2Content = document.getElementById('step2-content');
    const step3Content = document.getElementById('step3-content');
    const step2Progress = document.getElementById('step2');
    const step3Progress = document.getElementById('step3');

    console.log('Elementos encontrados:', {
        step2Content: !!step2Content,
        step3Content: !!step3Content,
        step2Progress: !!step2Progress,
        step3Progress: !!step3Progress
    });

    step2Content.classList.remove('active');
    step3Content.classList.add('active');
    step2Progress.classList.remove('active');
    step3Progress.classList.add('active');

    const modalContent = document.querySelector('.pago-modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
    console.log('✅ Paso 3 activado');
}

function formatearTarjeta(input) {
    let valor = input.value.replace(/\s/g, '');
    let resultado = '';
    for (let i = 0; i < valor.length; i++) {
        if (i > 0 && i % 4 === 0) {
            resultado += ' ';
        }
        resultado += valor[i];
    }
    input.value = resultado;
}

function seleccionarMetodo(metodo) {
    metodoPagoSeleccionado = metodo;
    console.log('✅ Método seleccionado:', metodo);

    const cards = document.querySelectorAll('.metodo-pago-card');
    cards.forEach(card => card.classList.remove('selected'));

    const cardSeleccionada = event.target.closest('.metodo-pago-card');
    if (cardSeleccionada) {
        cardSeleccionada.classList.add('selected');
        console.log('✅ Tarjeta marcada como selected');
    }

    const formas = document.querySelectorAll('.metodo-form');
    formas.forEach(forma => forma.style.display = 'none');

    const formaSeleccionada = document.getElementById(metodo + '-form');
    if (formaSeleccionada) {
        formaSeleccionada.style.display = 'block';
        console.log('✅ Formulario mostrado:', metodo + '-form');
    }
}

async function procesarPago() {
    console.log('🔍 procesarPago() llamada');
    console.log('📊 metodoPagoSeleccionado:', metodoPagoSeleccionado);
    console.log('👤 usuarioActual:', usuarioActual);
    console.log('🛒 carrito:', carrito);

    if (!metodoPagoSeleccionado) {
        console.error('❌ No hay método de pago seleccionado');
        mostrarNotificacion('Selecciona un método de pago', 'error');
        return;
    }

    if (!usuarioActual) {
        console.error('❌ Usuario no logueado');
        mostrarNotificacion('Debes iniciar sesión', 'error');
        return;
    }

    if (carrito.length === 0) {
        console.error('❌ Carrito vacío');
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }

    try {
        const items = carrito.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio: item.precio
        }));

        console.log('📦 Items a procesar:', items);

        const bodyData = {
            cliente_nombre: usuarioActual.nombres + ' ' + usuarioActual.apellidos,
            cliente_email: usuarioActual.email,
            cliente_telefono: usuarioActual.telefono,
            items: items,
            proveedor_id: 1
        };

        console.log('📮 Enviando a API:', bodyData);

        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        console.log('📡 Respuesta status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error respuesta:', errorText);
            throw new Error('Error al crear pedido: ' + response.status);
        }

        const pedido = await response.json();
        console.log('✅ Pedido creado:', pedido);

        document.getElementById('codigo-pedido').textContent = pedido.id;
        document.getElementById('total-pagado').textContent = `S/ ${pedido.total.toFixed(2)}`;
        document.getElementById('metodo-pagado').textContent = metodoPagoSeleccionado.charAt(0).toUpperCase() + metodoPagoSeleccionado.slice(1);
        document.getElementById('fecha-pago').textContent = new Date().toLocaleDateString('es-PE');

        carrito = [];
        actualizarCarrito();
        metodoPagoSeleccionado = null;

        console.log('🎉 Transicionando a Paso 3');
        irAPaso3();
        mostrarNotificacion('¡Pago realizado exitosamente!', 'success');
    } catch (error) {
        console.error('❌ Error al procesar pago:', error);
        mostrarNotificacion('Error al procesar el pago: ' + error.message, 'error');
    }
}

function cerrarPagoModal() {
    document.getElementById('pago-modal').style.display = 'none';
}

function verPedido() {
    cerrarPagoModal();
    verMisPedidos();
}

// ============================================
// PHASE 4: SEGUIMIENTO DE PEDIDOS
// ============================================
async function verMisPedidos() {
    if (!usuarioActual) {
        mostrarNotificacion('Debes iniciar sesión', 'error');
        abrirAuthModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pedidos`);
        if (!response.ok) throw new Error('Error al cargar pedidos');

        const todosLosPedidos = await response.json();
        const misPedidos = todosLosPedidos.filter(p => p.cliente_email === usuarioActual.email);

        let html = '<h2>Mis Pedidos</h2>';
        if (misPedidos.length === 0) {
            html += '<p>No tienes pedidos aún</p>';
        } else {
            html += '<div class="pedidos-list">';
            misPedidos.forEach(pedido => {
                html += `
                    <div class="pedido-item">
                        <div class="pedido-header">
                            <h3>Pedido #${pedido.id}</h3>
                            <span class="estado-badge ${pedido.estado}">${pedido.estado}</span>
                        </div>
                        <p>Total: S/ ${parseFloat(pedido.total).toFixed(2)}</p>
                        <p>Fecha Entrega: ${new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-PE')}</p>
                    </div>
                `;
            });
            html += '</div>';
        }

        const section = document.getElementById('productos-section');
        section.innerHTML = html;
        categoriaTitulo.innerHTML = '';
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar pedidos', 'error');
    }
}

// ============================================
// PHASE 5: REPORTES Y ANALÍTICAS
// ============================================
async function verReportes() {
    try {
        const [ventasResp, topResp, proveedoresResp] = await Promise.all([
            fetch(`${API_URL}/reportes/ventas`),
            fetch(`${API_URL}/reportes/productos-top`),
            fetch(`${API_URL}/reportes/proveedores`)
        ]);

        const ventas = await ventasResp.json();
        const topProductos = await topResp.json();
        const proveedores = await proveedoresResp.json();

        let html = `
            <h2>📊 Reportes y Analíticas</h2>

            <div class="reportes-dashboard">
                <div class="reporte-card">
                    <h3>💰 Ventas Totales</h3>
                    <p class="big-number">S/ ${ventas.totalVentas ? parseFloat(ventas.totalVentas).toFixed(2) : '0.00'}</p>
                    <p>Pedidos: ${ventas.totalPedidos || 0}</p>
                    <p>Ticket Promedio: S/ ${ventas.ticketPromedio ? parseFloat(ventas.ticketPromedio).toFixed(2) : '0.00'}</p>
                </div>

                <div class="reporte-card">
                    <h3>🏆 Top 10 Productos</h3>
                    <ul>
        `;

        topProductos.forEach((prod, idx) => {
            html += `<li>${idx + 1}. ${prod.nombre} - ${prod.totalUnidades} unidades</li>`;
        });

        html += `
                    </ul>
                </div>

                <div class="reporte-card">
                    <h3>🚚 Proveedores</h3>
                    <table>
                        <tr>
                            <th>Proveedor</th>
                            <th>Entregas</th>
                            <th>Días Promedio</th>
                        </tr>
        `;

        proveedores.forEach(prov => {
            html += `
                        <tr>
                            <td>${prov.nombre}</td>
                            <td>${prov.entregasDisponibles}</td>
                            <td>${prov.diasPromedio ? parseFloat(prov.diasPromedio).toFixed(1) : 'N/A'}</td>
                        </tr>
            `;
        });

        html += `
                    </table>
                </div>
            </div>
        `;

        const section = document.getElementById('productos-section');
        section.innerHTML = html;
        categoriaTitulo.innerHTML = '';

        // Add CSS for reports
        if (!document.getElementById('reportes-style')) {
            const style = document.createElement('style');
            style.id = 'reportes-style';
            style.textContent = `
                .reportes-dashboard {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .reporte-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .reporte-card h3 {
                    margin-top: 0;
                }
                .big-number {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .reporte-card table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .reporte-card th, .reporte-card td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }
                .reporte-card ul {
                    padding-left: 20px;
                }
                .reporte-card li {
                    margin: 8px 0;
                }
            `;
            document.head.appendChild(style);
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        mostrarNotificacion('Error al cargar reportes', 'error');
    }
}

// ============================================
// WORKFLOW DE COMPRA AUTOMÁTICA CON IA
// ============================================
async function abrirSolicitudCompra() {
    if (!usuarioActual) {
        mostrarNotificacion('Debes iniciar sesión', 'error');
        abrirAuthModal();
        return;
    }

    let html = `
        <div class="modal" id="solicitud-modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('solicitud-modal').style.display='none'">&times;</span>
                <h2>📋 Nueva Solicitud de Compra</h2>
                <form id="solicitud-form">
                    <label>Descripción del requerimiento *</label>
                    <textarea id="solicitud-desc" placeholder="Ej: Necesitamos 50 camisetas Perú talla M. Stock bajo en bodega." required></textarea>

                    <label>¿Hay producto con stock bajo? (Opcional)</label>
                    <select id="solicitud-producto">
                        <option value="">Seleccionar producto...</option>
                    </select>

                    <label>Cantidad requerida *</label>
                    <input type="number" id="solicitud-cantidad" min="1" required placeholder="Cantidad">

                    <div class="modal-footer">
                        <button type="submit" class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            Enviar Solicitud (IA procesará)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Cargar productos
    try {
        const resp = await fetch(`${API_URL}/productos`);
        const prods = await resp.json();
        const select = document.getElementById('solicitud-producto');
        prods.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nombre} (Stock: ${p.stock})`;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error('Error cargando productos:', e);
    }

    document.getElementById('solicitud-form').onsubmit = async (e) => {
        e.preventDefault();
        await crearSolicitudCompra();
    };
}

async function crearSolicitudCompra() {
    const descripcion = document.getElementById('solicitud-desc').value;
    const producto_id = document.getElementById('solicitud-producto').value || null;
    const cantidad = parseInt(document.getElementById('solicitud-cantidad').value);

    if (!descripcion || !cantidad) {
        mostrarNotificacion('Campos requeridos faltantes', 'error');
        return;
    }

    try {
        // PASO 1: Crear solicitud
        mostrarNotificacion('⏳ Creando solicitud...', 'info');
        const response = await fetch(`${API_URL}/solicitudes-compra`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioActual.id,
                descripcion,
                stock_bajo_producto_id: producto_id,
                cantidad_requerida: cantidad
            })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion('Error: ' + data.error, 'error');
            return;
        }

        const solicitud_id = data.id;
        console.log('✅ Solicitud creada:', solicitud_id);

        // PASO 2: Procesar con Ollama (Interpretación)
        mostrarNotificacion('🤖 Analizando solicitud con IA (Ollama)...', 'info');
        await new Promise(r => setTimeout(r, 1500)); // Esperar a que se procese en background

        const procesarResponse = await fetch(`${API_URL}/solicitudes-compra/procesar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });

        if (!procesarResponse.ok) {
            throw new Error('Error al procesar solicitud');
        }

        const procesarData = await procesarResponse.json();
        console.log('✅ Interpretación:', procesarData.interpretacion);

        // PASO 3: Recomendar proveedor
        mostrarNotificacion('🏪 Buscando mejor proveedor...', 'info');
        const recomendarResponse = await fetch(`${API_URL}/solicitudes-compra/recomendar-proveedor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });

        if (!recomendarResponse.ok) {
            throw new Error('Error al recomendar proveedor');
        }

        const recomendarData = await recomendarResponse.json();
        console.log('✅ Proveedor recomendado:', recomendarData.proveedor.nombre);

        // PASO 4: Generar orden de compra
        mostrarNotificacion('📦 Generando orden de compra...', 'info');
        const ordenResponse = await fetch(`${API_URL}/solicitudes-compra/generar-orden`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitud_id })
        });

        if (!ordenResponse.ok) {
            throw new Error('Error al generar orden');
        }

        const ordenData = await ordenResponse.json();
        console.log('✅ Orden generada:', ordenData.orden_id);

        // ÉXITO FINAL
        const totalFormatted = ordenData.total ? ordenData.total.toFixed(2) : '0.00';
        mostrarNotificacion(
            `✅ Orden de Compra #${ordenData.orden_id} creada exitosamente!\n` +
            `📝 Solicitud: ${solicitud_id}\n` +
            `🏪 Proveedor: ${recomendarData.proveedor.nombre}\n` +
            `📊 Total: S/ ${totalFormatted}`,
            'success'
        );

        // Cerrar modal
        const modal = document.getElementById('solicitud-modal');
        if (modal) modal.remove();

        // Recargar tabla de solicitudes
        setTimeout(() => cargarSolicitudesCompra(), 2000);

    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

async function verSolicitudesCompra() {
    if (!usuarioActual) {
        mostrarNotificacion('Debes iniciar sesión', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/solicitudes-compra/usuario/${usuarioActual.id}`);
        const solicitudes = await response.json();

        let html = '<h2>📋 Mis Solicitudes de Compra</h2>';

        if (solicitudes.length === 0) {
            html += '<p>No tienes solicitudes aún. <a href="#" onclick="abrirSolicitudCompra()">Crear nueva</a></p>';
        } else {
            html += '<div class="solicitudes-list">';
            solicitudes.forEach(sol => {
                html += `
                    <div class="solicitud-item">
                        <h3>Solicitud #${sol.id}</h3>
                        <p><strong>Estado:</strong> <span class="estado-badge ${sol.estado}">${sol.estado}</span></p>
                        <p><strong>Descripción:</strong> ${sol.descripcion}</p>
                        <p><strong>Cantidad:</strong> ${sol.cantidad_requerida}</p>
                        ${sol.respuesta_ia ? `<p><strong>Análisis IA:</strong> ${sol.respuesta_ia}</p>` : ''}
                        ${sol.proveedor_recomendado_id ? `<p><strong>Proveedor recomendado:</strong> ${sol.proveedor_nombre}</p>` : ''}
                        <p><small>Creado: ${new Date(sol.created_at).toLocaleDateString('es-PE')}</small></p>
                    </div>
                `;
            });
            html += '</div>';
        }

        const section = document.getElementById('productos-section');
        section.innerHTML = html;
        categoriaTitulo.innerHTML = '';
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar solicitudes', 'error');
    }
}

// ============================================
// FUNCIONES DE ADMIN
// ============================================
async function verProveedores() {
    try {
        const response = await fetch(`${API_URL}/proveedores`);
        if (!response.ok) throw new Error('Error al cargar proveedores');

        const proveedores = await response.json();

        let html = '<h2>🏢 Gestión de Proveedores</h2>';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">';

        proveedores.forEach(prov => {
            html += `
                <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #667eea; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #667eea; margin: 0 0 10px 0;">${prov.nombre}</h3>
                    <p><strong>Contacto:</strong> ${prov.contacto}</p>
                    <p><strong>Email:</strong> <a href="mailto:${prov.email}">${prov.email}</a></p>
                    <p><strong>Teléfono:</strong> ${prov.telefono}</p>
                    <p><strong>Ciudad:</strong> ${prov.ciudad}</p>
                    <p><strong>País:</strong> ${prov.pais}</p>
                    <p><strong>Estado:</strong> <span style="background: ${prov.activo ? '#27ae60' : '#e74c3c'}; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">${prov.activo ? 'Activo' : 'Inactivo'}</span></p>
                </div>
            `;
        });

        html += '</div>';

        const section = document.getElementById('productos-section');
        section.innerHTML = html;
        categoriaTitulo.innerHTML = '';
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar proveedores', 'error');
    }
}

// ============================================
// FUNCIONES ADICIONALES DE USUARIO
// ============================================
function verPerfil() {
    mostrarNotificacion('Sección de Perfil en desarrollo', 'info');
}

function verDirecciones() {
    mostrarNotificacion('Gestión de Direcciones en desarrollo', 'info');
}

function verFavoritos() {
    mostrarNotificacion('Favoritos en desarrollo', 'info');
}

function abrirRegistro() {
    cambiarTab('register');
    abrirAuthModal();
}

// ============================================
// CARGAR PRODUCTOS AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando tienda online con MySQL...');
    console.log('Sesión ID:', sesionId);
    cargarProductos();
    cargarCarrioDelaBD();
});
