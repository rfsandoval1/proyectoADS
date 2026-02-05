-- =====================================================
-- SCRIPT DE SEED DATA - PagoSeguro AGROTAC
-- Incluye datos de prueba con simulación de MORA
-- =====================================================
-- Fecha base: Se usan fechas relativas para simular mora
-- Los créditos con pagos pendientes de hace más de 30 días se consideran en mora
-- =====================================================

-- Limpiar datos existentes (en orden por dependencias)
DELETE FROM "Payment";
DELETE FROM "Credit";
DELETE FROM audit_logs;
DELETE FROM refresh_tokens;
DELETE FROM contacts;
DELETE FROM reports;
DELETE FROM users;

-- =====================================================
-- 1. USUARIOS
-- =====================================================
-- Nota: Las contraseñas están hasheadas con bcrypt (password = "Test123!")

-- GERENTE (Administrador del sistema)
INSERT INTO users (
    id, email, password, full_name, role, status, cedula, telefono, direccion,
    login_attempts, email_verified, created_at, updated_at
) VALUES (
    'usr-gerente-001',
    'gerente@agrotac.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Carlos Mendoza García',
    'GERENTE',
    'ACTIVE',
    '1234567890',
    '+57 310 123 4567',
    'Calle 100 #15-25, Bogotá',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    CURRENT_TIMESTAMP
);

-- ASISTENTES (Personal de cobranza)
INSERT INTO users (
    id, email, password, full_name, role, status, cedula, telefono, direccion,
    login_attempts, email_verified, created_at, updated_at
) VALUES
(
    'usr-asistente-001',
    'asistente1@agrotac.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'María López Hernández',
    'ASISTENTE',
    'ACTIVE',
    '9876543210',
    '+57 311 234 5678',
    'Carrera 50 #30-10, Medellín',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '4 months',
    CURRENT_TIMESTAMP
),
(
    'usr-asistente-002',
    'asistente2@agrotac.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Juan Pérez Rodríguez',
    'ASISTENTE',
    'ACTIVE',
    '5678901234',
    '+57 312 345 6789',
    'Avenida 6 #45-80, Cali',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '3 months',
    CURRENT_TIMESTAMP
);

