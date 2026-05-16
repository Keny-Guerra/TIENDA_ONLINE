/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: tienda_online
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-6 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `sesion_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `carrito` WRITE;
/*!40000 ALTER TABLE `carrito` DISABLE KEYS */;
INSERT INTO `carrito` VALUES
(1,1,2,'test_123'),
(2,3,3,'ses_1778606192652'),
(3,4,1,'ses_1778606192652'),
(4,1,2,'test-session-123'),
(5,2,1,'test-flow'),
(6,2,1,'ses_1778606192652'),
(7,22,2,'ses_1778606192652');
/*!40000 ALTER TABLE `carrito` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `dias_minimos` int(11) NOT NULL DEFAULT 1,
  `dias_maximos` int(11) NOT NULL DEFAULT 7,
  `dias_promedio` int(11) DEFAULT NULL,
  `costo_envio` decimal(10,2) DEFAULT 0.00,
  `ubicacion_bodega` varchar(255) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
INSERT INTO `entregas` VALUES
(1,1,1,2,5,3,15.00,'Lima - Central',1),
(2,1,2,15,25,20,45.00,'Shanghai - Callao',1),
(3,2,1,2,5,3,15.00,'Lima - Central',1),
(4,2,5,12,22,17,55.00,'Oregon - Marítimo',1),
(5,3,3,8,15,11,30.00,'São Paulo',1),
(6,3,2,15,25,20,45.00,'Shanghai - Callao',1),
(7,4,4,10,20,15,50.00,'Berlín - Aéreo',1),
(8,5,5,12,22,17,55.00,'Oregon - Marítimo',1),
(9,6,5,12,22,17,55.00,'Oregon - Marítimo',1),
(10,6,2,15,25,20,45.00,'Shanghai - Callao',1),
(11,7,2,15,25,20,45.00,'Shanghai - Callao',1),
(12,8,5,12,22,17,55.00,'Oregon - Marítimo',1),
(13,9,5,12,22,17,55.00,'Oregon - Marítimo',1),
(14,10,2,15,25,20,45.00,'Shanghai - Callao',1),
(15,11,1,2,5,3,10.00,'Lima - Central',1),
(16,12,3,8,15,11,30.00,'São Paulo',1),
(17,13,4,10,20,15,55.00,'Berlín - Aéreo',1),
(18,14,5,12,22,17,60.00,'Oregon - Marítimo',1),
(19,15,5,12,22,17,65.00,'Oregon - Marítimo',1),
(20,16,5,12,22,17,65.00,'Oregon - Marítimo',1),
(21,17,2,15,25,20,40.00,'Shanghai - Callao',1),
(22,18,4,10,20,15,50.00,'Berlín - Aéreo',1),
(23,19,1,2,5,3,10.00,'Lima - Central',1),
(25,21,1,2,5,3,10.00,'Lima - Central',1);
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `cantidad_stock` int(11) NOT NULL DEFAULT 0,
  `cantidad_reservada` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES
(1,1,1,145,20),
(2,1,2,300,50),
(3,2,1,120,15),
(4,2,5,100,10),
(5,3,3,200,30),
(6,3,2,250,40),
(7,4,4,180,25),
(8,5,5,140,20),
(9,6,5,160,25),
(10,6,2,280,45),
(11,7,2,200,30),
(12,8,5,130,20),
(13,9,5,100,15),
(14,10,2,150,20),
(15,11,1,200,25),
(16,12,3,180,25),
(17,13,4,80,15),
(18,14,5,110,18),
(19,15,5,50,10),
(20,16,5,60,12),
(21,17,2,100,15),
(22,18,4,100,18),
(23,19,1,300,40),
(25,21,1,350,45);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ordenes_compra`
--

