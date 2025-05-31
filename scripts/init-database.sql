-- 初始化数据库脚本
-- scripts/init-database.sql

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除枚举类型（如果存在）
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "StockMovementType" CASCADE;

-- 创建枚举类型
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'USER');
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE', 'EXPIRED', 'OTHER');

-- 创建分类表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建供应商表
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role "UserRole" DEFAULT 'USER',
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(255) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    purchase_price DECIMAL(12,2),
    selling_price DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500),
    low_stock_threshold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建库存项目表
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    location VARCHAR(255),
    batch_number VARCHAR(255),
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_number)
);

-- 创建库存移动表
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    type "StockMovementType" NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_items_product ON inventory_items(product_id);
CREATE INDEX idx_inventory_items_batch ON inventory_items(batch_number);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_user ON stock_movements(user_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);

-- 插入初始分类数据
INSERT INTO categories (name, description) VALUES
('电子产品', '各类电子设备和配件'),
('办公用品', '办公室日常用品'),
('家具', '办公和家用家具');

-- 插入初始用户数据（密码已哈希）
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@inventory.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'Admin', 'User'),
('manager', 'manager@inventory.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANAGER', 'Manager', 'User'),
('user1', 'user1@inventory.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', 'Regular', 'User');

-- 插入初始供应商数据
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('苹果公司', '张三', '+86-138-0001-0001', 'contact@apple-supplier.com', '北京市朝阳区科技园区1号'),
('联想集团', '李四', '+86-138-0002-0002', 'contact@lenovo-supplier.com', '上海市浦东新区科技大道2号'),
('华为技术', '王五', '+86-138-0003-0003', 'contact@huawei-supplier.com', '深圳市南山区科技园3号');

-- 插入初始商品数据
INSERT INTO products (name, description, sku, category_id, supplier_id, purchase_price, selling_price, low_stock_threshold) VALUES
('iPhone 15', '苹果最新款智能手机', 'IPHONE15-001', 1, 1, 5000.00, 6999.00, 10),
('ThinkPad X1', '联想商务笔记本电脑', 'THINKPAD-X1-001', 1, 2, 8000.00, 12999.00, 5),
('华为MateBook', '华为轻薄笔记本', 'MATEBOOK-001', 1, 3, 4500.00, 6999.00, 8);

-- 插入初始库存数据
INSERT INTO inventory_items (product_id, quantity, location, batch_number, expiry_date) VALUES
(1, 50, 'A-01-01', 'BATCH-2024-001', '2025-12-31'),
(2, 75, 'A-02-01', 'BATCH-2024-002', '2025-12-31'),
(3, 100, 'A-03-01', 'BATCH-2024-003', '2025-12-31');

-- 插入初始库存移动记录
INSERT INTO stock_movements (product_id, inventory_item_id, user_id, type, quantity, reason, reference, notes) VALUES
(1, 1, 1, 'PURCHASE', 50, '采购入库', 'PO-2024-001', '初始库存入库 - 批次 BATCH-2024-001'),
(2, 2, 1, 'PURCHASE', 75, '采购入库', 'PO-2024-002', '初始库存入库 - 批次 BATCH-2024-002'),
(3, 3, 1, 'PURCHASE', 100, '采购入库', 'PO-2024-003', '初始库存入库 - 批次 BATCH-2024-003'),
(1, 1, 2, 'SALE', -10, '销售出库', 'SO-2024-001', '测试销售出库记录');

-- 更新库存数量（减去销售的10个）
UPDATE inventory_items SET quantity = 40 WHERE id = 1;

COMMIT; 