-- CLIENTES (Agricultores y comerciantes)
INSERT INTO users (
    id, email, password, full_name, role, status, cedula, telefono, direccion,
    login_attempts, email_verified, created_at, updated_at
) VALUES
-- Cliente 1: Buen pagador (todos los pagos al día)
(
    'usr-cliente-001',
    'pedro.agricola@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Pedro Sánchez Agricultura',
    'CLIENTE',
    'ACTIVE',
    '1122334455',
    '+57 315 111 2222',
    'Vereda El Carmen, Finca La Esperanza, Boyacá',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '8 months',
    CURRENT_TIMESTAMP
),
-- Cliente 2: EN MORA LEVE (1 pago atrasado, 45 días)
(
    'usr-cliente-002',
    'maria.cosecha@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'María Elena Cosecha Ruiz',
    'CLIENTE',
    'ACTIVE',
    '2233445566',
    '+57 316 222 3333',
    'Vereda San Antonio, Cundinamarca',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '7 months',
    CURRENT_TIMESTAMP
),
-- Cliente 3: EN MORA GRAVE (3 pagos atrasados, 90+ días)
(
    'usr-cliente-003',
    'jose.campo@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'José Alberto Campo Verde',
    'CLIENTE',
    'ACTIVE',
    '3344556677',
    '+57 317 333 4444',
    'Finca El Roble, Santander',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '10 months',
    CURRENT_TIMESTAMP
),
-- Cliente 4: EN MORA CRÍTICA (5+ pagos atrasados, 150+ días)
(
    'usr-cliente-004',
    'ana.siembra@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Ana Patricia Siembra Luna',
    'CLIENTE',
    'ACTIVE',
    '4455667788',
    '+57 318 444 5555',
    'Vereda Los Naranjos, Tolima',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '12 months',
    CURRENT_TIMESTAMP
),
-- Cliente 5: Crédito pagado completamente
(
    'usr-cliente-005',
    'luis.ganado@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Luis Fernando Ganado Mejía',
    'CLIENTE',
    'ACTIVE',
    '5566778899',
    '+57 319 555 6666',
    'Hacienda La Primavera, Meta',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '14 months',
    CURRENT_TIMESTAMP
),
-- Cliente 6: Nuevo cliente con crédito reciente
(
    'usr-cliente-006',
    'carmen.cafe@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Carmen Rosa Café Montoya',
    'CLIENTE',
    'ACTIVE',
    '6677889900',
    '+57 320 666 7777',
    'Finca Cafetal, Quindío',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '1 month',
    CURRENT_TIMESTAMP
),
-- Cliente 7: EN MORA MODERADA (2 pagos atrasados)
(
    'usr-cliente-007',
    'roberto.maiz@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Roberto Maíz Guerrero',
    'CLIENTE',
    'ACTIVE',
    '7788990011',
    '+57 321 777 8888',
    'Parcela 15, Córdoba',
    0,
    true,
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    CURRENT_TIMESTAMP
),
-- Cliente 8: Bloqueado por mora extrema
(
    'usr-cliente-008',
    'elena.arroz@email.com',
    '$2b$10$8Kj7LmN2Xo9PqRs4TuVwXeYz1Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St',
    'Elena Arroz Pimentel',
    'CLIENTE',
    'BLOCKED',
    '8899001122',
    '+57 322 888 9999',
    'Vereda Arrozal, Casanare',
    3,
    true,
    CURRENT_TIMESTAMP - INTERVAL '18 months',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CRÉDITOS (tabla "Credit" con columnas camelCase)
-- =====================================================

-- Crédito 1: Cliente 1 - AL DÍA (rango 5000-10000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-001',
    'usr-cliente-001',
    8000.00,
    'ACTIVE',
    '5000-10000',
    12,
    12.0,
    'Crédito para compra de semillas de maíz y fertilizantes - Temporada 2025',
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    CURRENT_TIMESTAMP
);

-- Crédito 2: Cliente 2 - EN MORA LEVE (rango 10000-50000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-002',
    'usr-cliente-002',
    25000.00,
    'OVERDUE',
    '10000-50000',
    18,
    14.5,
    'Crédito para sistema de riego por goteo - Finca San Antonio',
    CURRENT_TIMESTAMP - INTERVAL '7 months',
    CURRENT_TIMESTAMP
);

-- Crédito 3: Cliente 3 - EN MORA GRAVE (rango 10000-50000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-003',
    'usr-cliente-003',
    35000.00,
    'OVERDUE',
    '10000-50000',
    24,
    15.0,
    'Crédito para tractor y maquinaria agrícola',
    CURRENT_TIMESTAMP - INTERVAL '10 months',
    CURRENT_TIMESTAMP
);

-- Crédito 4: Cliente 4 - EN MORA CRÍTICA (rango 50000+)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-004',
    'usr-cliente-004',
    75000.00,
    'OVERDUE',
    '50000+',
    36,
    16.0,
    'Crédito para expansión de cultivos y bodega de almacenamiento',
    CURRENT_TIMESTAMP - INTERVAL '12 months',
    CURRENT_TIMESTAMP
);

-- Crédito 5: Cliente 5 - PAGADO COMPLETAMENTE (rango 1000-5000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-005',
    'usr-cliente-005',
    4500.00,
    'PAID',
    '1000-5000',
    6,
    10.0,
    'Crédito para compra de ganado vacuno - 5 cabezas',
    CURRENT_TIMESTAMP - INTERVAL '14 months',
    CURRENT_TIMESTAMP - INTERVAL '8 months'
);

-- Crédito 6: Cliente 6 - NUEVO, AL DÍA (rango 1000-5000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-006',
    'usr-cliente-006',
    3000.00,
    'ACTIVE',
    '1000-5000',
    12,
    11.0,
    'Crédito para renovación de cafetales - 2 hectáreas',
    CURRENT_TIMESTAMP - INTERVAL '1 month',
    CURRENT_TIMESTAMP
);

