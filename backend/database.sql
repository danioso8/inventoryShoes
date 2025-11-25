-- Script de creación de base de datos y tablas
-- Inventario de Zapatos - Sistema Multi-tenant (SaaS)

CREATE DATABASE IF NOT EXISTS inventario_zapatos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventario_zapatos;

-- Tabla de Tiendas (Tenants)
CREATE TABLE IF NOT EXISTS tiendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
    estado ENUM('activo', 'suspendido', 'cancelado') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin_trial TIMESTAMP NULL,
    fecha_ultimo_pago TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
    email_verificado BOOLEAN DEFAULT FALSE,
    fecha_ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de relación Usuarios-Tiendas (muchos a muchos)
CREATE TABLE IF NOT EXISTS usuarios_tiendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tienda_id INT NOT NULL,
    role ENUM('owner', 'admin', 'vendedor', 'solo_lectura') DEFAULT 'vendedor',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_tienda (usuario_id, tienda_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_tienda (tienda_id)
) ENGINE=InnoDB;

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    INDEX idx_tienda (tienda_id),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- Tabla de Productos (Zapatos)
CREATE TABLE IF NOT EXISTS productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    categoria_id INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_total INT NOT NULL DEFAULT 0,
    codigo_barras VARCHAR(50),
    sku VARCHAR(50),
    imagen_url VARCHAR(500),
    estado ENUM('activo', 'agotado', 'descontinuado') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_tienda (tienda_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_nombre (nombre),
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_sku (sku)
) ENGINE=InnoDB;

-- Tabla de Tallas/Variantes de Productos
CREATE TABLE IF NOT EXISTS producto_tallas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    talla VARCHAR(10) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    color VARCHAR(50),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producto_talla_color (producto_id, talla, color),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB;

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT,
    documento VARCHAR(50),
    tipo_documento ENUM('DNI', 'RUC', 'CE', 'Pasaporte') DEFAULT 'DNI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    INDEX idx_tienda (tienda_id),
    INDEX idx_nombre (nombre),
    INDEX idx_documento (documento)
) ENGINE=InnoDB;

-- Tabla de Facturas/Ventas
CREATE TABLE IF NOT EXISTS facturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    cliente_id INT,
    usuario_id INT NOT NULL,
    numero_factura VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') NOT NULL,
    estado ENUM('pendiente', 'pagado', 'anulado') DEFAULT 'pagado',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_tienda (tienda_id),
    INDEX idx_numero_factura (numero_factura),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Tabla de Items de Factura
CREATE TABLE IF NOT EXISTS factura_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    talla_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (talla_id) REFERENCES producto_tallas(id) ON DELETE SET NULL,
    INDEX idx_factura (factura_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB;

-- Tabla de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    producto_id INT NOT NULL,
    talla_id INT,
    usuario_id INT NOT NULL,
    tipo ENUM('entrada', 'salida', 'ajuste', 'devolucion') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255),
    referencia VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (talla_id) REFERENCES producto_tallas(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_tienda (tienda_id),
    INDEX idx_producto (producto_id),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

-- Insertar datos de prueba
-- Tienda de ejemplo
INSERT INTO tiendas (nombre, email, telefono, plan, fecha_fin_trial) VALUES
('Zapatería Demo', 'demo@zapateria.com', '987654321', 'free', DATE_ADD(NOW(), INTERVAL 3 MONTH));

-- Usuario de prueba (contraseña: 123456)
INSERT INTO usuarios (nombre, email, password_hash, email_verificado) VALUES
('Admin Demo', 'admin@zapateria.com', '$2a$10$xGvF9qLQpB1YXJKqYGJ1xuqPb.PqVHJ3z7YQXqK9mJH2YjH0pQ8jW', TRUE);

-- Relacionar usuario con tienda
INSERT INTO usuarios_tiendas (usuario_id, tienda_id, role) VALUES
(1, 1, 'owner');
