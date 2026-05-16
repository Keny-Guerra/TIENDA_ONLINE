CREATE DATABASE IF NOT EXISTS tienda_online;
USE tienda_online;

CREATE TABLE IF NOT EXISTS proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  pais VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

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
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  cantidad_stock INT NOT NULL DEFAULT 0,
  cantidad_reservada INT DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carrito (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  sesion_id VARCHAR(255),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

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
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

INSERT INTO proveedores (nombre, contacto, email, telefono, ciudad, pais) VALUES
('TextilPeru S.A.', 'Juan García', 'juan@textilperu.pe', '+51 1 2345678', 'Lima', 'Perú'),
('SportGear China', 'Wei Zhang', 'wei@sportgear.cn', '+86 10 9876543', 'Shanghai', 'China'),
('Confecciones Brasil', 'Carlos Silva', 'carlos@confbrasil.br', '+55 11 98765432', 'São Paulo', 'Brasil'),
('Adidas Direct', 'Maria König', 'maria@adidas.de', '+49 30 1234567', 'Berlín', 'Alemania'),
('Nike Distribution', 'James Wilson', 'james@nike-dist.us', '+1 503 6712400', 'Oregón', 'USA');

INSERT INTO productos (nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda) VALUES
('Camiseta Perú 2024 Local', 'camisetas', 'futbol', 'Camiseta oficial de la selección peruana', 'Tela DryFit - Tallas S/M/L/XL', 189.90, 159.90, 16, 50, 'img/camisetas/peru-frente.jpg', 'img/camisetas/peru-espalda.jpg'),
('Camiseta Argentina 2024', 'camisetas', 'futbol', 'Camiseta clásica argentina', 'Tela DryFit - Tallas S/M/L/XL', 199.90, 169.90, 15, 35, 'img/camisetas/argentina-frente.jpg', 'img/camisetas/argentina-espalda.jpg'),
('Camiseta Brasil 2024', 'camisetas', 'futbol', 'Camiseta amarilla de Brasil', 'Tela DryFit - Tallas S/M/L/XL', 179.90, 149.90, 17, 42, 'img/camisetas/brasil-frente.jpg', 'img/camisetas/brasil-espalda.jpg'),
('Camiseta Italia 2024', 'camisetas', 'futbol', 'Camiseta celeste de Italia', 'Tela DryFit - Tallas S/M/L/XL', 179.90, 149.90, 17, 30, 'img/camisetas/italia-frente.jpg', 'img/camisetas/italia-espalda.jpg'),
('Camiseta Alemania 2024', 'camisetas', 'futbol', 'Camiseta blanca alemana', 'Tela DryFit - Tallas S/M/L/XL', 189.90, 159.90, 16, 38, 'img/camisetas/alemania-frente.jpg', 'img/camisetas/alemania-espalda.jpg'),
('Jersey Lakers 2024', 'camisetas', 'basquet', 'Jersey Lakers official', 'Tela Mesh - Tallas S/M/L/XL', 159.90, 129.90, 19, 40, 'img/camisetas/lakers-frente.jpg', 'img/camisetas/lakers-espalda.jpg'),
('Jersey Bulls Retro', 'camisetas', 'basquet', 'Jersey retro Bulls', 'Tela Mesh - Tallas S/M/L/XL', 179.90, 149.90, 17, 35, 'img/camisetas/bulls-frente.jpg', 'img/camisetas/bulls-espalda.jpg'),
('Jersey Warriors 2024', 'camisetas', 'basquet', 'Jersey Warriors official', 'Tela Mesh - Tallas S/M/L/XL', 169.90, 139.90, 18, 32, 'img/camisetas/warriors-frente.jpg', 'img/camisetas/warriors-espalda.jpg'),
('Jersey Celtics', 'camisetas', 'basquet', 'Jersey Celtics classic', 'Tela Mesh - Tallas S/M/L/XL', 159.90, 129.90, 19, 28, 'img/camisetas/celtics-frente.jpg', 'img/camisetas/celtics-espalda.jpg'),
('Jersey Nets', 'camisetas', 'basquet', 'Jersey Nets edition', 'Tela Mesh - Tallas S/M/L/XL', 189.90, 159.90, 16, 25, 'img/camisetas/nets-frente.jpg', 'img/camisetas/nets-espalda.jpg'),
('Camiseta Vóley Perú', 'camisetas', 'voley', 'Camiseta vóley Perú', 'Tela DryFit - Tallas S/M/L/XL', 149.90, 119.90, 20, 55, 'img/camisetas/voley-peru-frente.jpg', 'img/camisetas/voley-peru-espalda.jpg'),
('Camiseta Vóley Brasil', 'camisetas', 'voley', 'Camiseta vóley Brasil', 'Tela DryFit - Tallas S/M/L/XL', 159.90, 129.90, 19, 45, 'img/camisetas/voley-brasil-frente.jpg', 'img/camisetas/voley-brasil-espalda.jpg'),
('Zapatillas Predator', 'zapatillas', 'futbol', 'Adidas Predator profesional', 'Tallas 38-44', 349.90, 299.90, 14, 25, 'img/zapatillas/predator-lateral.jpg', 'img/zapatillas/predator-superior.jpg'),
('Zapatillas Nike Mercurial', 'zapatillas', 'futbol', 'Nike Mercurial velocidad', 'Tallas 38-44', 329.90, 279.90, 15, 30, 'img/zapatillas/mercurial-lateral.jpg', 'img/zapatillas/mercurial-superior.jpg'),
('Zapatillas Air Jordan', 'zapatillas', 'basquet', 'Air Jordan 1 Mid', 'Tallas 38-44', 599.90, 499.90, 17, 15, 'img/zapatillas/jordan-lateral.jpg', 'img/zapatillas/jordan-superior.jpg'),
('Zapatillas Nike LeBron', 'zapatillas', 'basquet', 'Nike LeBron 20', 'Tallas 38-44', 649.90, 549.90, 15, 18, 'img/zapatillas/lebron-lateral.jpg', 'img/zapatillas/lebron-superior.jpg'),
('Zapatillas Mizuno Wave', 'zapatillas', 'voley', 'Mizuno Wave Lightning', 'Tallas 35-40', 279.90, 239.90, 14, 20, 'img/zapatillas/mizuno-lateral.jpg', 'img/zapatillas/mizuno-superior.jpg'),
('Polo Perú', 'polos', 'futbol', 'Polo Perú training', 'Algodón - Tallas S/M/L/XL', 89.90, 69.90, 22, 60, 'img/polos/polo-peru-frente.jpg', 'img/polos/polo-peru-espalda.jpg'),
('Polo Argentina', 'polos', 'futbol', 'Polo Argentina training', 'Algodón - Tallas S/M/L/XL', 89.90, 69.90, 22, 45, 'img/polos/polo-argentina-frente.jpg', 'img/polos/polo-argentina-espalda.jpg'),
('Polo Lakers', 'polos', 'basquet', 'Polo NBA Lakers', 'Algodón - Tallas S/M/L/XL', 99.90, 79.90, 20, 45, 'img/polos/polo-lakers-frente.jpg', 'img/polos/polo-lakers-espalda.jpg'),
('Polo Vóley Perú', 'polos', 'voley', 'Polo vóley Perú', 'Poliéster - Tallas S/M/L/XL', 79.90, 59.90, 25, 70, 'img/polos/polo-voley-peru-frente.jpg', 'img/polos/polo-voley-peru-espalda.jpg');

INSERT INTO precios (producto_id, proveedor_id, precio_costo, precio_venta, margen_ganancia, cantidad_minima) VALUES
(1,1,85.00,159.90,88.11,10),
(1,2,75.00,159.90,113.20,50),
(2,1,90.00,169.90,88.78,10),
(2,5,95.00,169.90,78.84,25),
(3,3,70.00,149.90,114.14,20),
(3,2,68.00,149.90,120.44,50),
(4,4,80.00,149.90,87.38,15),
(5,5,88.00,159.90,81.59,20),
(6,5,70.00,129.90,85.57,15),
(6,2,65.00,129.90,99.85,50),
(7,2,75.00,149.90,99.87,40),
(8,5,72.00,139.90,94.31,20),
(9,5,68.00,129.90,91.03,15),
(10,2,82.00,159.90,95.00,30),
(11,1,65.00,119.90,84.62,25),
(12,3,70.00,129.90,85.57,20),
(13,4,150.00,299.90,99.93,5),
(14,5,120.00,279.90,133.25,8),
(15,5,280.00,499.90,78.54,5),
(16,5,300.00,549.90,83.30,5),
(17,2,120.00,239.90,99.92,15),
(18,5,38.00,69.90,83.95,50),
(19,1,38.00,69.90,83.95,50),
(20,5,42.00,79.90,90.24,40),
(21,1,35.00,59.90,71.14,60);

INSERT INTO entregas (producto_id, proveedor_id, dias_minimos, dias_maximos, dias_promedio, costo_envio, ubicacion_bodega) VALUES
(1,1,2,5,3,15,'Lima - Central'),
(1,2,15,25,20,45,'Shanghai - Callao'),
(2,1,2,5,3,15,'Lima - Central'),
(2,5,12,22,17,55,'Oregon - Marítimo'),
(3,3,8,15,11,30,'São Paulo'),
(3,2,15,25,20,45,'Shanghai - Callao'),
(4,4,10,20,15,50,'Berlín - Aéreo'),
(5,5,12,22,17,55,'Oregon - Marítimo'),
(6,5,12,22,17,55,'Oregon - Marítimo'),
(6,2,15,25,20,45,'Shanghai - Callao'),
(7,2,15,25,20,45,'Shanghai - Callao'),
(8,5,12,22,17,55,'Oregon - Marítimo'),
(9,5,12,22,17,55,'Oregon - Marítimo'),
(10,2,15,25,20,45,'Shanghai - Callao'),
(11,1,2,5,3,10,'Lima - Central'),
(12,3,8,15,11,30,'São Paulo'),
(13,4,10,20,15,55,'Berlín - Aéreo'),
(14,5,12,22,17,60,'Oregon - Marítimo'),
(15,5,12,22,17,65,'Oregon - Marítimo'),
(16,5,12,22,17,65,'Oregon - Marítimo'),
(17,2,15,25,20,40,'Shanghai - Callao'),
(18,4,10,20,15,50,'Berlín - Aéreo'),
(19,1,2,5,3,10,'Lima - Central'),
(20,5,12,22,17,45,'Oregon - Marítimo'),
(21,1,2,5,3,10,'Lima - Central');

INSERT INTO inventario (producto_id, proveedor_id, cantidad_stock, cantidad_reservada) VALUES
(1,1,150,20),(1,2,300,50),
(2,1,120,15),(2,5,100,10),
(3,3,200,30),(3,2,250,40),
(4,4,180,25),(5,5,140,20),
(6,5,160,25),(6,2,280,45),
(7,2,200,30),(8,5,130,20),
(9,5,100,15),(10,2,150,20),
(11,1,200,25),(12,3,180,25),
(13,4,80,15),(14,5,110,18),
(15,5,50,10),(16,5,60,12),
(17,2,100,15),(18,4,100,18),
(19,1,300,40),(20,5,200,25),
(21,1,350,45);