DROP TABLE IF EXISTS `ordenes_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `solicitud_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `respuesta_ia_justificacion` text DEFAULT NULL,
  `enviado_por_email` tinyint(1) DEFAULT 0,
  `enviado_por_api` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `solicitud_id` (`solicitud_id`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `ordenes_compra_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_compra` (`id`),
  CONSTRAINT `ordenes_compra_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `ordenes_compra_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ordenes_compra` WRITE;
/*!40000 ALTER TABLE `ordenes_compra` DISABLE KEYS */;
INSERT INTO `ordenes_compra` VALUES
(1,10,4,1,12,149.90,1798.80,'pendiente',NULL,0,0,'2026-05-12 22:05:56'),
(2,12,4,2,75,149.90,11242.50,'pendiente',NULL,0,0,'2026-05-12 22:17:06'),
(3,13,4,1,100,149.90,14990.00,'pendiente',NULL,0,0,'2026-05-12 22:21:25'),
(4,14,4,2,80,149.90,11992.00,'pendiente',NULL,0,0,'2026-05-12 22:25:52'),
(5,15,4,1,60,149.90,8994.00,'pendiente',NULL,0,0,'2026-05-12 22:28:50'),
(6,16,4,2,120,149.90,17988.00,'pendiente',NULL,0,0,'2026-05-12 22:31:15'),
(7,17,4,1,100,149.90,14990.00,'pendiente',NULL,0,0,'2026-05-12 22:35:31'),
(8,18,4,1,100,149.90,14990.00,'pendiente',NULL,0,0,'2026-05-12 22:35:33'),
(9,19,4,1,50,149.90,7495.00,'pendiente',NULL,0,0,'2026-05-12 22:37:19'),
(10,20,4,1,50,149.90,7495.00,'pendiente',NULL,0,0,'2026-05-12 22:39:53'),
(11,21,4,1,50,149.90,7495.00,'pendiente',NULL,0,0,'2026-05-12 22:43:10'),
(12,22,4,1,50,149.90,7495.00,'pendiente',NULL,0,0,'2026-05-12 22:46:01'),
(13,23,1,1,50,159.90,7995.00,'pendiente',NULL,0,0,'2026-05-13 00:33:59'),
(14,24,1,1,100,159.90,15990.00,'pendiente',NULL,0,0,'2026-05-13 00:37:33'),
(15,25,4,1,20,149.90,2998.00,'pendiente',NULL,0,0,'2026-05-15 22:41:11'),
(16,24,1,1,100,159.90,15990.00,'pendiente',NULL,0,0,'2026-05-15 22:41:50'),
(17,24,1,1,100,159.90,15990.00,'pendiente',NULL,0,0,'2026-05-15 22:42:59'),
(18,24,1,1,100,159.90,15990.00,'pendiente',NULL,0,0,'2026-05-15 22:43:25'),
(19,28,1,19,20,89.90,1798.00,'pendiente',NULL,0,0,'2026-05-15 23:05:00'),
(20,24,1,1,100,159.90,15990.00,'pendiente',NULL,0,0,'2026-05-16 19:28:18');
/*!40000 ALTER TABLE `ordenes_compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pedido_items`
--

DROP TABLE IF EXISTS `pedido_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `pedido_items_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pedido_items` WRITE;
/*!40000 ALTER TABLE `pedido_items` DISABLE KEYS */;
INSERT INTO `pedido_items` VALUES
(1,7,1,5,159.90,'2026-05-12 19:48:45'),
(2,8,22,2,195.00,'2026-05-12 19:49:48');
/*!40000 ALTER TABLE `pedido_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_nombre` varchar(255) NOT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(20) DEFAULT NULL,
  `proveedor_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `fecha_entrega_estimada` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES
(1,'Juan Pérez','juan@example.com','+51 999 999 999',1,319.80,'confirmado','2026-05-17'),
(2,'Carlos López','carlos@example.com','999 888 777',1,319.80,'confirmado','2026-05-17'),
(3,'Carlos López','carlos@example.com','999 888 777',1,249.90,'confirmado','2026-05-17'),
(4,'Carlos López','carlos@example.com','999 888 777',1,159.90,'confirmado','2026-05-17'),
(5,'Carlos López','carlos@example.com','999 888 777',1,769.50,'confirmado','2026-05-17'),
(6,'Carlos López','carlos@example.com','999 888 777',1,390.00,'confirmado','2026-05-17'),
(7,'Test User','test@test.com','999999999',1,799.50,'confirmado','2026-05-17'),
(8,'Carlos López','carlos@example.com','999 888 777',1,390.00,'confirmado','2026-05-17');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `precios`
--

DROP TABLE IF EXISTS `precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `precios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `precio_costo` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `margen_ganancia` decimal(5,2) DEFAULT NULL,
  `cantidad_minima` int(11) DEFAULT 1,
  `cantidad_maxima` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `precios_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `precios_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `precios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `precios` WRITE;
/*!40000 ALTER TABLE `precios` DISABLE KEYS */;
INSERT INTO `precios` VALUES
(1,1,1,85.00,159.90,88.11,10,NULL,1),
(2,1,2,75.00,159.90,113.20,50,NULL,1),
(3,2,1,90.00,169.90,88.78,10,NULL,1),
(4,2,5,95.00,169.90,78.84,25,NULL,1),
(5,3,3,70.00,149.90,114.14,20,NULL,1),
(6,3,2,68.00,149.90,120.44,50,NULL,1),
(7,4,4,80.00,149.90,87.38,15,NULL,1),
(8,5,5,88.00,159.90,81.59,20,NULL,1),
(9,6,5,70.00,129.90,85.57,15,NULL,1),
(10,6,2,65.00,129.90,99.85,50,NULL,1),
(11,7,2,75.00,149.90,99.87,40,NULL,1),
(12,8,5,72.00,139.90,94.31,20,NULL,1),
(13,9,5,68.00,129.90,91.03,15,NULL,1),
(14,10,2,82.00,159.90,95.00,30,NULL,1),
(15,11,1,65.00,119.90,84.62,25,NULL,1),
(16,12,3,70.00,129.90,85.57,20,NULL,1),
(17,13,4,150.00,299.90,99.93,5,NULL,1),
(18,14,5,120.00,279.90,133.25,8,NULL,1),
(19,15,5,280.00,499.90,78.54,5,NULL,1),
(20,16,5,300.00,549.90,83.30,5,NULL,1),
(21,17,2,120.00,239.90,99.92,15,NULL,1),
(22,18,5,38.00,69.90,83.95,50,NULL,1),
(23,19,1,38.00,69.90,83.95,50,NULL,1),
(25,21,1,35.00,59.90,71.14,60,NULL,1),
(26,22,5,110.00,210.00,0.00,1,NULL,1);
/*!40000 ALTER TABLE `precios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `deporte` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `especificaciones` text DEFAULT NULL,
  `precioOriginal` decimal(10,2) NOT NULL,
  `precioOferta` decimal(10,2) DEFAULT NULL,
  `descuento` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `vistaFrente` varchar(255) DEFAULT NULL,
  `vistaEspalda` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES
(1,'Camiseta Perú 2024 Local','camisetas','futbol','Camiseta oficial de la selección peruana','Tela DryFit - Tallas S/M/L/XL',189.90,159.90,16,45,'img/camisetas/peru-frente.jpg','img/camisetas/peru-espalda.jpg','2026-05-11 12:52:15'),
(2,'Camiseta Argentina 2024','camisetas','futbol','Camiseta clásica argentina','Tela DryFit - Tallas S/M/L/XL',199.90,169.90,15,35,'img/camisetas/argentina-frente.jpg','img/camisetas/argentina-espalda.jpg','2026-05-11 12:52:15'),
(3,'Camiseta Brasil 2024','camisetas','futbol','Camiseta amarilla de Brasil','Tela DryFit - Tallas S/M/L/XL',179.90,149.90,17,42,'img/camisetas/brasil-frente.jpg','img/camisetas/brasil-espalda.jpg','2026-05-11 12:52:15'),
(4,'Camiseta Italia 2024','camisetas','futbol','Camiseta celeste de Italia','Tela DryFit - Tallas S/M/L/XL',179.90,149.90,17,30,'img/camisetas/italia-frente.jpg','img/camisetas/italia-espalda.jpg','2026-05-11 12:52:15'),
(5,'Camiseta Alemania 2024','camisetas','futbol','Camiseta blanca alemana','Tela DryFit - Tallas S/M/L/XL',189.90,159.90,16,38,'img/camisetas/alemania-frente.jpg','img/camisetas/alemania-espalda.jpg','2026-05-11 12:52:15'),
(6,'Jersey Lakers 2024','camisetas','basquet','Jersey Lakers official','Tela Mesh - Tallas S/M/L/XL',159.90,129.90,19,40,'img/camisetas/lakers-frente.jpg','img/camisetas/lakers-espalda.jpg','2026-05-11 12:52:15'),
(7,'Jersey Bulls Retro','camisetas','basquet','Jersey retro Bulls','Tela Mesh - Tallas S/M/L/XL',179.90,149.90,17,35,'img/camisetas/bulls-frente.jpg','img/camisetas/bulls-espalda.jpg','2026-05-11 12:52:15'),
(8,'Jersey Warriors 2024','camisetas','basquet','Jersey Warriors official','Tela Mesh - Tallas S/M/L/XL',169.90,139.90,18,32,'img/camisetas/warriors-frente.jpg','img/camisetas/warriors-espalda.jpg','2026-05-11 12:52:15'),
(9,'Jersey Celtics','camisetas','basquet','Jersey Celtics classic','Tela Mesh - Tallas S/M/L/XL',159.90,129.90,19,28,'img/camisetas/celtics-frente.jpg','img/camisetas/celtics-espalda.jpg','2026-05-11 12:52:15'),
(10,'Jersey Nets','camisetas','basquet','Jersey Nets edition','Tela Mesh - Tallas S/M/L/XL',189.90,159.90,16,25,'img/camisetas/nets-frente.jpg','img/camisetas/nets-espalda.jpg','2026-05-11 12:52:15'),
(11,'Camiseta Vóley Perú','camisetas','voley','Camiseta vóley Perú','Tela DryFit - Tallas S/M/L/XL',149.90,119.90,20,55,'img/camisetas/voley-peru-frente.jpg','img/camisetas/voley-peru-espalda.jpg','2026-05-11 12:52:15'),
(12,'Camiseta Vóley Brasil','camisetas','voley','Camiseta vóley Brasil','Tela DryFit - Tallas S/M/L/XL',159.90,129.90,19,45,'img/camisetas/voley-brasil-frente.jpg','img/camisetas/voley-brasil-espalda.jpg','2026-05-11 12:52:15'),
(13,'Zapatillas Predator','zapatillas','futbol','Adidas Predator profesional','Tallas 38-44',349.90,299.90,14,25,'img/zapatillas/predator-lateral.jpg','img/zapatillas/predator-superior.jpg','2026-05-11 12:52:15'),
(14,'Zapatillas Nike Mercurial','zapatillas','futbol','Nike Mercurial velocidad','Tallas 38-44',329.90,279.90,15,30,'img/zapatillas/mercurial-lateral.jpg','img/zapatillas/mercurial-superior.jpg','2026-05-11 12:52:15'),
(15,'Zapatillas Air Jordan','zapatillas','basquet','Air Jordan 1 Mid','Tallas 38-44',599.90,499.90,17,15,'img/zapatillas/jordan-lateral.jpg','img/zapatillas/jordan-superior.jpg','2026-05-11 12:52:15'),
(16,'Zapatillas Nike LeBron','zapatillas','basquet','Nike LeBron 20','Tallas 38-44',649.90,549.90,15,18,'img/zapatillas/lebron-lateral.jpg','img/zapatillas/lebron-superior.jpg','2026-05-11 12:52:15'),
(17,'Zapatillas Mizuno Wave','zapatillas','voley','Mizuno Wave Lightning','Tallas 35-40',279.90,239.90,14,20,'img/zapatillas/mizuno-lateral.jpg','img/zapatillas/mizuno-superior.jpg','2026-05-11 12:52:15'),
(18,'Polo Perú','polos','futbol','Polo Perú training','Algodón - Tallas S/M/L/XL',89.90,69.90,22,60,'img/polos/polo-peru-frente.jpg','img/polos/polo-peru-espalda.jpg','2026-05-11 12:52:15'),
(19,'Polo Argentina','polos','futbol','Polo Argentina training','Algodón - Tallas S/M/L/XL',89.90,69.90,22,45,'img/polos/polo-argentina-frente.jpg','img/polos/polo-argentina-espalda.jpg','2026-05-11 12:52:15'),
(21,'Polo Vóley Perú','polos','voley','Polo vóley Perú','Poliéster - Tallas S/M/L/XL',79.90,59.90,25,70,'img/polos/polo-voley-peru-frente.jpg','img/polos/polo-voley-peru-espalda.jpg','2026-05-11 12:52:15'),
(22,'Polo Lakers','polos','basquet','Firmada por Mr. Lebron James','N/A',200.00,195.00,0,3,'img/default.jpg','img/default.jpg','2026-05-11 22:22:18');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `contacto` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES
(1,'TextilPeru S.A.','Juan García','juan@textilperu.pe','+51 1 2345678','Lima','Perú',1,'2026-05-11 12:52:15'),
(2,'SportGear China','Wei Zhang','wei@sportgear.cn','+86 10 9876543','Shanghai','China',1,'2026-05-11 12:52:15'),
(3,'Confecciones Brasil','Carlos Silva','carlos@confbrasil.br','+55 11 98765432','São Paulo','Brasil',1,'2026-05-11 12:52:15'),
(4,'Adidas Direct','Maria König','maria@adidas.de','+49 30 1234567','Berlín','Alemania',1,'2026-05-11 12:52:15'),
(5,'Nike Distribution','James Wilson','james@nike-dist.us','+1 503 6712400','Oregón','USA',1,'2026-05-11 12:52:15');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `solicitudes_compra`
--

DROP TABLE IF EXISTS `solicitudes_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `stock_bajo_producto_id` int(11) DEFAULT NULL,
  `cantidad_requerida` int(11) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `respuesta_ia` text DEFAULT NULL,
  `proveedor_recomendado_id` int(11) DEFAULT NULL,
  `orden_compra_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `stock_bajo_producto_id` (`stock_bajo_producto_id`),
  KEY `proveedor_recomendado_id` (`proveedor_recomendado_id`),
  CONSTRAINT `solicitudes_compra_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `solicitudes_compra_ibfk_2` FOREIGN KEY (`stock_bajo_producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `solicitudes_compra_ibfk_3` FOREIGN KEY (`proveedor_recomendado_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `solicitudes_compra` WRITE;
/*!40000 ALTER TABLE `solicitudes_compra` DISABLE KEYS */;
INSERT INTO `solicitudes_compra` VALUES
(1,3,'necesitamos 50 camisetas Peru talla M',1,50,'pendiente',NULL,NULL,NULL,'2026-05-12 20:34:10','2026-05-12 20:34:10'),
(2,1,'TEST: Necesitamos 50 camisetas Perú talla M urgente',1,50,'pendiente',NULL,NULL,NULL,'2026-05-12 20:35:41','2026-05-12 20:35:41'),
(3,1,'URGENT: Necesitamos 100 camisetas Perú talla M para stock crítico',1,100,'pendiente',NULL,NULL,NULL,'2026-05-12 20:39:39','2026-05-12 20:39:39'),
(4,1,'URGENTE: Necesitamos 120 camisetas Argentina talla L para stock crítico inmediato',2,120,'pendiente',NULL,NULL,NULL,'2026-05-12 20:43:03','2026-05-12 20:43:03'),
(5,1,'Necesitamos 40 camisetas Perú talla M urgente para stock crítico',1,40,'interpretada','{\"producto_nombre\":\"camisetas Perú\",\"cantidad\":40,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos 40 camisetas Perú talla M urgente para stock crítico\"}',NULL,NULL,'2026-05-12 21:10:06','2026-05-12 21:10:12'),
(6,1,'Necesitamos 40 camisetas Perú talla M urgente para stock crítico',1,40,'interpretada','{\"producto_nombre\":\"camisetas Perú\",\"cantidad\":40,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos 40 camisetas Perú talla M urgente para stock crítico\"}',NULL,NULL,'2026-05-12 21:10:23','2026-05-12 21:10:24'),
(7,1,'URGENTE: Necesito 25 pantalones deportivos talla L para stock crítico',5,25,'interpretada','{\"producto_nombre\":\"Necesito 25 pantalones deportivos talla L para stock crítico\",\"cantidad\":25,\"urgencia\":\"URGENTE\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',NULL,NULL,'2026-05-12 22:03:35','2026-05-12 22:03:41'),
(8,1,'URGENTE: Necesito 20 zapatillas deportivas talla 42 para stock crítico',3,20,'interpretada','{\"producto_nombre\":\"Necesito 20 zapatillas deportivas talla 42 para stock crítico\",\"cantidad\":20,\"urgencia\":\"URGENTE\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',NULL,NULL,'2026-05-12 22:04:30','2026-05-12 22:04:34'),
(9,1,'Stock bajo: necesitamos 15 guantes de portero urgente',4,15,'interpretada','{\"producto_nombre\":\"guantes de portero\",\"cantidad\":15,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos 15 guantes de portero urgente\"}',NULL,NULL,'2026-05-12 22:05:02','2026-05-12 22:05:08'),
(10,1,'Stock bajo: 12 camisetas Brasil urgente',NULL,12,'orden_creada','{\"producto_nombre\":\"camisetas Brasil\",\"cantidad\":12,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,1,'2026-05-12 22:05:49','2026-05-12 22:05:56'),
(11,1,'URGENTE: Necesitamos 50 camisetas Colombia talla M para stock crítico en almacén',1,50,'interpretada','{\"producto_nombre\":\"Necesitamos 50 camisetas Colombia talla M para stock crítico\",\"cantidad\":50,\"urgencia\":\"URGENTE\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',NULL,NULL,'2026-05-12 22:16:20','2026-05-12 22:16:24'),
(12,1,'Stock bajo CRÍTICO: Necesitamos 75 pantalones deportivos talla L para bodega principal',2,75,'orden_creada','{\"producto_nombre\":\"Necesitamos 75 pantalones deportivos talla L para bodega principal\",\"cantidad\":75,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":null}',4,2,'2026-05-12 22:16:49','2026-05-12 22:17:06'),
(13,1,'URGENTE: Stock crítico de 100 camisetas Perú talla M para bodega central. Necesitamos entrega máximo 3 días',1,100,'orden_creada','{\"producto_nombre\":\"camisetas Perú talla M\",\"cantidad\":100,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos entrega máximo 3 días\"}',4,3,'2026-05-12 22:20:48','2026-05-12 22:21:25'),
(14,1,'CRÍTICO: Necesitamos 80 pantalones deportivos talla L para bodega centro. Stock bajo. Entregar máximo 2 días',2,80,'orden_creada','{\"producto_nombre\":\"80 pantalones deportivos talla L\",\"cantidad\":80,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos 80 pantalones deportivos talla L para bodega centro. Stock bajo.\"}',4,4,'2026-05-12 22:25:30','2026-05-12 22:25:52'),
(15,1,'URGENTE: Stock bajo crítico. Necesitamos 60 camisetas Brasil talla M para reabastecimiento inmediato. Presupuesto máximo 6000 soles',1,60,'orden_creada','{\"producto_nombre\":\"Camisetas Brasil\",\"cantidad\":60,\"urgencia\":\"alta\",\"presupuesto_aproximado\":6000,\"comentarios\":null}',4,5,'2026-05-12 22:28:22','2026-05-12 22:28:50'),
(16,1,'URGENTE: Stock crítico total. Necesitamos 120 pantalones deportivos talla L para bodega principal. Entrega máximo 2 días. Presupuesto: 9000 soles',2,120,'orden_creada','{\"producto_nombre\":\"120 pantalones deportivos talla L\",\"cantidad\":120,\"urgencia\":\"urgente\",\"presupuesto_aproximado\":9000,\"comentarios\":\"\"}',4,6,'2026-05-12 22:30:38','2026-05-12 22:31:15'),
(17,3,'URGENTE: Necesitamos 100 camisetas Perú talla L',1,100,'orden_creada','{\"producto_nombre\":\"Necesitamos 100 camisetas Perú talla L\",\"cantidad\":100,\"urgencia\":\"URGENTE\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,7,'2026-05-12 22:35:23','2026-05-12 22:35:31'),
(18,3,'URGENTE: Necesitamos 100 camisetas Perú talla L',1,100,'orden_creada','{\"producto_nombre\":\"Necesitamos 100 camisetas Perú talla L\",\"cantidad\":100,\"urgencia\":\"URGENTE\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,8,'2026-05-12 22:35:24','2026-05-12 22:35:33'),
(19,3,'necesitamos 50 polos peru talla M',1,50,'orden_creada','{\"producto_nombre\":\"polos\",\"cantidad\":50,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,9,'2026-05-12 22:37:14','2026-05-12 22:37:19'),
(20,3,'necesitamos polos PERU talla M',1,50,'orden_creada','{\"producto_nombre\":\"polos\",\"cantidad\":1,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,10,'2026-05-12 22:39:48','2026-05-12 22:39:53'),
(21,3,'necesitamos camisetas de peru talla m',1,50,'orden_creada','{\"producto_nombre\":\"camisetas de peru\",\"cantidad\":5,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos camisetas de perú talla m\"}',4,11,'2026-05-12 22:43:05','2026-05-12 22:43:10'),
(22,3,'necesitamos 50 polos de peru talla m',1,50,'orden_creada','{\"producto_nombre\":\"necesitamos 50 polos de peru talla m\",\"cantidad\":50,\"urgencia\":\"baja\",\"presupuesto_aproximado\":null,\"comentarios\":\"\"}',4,12,'2026-05-12 22:45:56','2026-05-12 22:46:01'),
(23,1,'Test final workflow',NULL,50,'orden_creada','{\"producto_nombre\":\"Test final workflow\",\"cantidad\":5,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Solicitud de compra finalizada con exito\"}',1,13,'2026-05-12 22:55:21','2026-05-13 00:33:59'),
(24,1,'Test final workflow',NULL,100,'orden_creada','{\"producto_nombre\":\"Test final workflow\",\"cantidad\":2,\"urgencia\":\"alta\",\"presupuesto_aproximado\":null,\"comentarios\":\"Solicitud de reabastecimiento para el producto Test final workflow\"}',1,20,'2026-05-13 00:37:20','2026-05-16 19:28:18'),
(25,1,'Necesitamos 20 camisetas Peru urgente para el partido',NULL,20,'orden_creada','{\"producto_nombre\":\"camisetas\",\"cantidad\":20,\"urgencia\":\"peru\",\"presupuesto_aproximado\":null,\"comentarios\":\"Necesitamos 20 camisetas Peru urgente para el partido\"}',4,15,'2026-05-15 22:40:57','2026-05-15 22:41:11'),
(26,1,'quiero que generes una orden de compra de 20 polos lakers',NULL,20,'interpretada',NULL,NULL,NULL,'2026-05-15 23:03:40','2026-05-15 23:03:40'),
(27,1,'quiero que generes una orden de compra de 20 polos lakers',NULL,20,'interpretada',NULL,NULL,NULL,'2026-05-15 23:03:43','2026-05-15 23:03:43'),
(28,1,'quiero que generes una orden de compra de 20 polos lakers',19,20,'orden_creada',NULL,NULL,19,'2026-05-15 23:05:00','2026-05-15 23:05:00');
/*!40000 ALTER TABLE `solicitudes_compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `estado` varchar(50) DEFAULT 'activo',
  `role` varchar(50) DEFAULT 'cliente',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,'Carlos','López','carlos@example.com','999 888 777','password123','activo','cliente','2026-05-12 17:27:49'),
(2,'chorri','chorri','chorri@chorri.com','123456789','12345678','activo','cliente','2026-05-12 19:21:31'),
(3,'Admin','Sistema','admin@tienda.com','999999999','admin123','activo','admin','2026-05-12 19:23:45');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-16 16:11:23
