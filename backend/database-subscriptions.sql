-- Agregar tabla de Suscripciones/Pagos para el sistema SaaS

USE inventario_zapatos;

-- Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    plan_id ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL,
    estado ENUM('activa', 'cancelada', 'vencida', 'pendiente_pago') DEFAULT 'activa',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    fecha_proximo_pago TIMESTAMP NULL,
    monto DECIMAL(10, 2) NOT NULL DEFAULT 0,
    periodo ENUM('mensual', 'anual') DEFAULT 'mensual',
    metodo_pago VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    INDEX idx_tienda (tienda_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_proximo_pago (fecha_proximo_pago)
) ENGINE=InnoDB;

-- Tabla de Historial de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tienda_id INT NOT NULL,
    suscripcion_id INT,
    monto DECIMAL(10, 2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    plan_pagado ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL,
    metodo_pago ENUM('tarjeta', 'transferencia', 'yape', 'plin', 'stripe', 'mercadopago') NOT NULL,
    estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
    referencia_pago VARCHAR(255),
    datos_adicionales JSON,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id) ON DELETE SET NULL,
    INDEX idx_tienda (tienda_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_referencia (referencia_pago)
) ENGINE=InnoDB;

-- Tabla de Límites por Plan
CREATE TABLE IF NOT EXISTS limites_planes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL UNIQUE,
    max_productos INT NOT NULL,
    max_usuarios INT NOT NULL,
    max_facturas_mes INT NOT NULL,
    tiene_api BOOLEAN DEFAULT FALSE,
    tiene_soporte_prioritario BOOLEAN DEFAULT FALSE,
    tiene_backup_automatico BOOLEAN DEFAULT FALSE,
    tiene_multi_tienda BOOLEAN DEFAULT FALSE,
    tiene_analytics_avanzados BOOLEAN DEFAULT FALSE,
    precio_mensual DECIMAL(10, 2) NOT NULL,
    precio_anual DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar límites de cada plan
INSERT INTO limites_planes (plan, max_productos, max_usuarios, max_facturas_mes, tiene_api, tiene_soporte_prioritario, tiene_backup_automatico, tiene_multi_tienda, tiene_analytics_avanzados, precio_mensual, precio_anual) VALUES
('free', 50, 1, 100, FALSE, FALSE, FALSE, FALSE, FALSE, 0.00, 0.00),
('basic', 500, 3, 500, FALSE, TRUE, TRUE, FALSE, FALSE, 29.00, 290.00),
('premium', 999999, 10, 999999, TRUE, TRUE, TRUE, FALSE, TRUE, 79.00, 790.00),
('enterprise', 999999, 999999, 999999, TRUE, TRUE, TRUE, TRUE, TRUE, 199.00, 1990.00);

-- Crear suscripción inicial para la tienda demo (3 meses gratis)
INSERT INTO suscripciones (tienda_id, plan_id, estado, fecha_inicio, fecha_fin, monto, periodo) VALUES
(1, 'free', 'activa', NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 0.00, 'mensual');