-- Crédito 7: Cliente 7 - EN MORA MODERADA (rango 5000-10000)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-007',
    'usr-cliente-007',
    6500.00,
    'OVERDUE',
    '5000-10000',
    12,
    12.5,
    'Crédito para insumos agrícolas temporada de maíz',
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    CURRENT_TIMESTAMP
);

-- Crédito 8: Cliente 8 - CANCELADO POR MORA EXTREMA (rango 50000+)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-008',
    'usr-cliente-008',
    85000.00,
    'CANCELLED',
    '50000+',
    36,
    18.0,
    'Crédito para proyecto de arroz mecanizado - CANCELADO POR INCUMPLIMIENTO',
    CURRENT_TIMESTAMP - INTERVAL '18 months',
    CURRENT_TIMESTAMP - INTERVAL '2 months'
);

-- Segundo crédito para Cliente 1 (cliente con múltiples créditos)
INSERT INTO "Credit" (
    id, "userId", amount, status, range, term, "interestRate", description,
    "createdAt", "updatedAt"
) VALUES (
    'cred-009',
    'usr-cliente-001',
    2500.00,
    'ACTIVE',
    '1000-5000',
    6,
    10.5,
    'Crédito complementario para fumigación y control de plagas',
    CURRENT_TIMESTAMP - INTERVAL '2 months',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. PAGOS (CUOTAS) - tabla "Payment" con columnas camelCase
-- =====================================================

-- ==========================================
-- CRÉDITO 1: Cliente 1 - AL DÍA (6 cuotas pagadas de 12)
-- Cuota mensual aproximada: 8000/12 + interés = ~750
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-001-01', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'August', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
('pay-001-02', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'September', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP),
('pay-001-03', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'October', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP),
('pay-001-04', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'November', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP),
('pay-001-05', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'December', 'PSE', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP),
('pay-001-06', 'cred-001', 'usr-cliente-001', 750.00, 'PAID', 'January', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP),
-- Cuotas pendientes pero NO en mora (fechas futuras)
('pay-001-07', 'cred-001', 'usr-cliente-001', 750.00, 'PENDING', 'February', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 2: Cliente 2 - MORA LEVE (1 pago atrasado 45 días)
-- Cuota mensual: 25000/18 + interés = ~1600
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-002-01', 'cred-002', 'usr-cliente-002', 1600.00, 'PAID', 'July', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP),
('pay-002-02', 'cred-002', 'usr-cliente-002', 1600.00, 'PAID', 'August', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
('pay-002-03', 'cred-002', 'usr-cliente-002', 1600.00, 'PAID', 'September', 'PSE', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP),
('pay-002-04', 'cred-002', 'usr-cliente-002', 1600.00, 'PAID', 'October', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP),
('pay-002-05', 'cred-002', 'usr-cliente-002', 1600.00, 'PAID', 'November', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP),
-- PAGO EN MORA: Debió pagarse hace 45 días
('pay-002-06', 'cred-002', 'usr-cliente-002', 1600.00, 'PENDING', 'December', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP),
-- Cuota del mes actual (aún no vence)
('pay-002-07', 'cred-002', 'usr-cliente-002', 1600.00, 'PENDING', 'January', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 3: Cliente 3 - MORA GRAVE (3 pagos atrasados, 90+ días)
-- Cuota mensual: 35000/24 + interés = ~1700
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-003-01', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'April', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
('pay-003-02', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'May', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP),
('pay-003-03', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'June', 'PSE', CURRENT_TIMESTAMP - INTERVAL '8 months', CURRENT_TIMESTAMP - INTERVAL '8 months', CURRENT_TIMESTAMP),
('pay-003-04', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'July', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP),
('pay-003-05', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'August', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
('pay-003-06', 'cred-003', 'usr-cliente-003', 1700.00, 'PAID', 'September', 'PSE', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP),
-- PAGOS EN MORA GRAVE: 4 cuotas atrasadas (90+ días)
('pay-003-07', 'cred-003', 'usr-cliente-003', 1700.00, 'PENDING', 'October', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP),
('pay-003-08', 'cred-003', 'usr-cliente-003', 1700.00, 'PENDING', 'November', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP),
('pay-003-09', 'cred-003', 'usr-cliente-003', 1700.00, 'PENDING', 'December', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
('pay-003-10', 'cred-003', 'usr-cliente-003', 1700.00, 'PENDING', 'January', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 4: Cliente 4 - MORA CRÍTICA (5+ pagos atrasados, 150+ días)
-- Cuota mensual: 75000/36 + interés = ~2500
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-004-01', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'February', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '12 months', CURRENT_TIMESTAMP - INTERVAL '12 months', CURRENT_TIMESTAMP),
('pay-004-02', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'March', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '11 months', CURRENT_TIMESTAMP - INTERVAL '11 months', CURRENT_TIMESTAMP),
('pay-004-03', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'April', 'PSE', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP),
('pay-004-04', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'May', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP),
('pay-004-05', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'June', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '8 months', CURRENT_TIMESTAMP - INTERVAL '8 months', CURRENT_TIMESTAMP),
('pay-004-06', 'cred-004', 'usr-cliente-004', 2500.00, 'PAID', 'July', 'PSE', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP - INTERVAL '7 months', CURRENT_TIMESTAMP),
-- PAGOS EN MORA CRÍTICA: 6 cuotas atrasadas (180+ días el más antiguo)
('pay-004-07', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'August', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '180 days', CURRENT_TIMESTAMP),
('pay-004-08', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'September', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '150 days', CURRENT_TIMESTAMP),
('pay-004-09', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'October', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP),
('pay-004-10', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'November', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP),
('pay-004-11', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'December', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
('pay-004-12', 'cred-004', 'usr-cliente-004', 2500.00, 'PENDING', 'January', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 5: Cliente 5 - PAGADO COMPLETAMENTE
-- Cuota mensual: 4500/6 + interés = ~800
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-005-01', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'February', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '14 months', CURRENT_TIMESTAMP - INTERVAL '14 months', CURRENT_TIMESTAMP - INTERVAL '8 months'),
('pay-005-02', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'March', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '13 months', CURRENT_TIMESTAMP - INTERVAL '13 months', CURRENT_TIMESTAMP - INTERVAL '8 months'),
('pay-005-03', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'April', 'PSE', CURRENT_TIMESTAMP - INTERVAL '12 months', CURRENT_TIMESTAMP - INTERVAL '12 months', CURRENT_TIMESTAMP - INTERVAL '8 months'),
('pay-005-04', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'May', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '11 months', CURRENT_TIMESTAMP - INTERVAL '11 months', CURRENT_TIMESTAMP - INTERVAL '8 months'),
('pay-005-05', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'June', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP - INTERVAL '10 months', CURRENT_TIMESTAMP - INTERVAL '8 months'),
('pay-005-06', 'cred-005', 'usr-cliente-005', 800.00, 'PAID', 'July', 'PSE', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP - INTERVAL '9 months', CURRENT_TIMESTAMP - INTERVAL '8 months');

-- ==========================================
-- CRÉDITO 6: Cliente 6 - NUEVO (1 cuota pagada de 12)
-- Cuota mensual: 3000/12 + interés = ~280
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-006-01', 'cred-006', 'usr-cliente-006', 280.00, 'PAID', 'January', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP),
-- Próxima cuota (aún no vence)
('pay-006-02', 'cred-006', 'usr-cliente-006', 280.00, 'PENDING', 'February', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 7: Cliente 7 - MORA MODERADA (2 pagos atrasados)
-- Cuota mensual: 6500/12 + interés = ~600
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-007-01', 'cred-007', 'usr-cliente-007', 600.00, 'PAID', 'August', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
('pay-007-02', 'cred-007', 'usr-cliente-007', 600.00, 'PAID', 'September', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP),
('pay-007-03', 'cred-007', 'usr-cliente-007', 600.00, 'PAID', 'October', 'PSE', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP),
-- PAGOS EN MORA MODERADA: 3 cuotas atrasadas (75+ días)
('pay-007-04', 'cred-007', 'usr-cliente-007', 600.00, 'PENDING', 'November', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '75 days', CURRENT_TIMESTAMP),
('pay-007-05', 'cred-007', 'usr-cliente-007', 600.00, 'PENDING', 'December', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP),
('pay-007-06', 'cred-007', 'usr-cliente-007', 600.00, 'PENDING', 'January', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP);

-- ==========================================
-- CRÉDITO 8: Cliente 8 - CANCELADO (pagos parciales antes de cancelación)
-- Cuota mensual: 85000/36 + interés = ~2800
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-008-01', 'cred-008', 'usr-cliente-008', 2800.00, 'PAID', 'August', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '18 months', CURRENT_TIMESTAMP - INTERVAL '18 months', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('pay-008-02', 'cred-008', 'usr-cliente-008', 2800.00, 'PAID', 'September', 'Efectivo', CURRENT_TIMESTAMP - INTERVAL '17 months', CURRENT_TIMESTAMP - INTERVAL '17 months', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('pay-008-03', 'cred-008', 'usr-cliente-008', 2800.00, 'PAID', 'October', 'PSE', CURRENT_TIMESTAMP - INTERVAL '16 months', CURRENT_TIMESTAMP - INTERVAL '16 months', CURRENT_TIMESTAMP - INTERVAL '2 months'),
-- Pagos FAILED (intentos de pago fallidos antes de cancelación)
('pay-008-04', 'cred-008', 'usr-cliente-008', 2800.00, 'FAILED', 'November', 'Transferencia Bancaria', NULL, CURRENT_TIMESTAMP - INTERVAL '15 months', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('pay-008-05', 'cred-008', 'usr-cliente-008', 2800.00, 'FAILED', 'December', 'PSE', NULL, CURRENT_TIMESTAMP - INTERVAL '14 months', CURRENT_TIMESTAMP - INTERVAL '2 months');

-- ==========================================
-- CRÉDITO 9: Segundo crédito Cliente 1 - AL DÍA
-- Cuota mensual: 2500/6 + interés = ~450
-- ==========================================
INSERT INTO "Payment" (
    id, "creditId", "userId", amount, status, month, "paymentMethod", paid_date,
    "createdAt", "updatedAt"
) VALUES
('pay-009-01', 'cred-009', 'usr-cliente-001', 450.00, 'PAID', 'December', 'Transferencia Bancaria', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP),
('pay-009-02', 'cred-009', 'usr-cliente-001', 450.00, 'PAID', 'January', 'PSE', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP),
('pay-009-03', 'cred-009', 'usr-cliente-001', 450.00, 'PENDING', 'February', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 4. REGISTROS DE AUDITORÍA
-- =====================================================
INSERT INTO audit_logs (
    id, user_id, action, module, details, ip_address, user_agent, status, created_at
) VALUES
('audit-001', 'usr-gerente-001', 'CREATE_CREDIT', 'CREDITS', '{"creditId": "cred-001", "amount": 8000, "clientId": "usr-cliente-001"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '6 months'),
('audit-002', 'usr-gerente-001', 'CREATE_CREDIT', 'CREDITS', '{"creditId": "cred-002", "amount": 25000, "clientId": "usr-cliente-002"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '7 months'),
('audit-003', 'usr-gerente-001', 'CREATE_CREDIT', 'CREDITS', '{"creditId": "cred-003", "amount": 35000, "clientId": "usr-cliente-003"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '10 months'),
('audit-004', 'usr-gerente-001', 'UPDATE_CREDIT_STATUS', 'CREDITS', '{"creditId": "cred-002", "oldStatus": "ACTIVE", "newStatus": "OVERDUE"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '45 days'),
('audit-005', 'usr-gerente-001', 'UPDATE_CREDIT_STATUS', 'CREDITS', '{"creditId": "cred-003", "oldStatus": "ACTIVE", "newStatus": "OVERDUE"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '90 days'),
('audit-006', 'usr-gerente-001', 'UPDATE_CREDIT_STATUS', 'CREDITS', '{"creditId": "cred-004", "oldStatus": "ACTIVE", "newStatus": "OVERDUE"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '150 days'),
('audit-007', 'usr-gerente-001', 'CANCEL_CREDIT', 'CREDITS', '{"creditId": "cred-008", "reason": "Mora extrema - más de 12 meses sin pago"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('audit-008', 'usr-gerente-001', 'BLOCK_USER', 'USERS', '{"userId": "usr-cliente-008", "reason": "Crédito cancelado por incumplimiento"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('audit-009', 'usr-asistente-001', 'LOGIN', 'AUTH', '{"success": true}', '192.168.1.50', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('audit-010', 'usr-cliente-001', 'CREATE_PAYMENT', 'PAYMENTS', '{"paymentId": "pay-001-06", "amount": 750, "creditId": "cred-001"}', '192.168.1.200', 'Mozilla/5.0', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 month');

-- =====================================================
-- 5. CONTACTOS (para asistentes) - sin updated_at
-- =====================================================
INSERT INTO contacts (
    id, user_id, status, created_at
) VALUES
('contact-001', 'usr-cliente-002', 'active', CURRENT_TIMESTAMP - INTERVAL '45 days'),
('contact-002', 'usr-cliente-003', 'active', CURRENT_TIMESTAMP - INTERVAL '90 days'),
('contact-003', 'usr-cliente-004', 'active', CURRENT_TIMESTAMP - INTERVAL '150 days'),
('contact-004', 'usr-cliente-007', 'active', CURRENT_TIMESTAMP - INTERVAL '75 days'),
('contact-005', 'usr-cliente-008', 'inactive', CURRENT_TIMESTAMP - INTERVAL '12 months');

-- =====================================================
-- 6. REPORTES (generados por asistentes) - sin updated_at
-- =====================================================
INSERT INTO reports (
    id, user_id, title, content, created_at
) VALUES
('report-001', 'usr-cliente-002', 'Seguimiento de mora - María Elena Cosecha', 'Cliente contactado el día de hoy. Indica dificultades económicas por pérdida de cosecha. Solicita plazo de 15 días para ponerse al día.', CURRENT_TIMESTAMP - INTERVAL '40 days'),
('report-002', 'usr-cliente-003', 'Alerta de mora grave - José Campo', 'Se han realizado 5 intentos de contacto sin respuesta. Última comunicación hace 60 días. Se recomienda escalar a gerencia.', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('report-003', 'usr-cliente-004', 'Caso crítico - Ana Siembra', 'Cliente no responde llamadas ni mensajes. Visita a domicilio programada. Mora acumulada supera los 6 meses.', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('report-004', 'usr-cliente-007', 'Seguimiento mora moderada - Roberto Maíz', 'Cliente comprometido a realizar pago parcial esta semana. Se acordó plan de pago extendido pendiente de aprobación.', CURRENT_TIMESTAMP - INTERVAL '5 days');

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================
--
-- USUARIOS: 11 total
--   - 1 Gerente
--   - 2 Asistentes
--   - 8 Clientes (1 bloqueado)
--
-- CRÉDITOS: 9 total
--   - 3 ACTIVE (al día)
--   - 4 OVERDUE (en mora)
--   - 1 PAID (pagado)
--   - 1 CANCELLED (cancelado)
--
-- PAGOS/CUOTAS: 48 total
--   - Varios PAID (pagados a tiempo)
--   - Varios PENDING (pendientes, algunos en mora)
--   - 2 FAILED (fallidos)
--
-- SIMULACIÓN DE MORA:
--   - Cliente 2: 1 pago atrasado (45 días) - MORA LEVE
--   - Cliente 3: 4 pagos atrasados (30-120 días) - MORA GRAVE
--   - Cliente 4: 6 pagos atrasados (30-180 días) - MORA CRÍTICA
--   - Cliente 7: 3 pagos atrasados (15-75 días) - MORA MODERADA
--   - Cliente 8: Crédito cancelado por mora extrema
--
-- CREDENCIALES DE PRUEBA:
--   - Email: gerente@agrotac.com / Password: Test123!
--   - Email: asistente1@agrotac.com / Password: Test123!
--   - Email: pedro.agricola@email.com / Password: Test123!
--
-- =====================================================
