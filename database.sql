-- =====================================================
-- CREAR BASE DE DATOS
-- =====================================================
CREATE DATABASE IF NOT EXISTS tienda_online;
USE tienda_online;

-- =====================================================
-- TABLA: PROVEEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  pais VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  deporte VARCHAR(100) NOT NULL,
  descripcion TEXT,
  especificaciones TEXT,
  precioOriginal DECIMAL(10, 2) NOT NULL,
  precioOferta DECIMAL(10, 2),
  descuento INT,
  stock INT DEFAULT 0,
  vistaFrente VARCHAR(255),
  vistaEspalda VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: PRECIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS precios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  precio_costo DECIMAL(10, 2) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  margen_ganancia DECIMAL(5, 2),
  cantidad_minima INT DEFAULT 1,
  cantidad_maxima INT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_producto_proveedor (producto_id, proveedor_id)
);

-- =====================================================
-- TABLA: ENTREGAS
-- =====================================================
CREATE TABLE IF NOT EXISTS entregas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  dias_minimos INT NOT NULL DEFAULT 1,
  dias_maximos INT NOT NULL DEFAULT 7,
  dias_promedio INT,
  costo_envio DECIMAL(10, 2) DEFAULT 0,
  ubicacion_bodega VARCHAR(255),
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: INVENTARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS inventario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  cantidad_stock INT NOT NULL DEFAULT 0,
  cantidad_reservada INT DEFAULT 0,
  cantidad_disponible INT GENERATED ALWAYS AS (cantidad_stock - cantidad_reservada) STORED,
  ultimo_restock TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: CARRITO
-- =====================================================
CREATE TABLE IF NOT EXISTS carrito (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  sesion_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =====================================================
-- TABLA: PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  proveedor_id INT,
  total DECIMAL(10, 2),
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_entrega_estimada DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- =====================================================
-- INSERTAR PROVEEDORES
-- =====================================================
INSERT INTO proveedores (nombre, contacto, email, telefono, ciudad, pais, activo) VALUES
('TextilPeru S.A.', 'Juan García', 'juan@textilperu.pe', '(+51) 1 2345678', 'Lima', 'Perú', TRUE),
('SportGear China', 'Wei Zhang', 'wei@sportgear.cn', '(+86) 10 9876543', 'Shanghai', 'China', TRUE),
('Confecciones Brasil', 'Carlos Silva', 'carlos@confbrasil.br', '(+55) 11 98765432', 'São Paulo', 'Brasil', TRUE),
('Adidas Direct', 'Maria König', 'maria@adidas.de', '(+49) 30 1234567', 'Berlín', 'Alemania', TRUE),
('Nike Distribution', 'James Wilson', 'james@nike-dist.us', '(+1) 503 6712400', 'Oregón', 'USA', TRUE);

-- =====================================================
-- INSERTAR PRODUCTOS (45 PRODUCTOS COMPLETOS)
-- =====================================================
INSERT INTO productos (nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda) VALUES
-- FÚTBOL - CAMISETAS
('Camiseta Perú 2024 Local', 'camisetas', 'futbol', 'Camiseta oficial de la selección peruana temporada 2024.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 189.90, 159.90, 16, 50, 'img/camisetas/peru-frente.jpg', 'img/camisetas/peru-espalda.jpg'),
('Camiseta Argentina 2024 Local', 'camisetas', 'futbol', 'Camiseta clásica de la selección argentina, campeona del mundo.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 199.90, 169.90, 15, 35, 'img/camisetas/argentina-frente.jpg', 'img/camisetas/argentina-espalda.jpg'),
('Camiseta Brasil 2024 Visitante', 'camisetas', 'futbol', 'La clásica alternativa amarilla de Brasil.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 179.90, 149.90, 17, 42, 'img/camisetas/brasil-frente.jpg', 'img/camisetas/brasil-espalda.jpg'),
('Camiseta Italia 2024 Local', 'camisetas', 'futbol', 'Camiseta celeste de Italia con detalles modernos.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 179.90, 149.90, 17, 30, 'img/camisetas/italia-frente.jpg', 'img/camisetas/italia-espalda.jpg'),
('Camiseta Alemania 2024 Local', 'camisetas', 'futbol', 'La tradicional camiseta blanca alemana con tecnología moderna.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 189.90, 159.90, 16, 38, 'img/camisetas/alemania-frente.jpg', 'img/camisetas/alemania-espalda.jpg'),

-- BÁSQUET - CAMISETAS
('Jersey Lakers 2024', 'camisetas', 'basquet', 'Jersey oficial de Los Angeles Lakers.', 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer', 159.90, 129.90, 19, 40, 'img/camisetas/lakers-frente.jpg', 'img/camisetas/lakers-espalda.jpg'),
('Jersey Bulls Retro', 'camisetas', 'basquet', 'Jersey retro de Chicago Bulls, edición limitada de los años 90.', 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer', 179.90, 149.90, 17, 35, 'img/camisetas/bulls-frente.jpg', 'img/camisetas/bulls-espalda.jpg'),
('Jersey Warriors 2024', 'camisetas', 'basquet', 'Jersey oficial de Golden State Warriors con diseño moderno.', 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer', 169.90, 139.90, 18, 32, 'img/camisetas/warriors-frente.jpg', 'img/camisetas/warriors-espalda.jpg'),
('Jersey Celtics Clásico', 'camisetas', 'basquet', 'Jersey clásico de Boston Celtics con diseño tradicional.', 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer', 159.90, 129.90, 19, 28, 'img/camisetas/celtics-frente.jpg', 'img/camisetas/celtics-espalda.jpg'),
('Jersey Nets City Edition', 'camisetas', 'basquet', 'Jersey City Edition de Brooklyn Nets con diseño exclusivo.', 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer', 189.90, 159.90, 16, 25, 'img/camisetas/nets-frente.jpg', 'img/camisetas/nets-espalda.jpg'),

-- VÓLEY - CAMISETAS
('Camiseta Vóley Perú 2024', 'camisetas', 'voley', 'Camiseta oficial de la selección peruana de vóley.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 149.90, 119.90, 20, 55, 'img/camisetas/voley-peru-frente.jpg', 'img/camisetas/voley-peru-espalda.jpg'),
('Camiseta Vóley Brasil 2024', 'camisetas', 'voley', 'Camiseta oficial de la selección brasileña de vóley.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 159.90, 129.90, 19, 45, 'img/camisetas/voley-brasil-frente.jpg', 'img/camisetas/voley-brasil-espalda.jpg'),
('Camiseta Vóley USA 2024', 'camisetas', 'voley', 'Camiseta oficial de Estados Unidos para vóley.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 169.90, 139.90, 18, 38, 'img/camisetas/voley-usa-frente.jpg', 'img/camisetas/voley-usa-espalda.jpg'),
('Camiseta Vóley Italia 2024', 'camisetas', 'voley', 'Camiseta oficial de Italia para vóley.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 159.90, 129.90, 19, 42, 'img/camisetas/voley-italia-frente.jpg', 'img/camisetas/voley-italia-espalda.jpg'),
('Camiseta Vóley Polonia 2024', 'camisetas', 'voley', 'Camiseta oficial de Polonia para vóley.', 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado', 149.90, 119.90, 20, 35, 'img/camisetas/voley-polonia-frente.jpg', 'img/camisetas/voley-polonia-espalda.jpg'),

-- FÚTBOL - ZAPATILLAS
('Adidas Predator Edge', 'zapatillas', 'futbol', 'Zapatillas de fútbol profesional Adidas Predator.', 'Tallas 38-44 - Tacos mixtos - Tecnología Demonscale', 349.90, 299.90, 14, 25, 'img/zapatillas/predator-lateral.jpg', 'img/zapatillas/predator-superior.jpg'),
('Nike Mercurial Superfly', 'zapatillas', 'futbol', 'Zapatillas Nike Mercurial para velocidad pura.', 'Tallas 38-44 - Tacos cónicos - Tecnología Aerotrack', 329.90, 279.90, 15, 30, 'img/zapatillas/mercurial-lateral.jpg', 'img/zapatillas/mercurial-superior.jpg'),
('Puma Future Z', 'zapatillas', 'futbol', 'Zapatillas Puma Future con innovación y estilo.', 'Tallas 38-44 - Tacos mixtos - Sistema FUZIONFIT', 299.90, 249.90, 17, 28, 'img/zapatillas/puma-future-lateral.jpg', 'img/zapatillas/puma-future-superior.jpg'),
('Nike Phantom GT', 'zapatillas', 'futbol', 'Zapatillas Nike Phantom para precisión en cada pase.', 'Tallas 38-44 - Tacos mixtos - Zona de precisión', 319.90, 269.90, 16, 22, 'img/zapatillas/phantom-lateral.jpg', 'img/zapatillas/phantom-superior.jpg'),
('Adidas Copa Sense', 'zapatillas', 'futbol', 'Zapatillas Adidas Copa con comodidad y tradición.', 'Tallas 38-44 - Tacos mixtos - Cuero de canguro', 289.90, 239.90, 17, 26, 'img/zapatillas/copa-lateral.jpg', 'img/zapatillas/copa-superior.jpg'),

-- BÁSQUET - ZAPATILLAS
('Air Jordan 1 Mid', 'zapatillas', 'basquet', 'Las icónicas zapatillas que revolucionaron el deporte.', 'Tallas 38-44 - Cuero - Amortiguación Air', 599.90, 499.90, 17, 15, 'img/zapatillas/jordan-lateral.jpg', 'img/zapatillas/jordan-superior.jpg'),
('Nike LeBron 20', 'zapatillas', 'basquet', 'Zapatillas Nike LeBron para máximo rendimiento.', 'Tallas 38-44 - Amortiguación Zoom Air', 649.90, 549.90, 15, 18, 'img/zapatillas/lebron-lateral.jpg', 'img/zapatillas/lebron-superior.jpg'),
('Adidas Harden Vol 7', 'zapatillas', 'basquet', 'Zapatillas Adidas Harden con estilo y rendimiento.', 'Tallas 38-44 - Boost technology', 549.90, 459.90, 16, 20, 'img/zapatillas/harden-lateral.jpg', 'img/zapatillas/harden-superior.jpg'),
('Under Armour Curry 10', 'zapatillas', 'basquet', 'Zapatillas Curry para precisión y velocidad.', 'Tallas 38-44 - UA Flow technology', 529.90, 449.90, 15, 17, 'img/zapatillas/curry-lateral.jpg', 'img/zapatillas/curry-superior.jpg'),
('Puma MB.02 LaMelo', 'zapatillas', 'basquet', 'Zapatillas Puma MB.02 con diseño audaz.', 'Tallas 38-44 - Nitro foam', 499.90, 419.90, 16, 22, 'img/zapatillas/mb02-lateral.jpg', 'img/zapatillas/mb02-superior.jpg'),

-- VÓLEY - ZAPATILLAS
('Mizuno Wave Lightning', 'zapatillas', 'voley', 'Zapatillas Mizuno especializadas para vóley.', 'Tallas 35-40 - Tecnología Wave - Suela de goma', 279.90, 239.90, 14, 20, 'img/zapatillas/mizuno-lateral.jpg', 'img/zapatillas/mizuno-superior.jpg'),
('Asics Netburner Ballistic', 'zapatillas', 'voley', 'Zapatillas Asics para vóley con estabilidad.', 'Tallas 35-40 - Gel technology - Trusstic System', 299.90, 259.90, 13, 18, 'img/zapatillas/asics-lateral.jpg', 'img/zapatillas/asics-superior.jpg'),
('Adidas Crazyflight', 'zapatillas', 'voley', 'Zapatillas Adidas para vóley ligeras y rápidas.', 'Tallas 35-40 - Boost technology - Primeknit', 289.90, 249.90, 14, 22, 'img/zapatillas/crazyflight-lateral.jpg', 'img/zapatillas/crazyflight-superior.jpg'),
('Nike Hyperace 3', 'zapatillas', 'voley', 'Zapatillas Nike para vóley con durabilidad.', 'Tallas 35-40 - Zoom Air - Suela multidireccional', 259.90, 219.90, 15, 25, 'img/zapatillas/hyperace-lateral.jpg', 'img/zapatillas/hyperace-superior.jpg'),
('Mizuno Wave Momentum', 'zapatillas', 'voley', 'Zapatillas Mizuno de alta gama para vóley profesional.', 'Tallas 35-40 - Wave technology - X10 outsole', 329.90, 279.90, 15, 15, 'img/zapatillas/momentum-lateral.jpg', 'img/zapatillas/momentum-superior.jpg'),

-- FÚTBOL - POLOS
('Polo Entrenamiento Perú', 'polos', 'futbol', 'Polo de entrenamiento oficial de la selección peruana.', 'Algodón/Poliéster - Tallas S/M/L/XL - Estampado bordado', 89.90, 69.90, 22, 60, 'img/polos/polo-peru-frente.jpg', 'img/polos/polo-peru-espalda.jpg'),
('Polo Argentina Training', 'polos', 'futbol', 'Polo de entrenamiento de la selección argentina.', 'Algodón/Poliéster - Tallas S/M/L/XL - Estampado bordado', 89.90, 69.90, 22, 45, 'img/polos/polo-argentina-frente.jpg', 'img/polos/polo-argentina-espalda.jpg'),
('Sudadera Brasil Casual', 'polos', 'futbol', 'Sudadera casual de Brasil para el día a día.', 'Algodón - Tallas S/M/L/XL - Estampado', 79.90, 59.90, 25, 55, 'img/polos/polo-brasil-frente.jpg', 'img/polos/polo-brasil-espalda.jpg'),
('Polo Uruguay Premium', 'polos', 'futbol', 'Polo premium de Uruguay con algodón de alta calidad.', 'Algodón Pima - Tallas S/M/L/XL - Bordado', 99.90, 79.90, 20, 40, 'img/polos/polo-uruguay-frente.jpg', 'img/polos/polo-uruguay-espalda.jpg'),
('Polo Alemania Sport', 'polos', 'futbol', 'Polo deportivo de Alemania ideal para entrenar.', 'Poliéster - Tallas S/M/L/XL - Estampado', 84.90, 64.90, 24, 48, 'img/polos/polo-alemania-frente.jpg', 'img/polos/polo-alemania-espalda.jpg'),

-- BÁSQUET - POLOS
('Polo NBA Lakers', 'polos', 'basquet', 'Polo oficial de Los Angeles Lakers.', 'Algodón - Tallas S/M/L/XL - Bordado', 99.90, 79.90, 20, 45, 'img/polos/polo-lakers-frente.jpg', 'img/polos/polo-lakers-espalda.jpg'),
('Polo NBA Bulls', 'polos', 'basquet', 'Polo retro de Chicago Bulls.', 'Algodón - Tallas S/M/L/XL - Estampado', 94.90, 74.90, 21, 42, 'img/polos/polo-bulls-frente.jpg', 'img/polos/polo-bulls-espalda.jpg'),
('Polo NBA Warriors', 'polos', 'basquet', 'Polo de Golden State Warriors.', 'Algodón - Tallas S/M/L/XL - Bordado', 99.90, 79.90, 20, 38, 'img/polos/polo-warriors-frente.jpg', 'img/polos/polo-warriors-espalda.jpg'),
('Polo NBA Celtics', 'polos', 'basquet', 'Polo clásico de Boston Celtics.', 'Algodón - Tallas S/M/L/XL - Estampado', 94.90, 74.90, 21, 35, 'img/polos/polo-celtics-frente.jpg', 'img/polos/polo-celtics-espalda.jpg'),
('Polo NBA All Star', 'polos', 'basquet', 'Polo conmemorativo del Juego de Estrellas.', 'Algodón - Tallas S/M/L/XL - Edición limitada', 109.90, 89.90, 18, 30, 'img/polos/polo-nba-allstar-frente.jpg', 'img/polos/polo-nba-allstar-espalda.jpg'),

-- VÓLEY - POLOS
('Polo Vóley Perú Training', 'polos', 'voley', 'Polo de entrenamiento de la selección peruana de vóley.', 'Poliéster - Tallas S/M/L/XL - Estampado', 79.90, 59.90, 25, 70, 'img/polos/polo-voley-peru-frente.jpg', 'img/polos/polo-voley-peru-espalda.jpg'),
('Polo Vóley Brasil', 'polos', 'voley', 'Polo de Brasil para vóley playa.', 'Poliéster - Tallas S/M/L/XL - Estampado', 84.90, 64.90, 24, 55, 'img/polos/polo-voley-brasil-frente.jpg', 'img/polos/polo-voley-brasil-espalda.jpg'),
('Polo Vóley USA', 'polos', 'voley', 'Polo deportivo de Estados Unidos para vóley.', 'Poliéster - Tallas S/M/L/XL - Estampado', 89.90, 69.90, 22, 48, 'img/polos/polo-voley-usa-frente.jpg', 'img/polos/polo-voley-usa-espalda.jpg'),
('Polo Vóley Italia', 'polos', 'voley', 'Polo elegante de Italia para vóley.', 'Algodón/Poliéster - Tallas S/M/L/XL - Bordado', 94.90, 74.90, 21, 42, 'img/polos/polo-voley-italia-frente.jpg', 'img/polos/polo-voley-italia-espalda.jpg'),
('Polo Vóley Polonia', 'polos', 'voley', 'Polo de Polonia para vóley.', 'Poliéster - Tallas S/M/L/XL - Estampado', 84.90, 64.90, 24, 46, 'img/polos/polo-voley-polonia-frente.jpg', 'img/polos/polo-voley-polonia-espalda.jpg');

-- =====================================================
-- INSERTAR PRECIOS (Variados por proveedor para cada producto)
-- =====================================================
INSERT INTO precios (producto_id, proveedor_id, precio_costo, precio_venta, margen_ganancia, cantidad_minima, cantidad_maxima) VALUES
-- Camiseta Perú
(1, 1, 85.00, 159.90, 88.11, 10, 500),
(1, 2, 75.00, 159.90, 113.20, 50, 1000),
-- Camiseta Argentina
(2, 1, 90.00, 169.90, 88.78, 10, 500),
(2, 5, 95.00, 169.90, 78.84, 25, 300),
-- Camiseta Brasil
(3, 3, 70.00, 149.90, 114.14, 20, 800),
(3, 2, 68.00, 149.90, 120.44, 50, 1000),
-- Camiseta Italia
(4, 4, 80.00, 149.90, 87.38, 15, 400),
(4, 1, 82.00, 149.90, 82.80, 20, 500),
-- Camiseta Alemania
(5, 5, 88.00, 159.90, 81.59, 20, 500),
(5, 1, 86.00, 159.90, 85.93, 25, 600),
-- Jersey Lakers
(6, 5, 70.00, 129.90, 85.57, 15, 300),
(6, 2, 65.00, 129.90, 99.85, 50, 800),
-- Jersey Bulls
(7, 2, 75.00, 149.90, 99.87, 40, 700),
(7, 5, 80.00, 149.90, 87.38, 20, 400),
-- Jersey Warriors
(8, 5, 72.00, 139.90, 94.31, 20, 400),
(8, 2, 70.00, 139.90, 99.86, 50, 900),
-- Jersey Celtics
(9, 5, 68.00, 129.90, 91.03, 15, 300),
(9, 2, 65.00, 129.90, 99.85, 50, 800),
-- Jersey Nets
(10, 2, 82.00, 159.90, 95.00, 30, 600),
(10, 5, 85.00, 159.90, 88.11, 20, 500),
-- Resto de productos distribuidos entre 1-5 proveedores cada uno
(11, 1, 65.00, 119.90, 84.62, 25, 600),
(11, 3, 62.00, 119.90, 93.39, 50, 1000),
(12, 3, 70.00, 129.90, 85.57, 20, 500),
(12, 2, 68.00, 129.90, 91.03, 50, 900),
(13, 5, 75.00, 139.90, 86.53, 15, 400),
(13, 2, 72.00, 139.90, 94.31, 50, 800),
(14, 4, 70.00, 129.90, 85.57, 20, 500),
(14, 1, 72.00, 129.90, 80.42, 25, 600),
(15, 1, 65.00, 119.90, 84.62, 25, 600),
(15, 3, 62.00, 119.90, 93.39, 50, 1000),
(16, 4, 150.00, 299.90, 99.93, 5, 100),
(16, 5, 155.00, 299.90, 93.48, 10, 200),
(17, 5, 120.00, 279.90, 133.25, 8, 150),
(17, 2, 115.00, 279.90, 143.39, 30, 500),
(18, 2, 110.00, 249.90, 127.18, 20, 400),
(18, 1, 115.00, 249.90, 117.30, 15, 300),
(19, 5, 118.00, 269.90, 128.56, 10, 200),
(19, 4, 120.00, 269.90, 124.92, 12, 250),
(20, 4, 130.00, 239.90, 84.54, 15, 400),
(20, 1, 128.00, 239.90, 87.42, 20, 500),
(21, 5, 280.00, 499.90, 78.54, 5, 50),
(21, 2, 290.00, 499.90, 72.38, 10, 100),
(22, 5, 300.00, 549.90, 83.30, 5, 50),
(22, 2, 310.00, 549.90, 77.39, 10, 100),
(23, 4, 200.00, 459.90, 129.95, 8, 100),
(23, 2, 195.00, 459.90, 135.82, 20, 300),
(24, 5, 185.00, 449.90, 143.19, 8, 100),
(24, 2, 180.00, 449.90, 149.94, 20, 300),
(25, 2, 185.00, 419.90, 127.00, 20, 400),
(25, 5, 190.00, 419.90, 120.95, 10, 200),
(26, 2, 120.00, 239.90, 99.92, 15, 300),
(26, 1, 125.00, 239.90, 91.92, 20, 400),
(27, 2, 130.00, 259.90, 99.92, 15, 300),
(27, 4, 135.00, 259.90, 92.52, 10, 250),
(28, 4, 128.00, 249.90, 95.24, 12, 300),
(28, 2, 125.00, 249.90, 99.92, 20, 400),
(29, 5, 115.00, 219.90, 91.22, 15, 300),
(29, 2, 112.00, 219.90, 96.34, 30, 500),
(30, 2, 150.00, 279.90, 86.60, 10, 250),
(30, 4, 155.00, 279.90, 80.58, 8, 200),
(31, 1, 38.00, 69.90, 83.95, 50, 1000),
(31, 3, 36.00, 69.90, 94.17, 80, 1500),
(32, 1, 38.00, 69.90, 83.95, 50, 1000),
(32, 5, 40.00, 69.90, 74.75, 40, 800),
(33, 3, 35.00, 59.90, 71.14, 60, 1200),
(33, 2, 32.00, 59.90, 87.19, 100, 2000),
(34, 1, 42.00, 79.90, 90.24, 40, 900),
(34, 4, 45.00, 79.90, 77.56, 30, 700),
(35, 1, 35.00, 64.90, 85.43, 50, 1000),
(35, 3, 33.00, 64.90, 96.67, 80, 1500),
(36, 5, 42.00, 79.90, 90.24, 40, 900),
(36, 2, 40.00, 79.90, 99.75, 60, 1200),
(37, 2, 40.00, 74.90, 87.25, 50, 1000),
(37, 5, 42.00, 74.90, 78.33, 40, 800),
(38, 5, 42.00, 79.90, 90.24, 40, 900),
(38, 2, 40.00, 79.90, 99.75, 60, 1200),
(39, 2, 40.00, 74.90, 87.25, 50, 1000),
(39, 5, 42.00, 74.90, 78.33, 40, 800),
(40, 5, 48.00, 89.90, 87.29, 30, 700),
(40, 4, 50.00, 89.90, 79.80, 25, 600),
(41, 1, 35.00, 59.90, 71.14, 60, 1200),
(41, 3, 32.00, 59.90, 87.19, 100, 2000),
(42, 3, 36.00, 64.90, 80.28, 70, 1400),
(42, 2, 34.00, 64.90, 90.88, 100, 1800),
(43, 5, 38.00, 69.90, 83.95, 50, 1000),
(43, 2, 36.00, 69.90, 94.17, 80, 1500),
(44, 4, 40.00, 74.90, 87.25, 45, 950),
(44, 1, 42.00, 74.90, 78.33, 40, 800),
(45, 3, 36.00, 64.90, 80.28, 70, 1400),
(45, 2, 34.00, 64.90, 90.88, 100, 1800);

-- =====================================================
-- INSERTAR ENTREGAS
-- =====================================================
INSERT INTO entregas (producto_id, proveedor_id, dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega, disponible) VALUES
-- TextilPeru (Lima, Perú) - Local
(1, 1, 2, 5, 3, 15.00, 'Lima, Perú - Bodega Central', TRUE),
(2, 1, 2, 5, 3, 15.00, 'Lima, Perú - Bodega Central', TRUE),
(31, 1, 2, 5, 3, 10.00, 'Lima, Perú - Bodega Central', TRUE),
(32, 1, 2, 5, 3, 10.00, 'Lima, Perú - Bodega Central', TRUE),
(34, 1, 2, 5, 3, 10.00, 'Lima, Perú - Bodega Central', TRUE),
(35, 1, 2, 5, 3, 10.00, 'Lima, Perú - Bodega Central', TRUE),
(41, 1, 2, 5, 3, 10.00, 'Lima, Perú - Bodega Central', TRUE),
-- SportGear China (Shanghai, China) - Internacional
(1, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(3, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(6, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(7, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(8, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(9, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(12, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(13, 2, 15, 25, 20, 45.00, 'Shanghai, China - Puerto Callao', TRUE),
(17, 2, 15, 25, 20, 50.00, 'Shanghai, China - Puerto Callao', TRUE),
(18, 2, 15, 25, 20, 50.00, 'Shanghai, China - Puerto Callao', TRUE),
(26, 2, 15, 25, 20, 40.00, 'Shanghai, China - Puerto Callao', TRUE),
(27, 2, 15, 25, 20, 40.00, 'Shanghai, China - Puerto Callao', TRUE),
(28, 2, 15, 25, 20, 40.00, 'Shanghai, China - Puerto Callao', TRUE),
(29, 2, 15, 25, 20, 40.00, 'Shanghai, China - Puerto Callao', TRUE),
(33, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(36, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(37, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(38, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(39, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(42, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(43, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
(45, 2, 15, 25, 20, 35.00, 'Shanghai, China - Puerto Callao', TRUE),
-- Confecciones Brasil (São Paulo, Brasil)
(3, 3, 8, 15, 11, 30.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(11, 3, 8, 15, 11, 30.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(12, 3, 8, 15, 11, 30.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(15, 3, 8, 15, 11, 30.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(31, 3, 8, 15, 11, 20.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(33, 3, 8, 15, 11, 20.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(35, 3, 8, 15, 11, 20.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(42, 3, 8, 15, 11, 20.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
(44, 3, 8, 15, 11, 20.00, 'São Paulo, Brasil - Frontera Peru', TRUE),
-- Adidas Direct (Berlín, Alemania)
(4, 4, 10, 20, 15, 50.00, 'Berlín, Alemania - Aéreo', TRUE),
(14, 4, 10, 20, 15, 50.00, 'Berlín, Alemania - Aéreo', TRUE),
(16, 4, 10, 20, 15, 55.00, 'Berlín, Alemania - Aéreo', TRUE),
(19, 4, 10, 20, 15, 55.00, 'Berlín, Alemania - Aéreo', TRUE),
(20, 4, 10, 20, 15, 55.00, 'Berlín, Alemania - Aéreo', TRUE),
(23, 4, 10, 20, 15, 60.00, 'Berlín, Alemania - Aéreo', TRUE),
(27, 4, 10, 20, 15, 50.00, 'Berlín, Alemania - Aéreo', TRUE),
(28, 4, 10, 20, 15, 50.00, 'Berlín, Alemania - Aéreo', TRUE),
(30, 4, 10, 20, 15, 50.00, 'Berlín, Alemania - Aéreo', TRUE),
(34, 4, 10, 20, 15, 45.00, 'Berlín, Alemania - Aéreo', TRUE),
(40, 4, 10, 20, 15, 45.00, 'Berlín, Alemania - Aéreo', TRUE),
(44, 4, 10, 20, 15, 45.00, 'Berlín, Alemania - Aéreo', TRUE),
-- Nike Distribution (Oregon, USA)
(2, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(5, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(6, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(7, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(8, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(9, 5, 12, 22, 17, 55.00, 'Oregon, USA - Marítimo', TRUE),
(10, 5, 12, 22, 17, 60.00, 'Oregon, USA - Marítimo', TRUE),
(13, 5, 12, 22, 17, 50.00, 'Oregon, USA - Marítimo', TRUE),
(17, 5, 12, 22, 17, 60.00, 'Oregon, USA - Marítimo', TRUE),
(21, 5, 12, 22, 17, 65.00, 'Oregon, USA - Marítimo', TRUE),
(22, 5, 12, 22, 17, 65.00, 'Oregon, USA - Marítimo', TRUE),
(24, 5, 12, 22, 17, 65.00, 'Oregon, USA - Marítimo', TRUE),
(25, 5, 12, 22, 17, 65.00, 'Oregon, USA - Marítimo', TRUE),
(29, 5, 12, 22, 17, 50.00, 'Oregon, USA - Marítimo', TRUE),
(32, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE),
(36, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE),
(37, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE),
(38, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE),
(39, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE),
(40, 5, 12, 22, 17, 50.00, 'Oregon, USA - Marítimo', TRUE),
(43, 5, 12, 22, 17, 45.00, 'Oregon, USA - Marítimo', TRUE);

-- =====================================================
-- INSERTAR INVENTARIO
-- =====================================================
INSERT INTO inventario (producto_id, proveedor_id, cantidad_stock, cantidad_reservada) VALUES
-- Distribuir inventario para todos los productos
(1, 1, 150, 20), (1, 2, 300, 50),
(2, 1, 120, 15), (2, 5, 100, 10),
(3, 3, 200, 30), (3, 2, 250, 40),
(4, 4, 180, 25), (4, 1, 150, 20),
(5, 5, 140, 20), (5, 1, 160, 25),
(6, 5, 160, 25), (6, 2, 280, 45),
(7, 2, 200, 30), (7, 5, 120, 20),
(8, 5, 130, 20), (8, 2, 240, 40),
(9, 5, 100, 15), (9, 2, 200, 30),
(10, 2, 150, 20), (10, 5, 110, 18),
(11, 1, 200, 25), (11, 3, 350, 50),
(12, 3, 180, 25), (12, 2, 220, 35),
(13, 5, 140, 20), (13, 2, 260, 40),
(14, 4, 160, 20), (14, 1, 180, 25),
(15, 1, 150, 20), (15, 3, 280, 40),
(16, 4, 80, 15), (16, 5, 60, 10),
(17, 5, 110, 18), (17, 2, 150, 25),
(18, 2, 130, 20), (18, 1, 100, 15),
(19, 5, 90, 15), (19, 4, 70, 10),
(20, 4, 100, 18), (20, 1, 120, 20),
(21, 5, 50, 10), (21, 2, 70, 15),
(22, 5, 60, 12), (22, 2, 80, 18),
(23, 4, 75, 15), (23, 2, 110, 20),
(24, 5, 65, 12), (24, 2, 100, 18),
(25, 2, 130, 20), (25, 5, 90, 15),
(26, 2, 100, 15), (26, 1, 120, 20),
(27, 2, 110, 18), (27, 4, 80, 12),
(28, 4, 95, 15), (28, 2, 140, 22),
(29, 5, 140, 20), (29, 2, 180, 30),
(30, 2, 70, 12), (30, 4, 55, 10),
(31, 1, 300, 40), (31, 3, 450, 60),
(32, 1, 220, 30), (32, 5, 180, 25),
(33, 3, 350, 50), (33, 2, 500, 70),
(34, 1, 200, 25), (34, 4, 150, 20),
(35, 1, 250, 35), (35, 3, 380, 50),
(36, 5, 200, 25), (36, 2, 280, 40),
(37, 2, 220, 30), (37, 5, 160, 22),
(38, 5, 180, 25), (38, 2, 240, 35),
(39, 2, 210, 28), (39, 5, 160, 22),
(40, 5, 140, 20), (40, 4, 120, 16),
(41, 1, 350, 45), (41, 3, 500, 70),
(42, 3, 300, 40), (42, 2, 450, 60),
(43, 5, 250, 35), (43, 2, 400, 55),
(44, 4, 220, 30), (44, 1, 190, 25),
(45, 3, 350, 48), (45, 2, 480, 65);
