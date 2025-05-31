-- SQL for init_db.sql

-- 自动更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- 表创建 (Table Creation)
--------------------------------------------------

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Suppliers Table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_suppliers_timestamp
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    purchase_price DECIMAL(12, 2),
    selling_price DECIMAL(12, 2) NOT NULL,
    image_url VARCHAR(2048),
    low_stock_threshold INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);

CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- 实际应用中存储哈希后的密码
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Inventory Items Table (代表特定批次的库存)
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0), -- 当前批次的实际库存数量
    location VARCHAR(255),
    entry_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    cost_price DECIMAL(12, 2), -- 此批次的成本
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_inventory_items_timestamp
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Stock Movements Table (库存流水/审计日志)
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- 冗余 product_id 方便查询
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'INITIAL_STOCK', 'RETURN_IN', 'WASTAGE_OUT')),
    quantity_change INTEGER NOT NULL, -- 正数增加, 负数减少
    related_order_id VARCHAR(255),
    reason TEXT,
    movement_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_movement_date ON stock_movements(movement_date);

--------------------------------------------------
-- 插入初始数据 (Initial Data Insertion)
--------------------------------------------------

-- 1. 插入分类 (Categories)
INSERT INTO categories (name, description) VALUES
('电脑与平板', '各类笔记本电脑、台式机和平板设备'),
('影音设备', '耳机、音响、播放器等'),
('电脑配件', '键盘、鼠标、显示器等');

-- 2. 插入供应商 (Suppliers)
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('优质供应商A', '李明', '13800138000', 'liming@supplierA.com', '科技园区A栋101室'),
('快捷供应商B', '张三', '13900139000', 'zhangsan@supplierB.com', '工业区B路202号');

-- 3. 插入用户 (Users) - 注意：password_hash 应该是实际哈希后的值
INSERT INTO users (name, email, password_hash, role) VALUES
('管理员', 'admin@example.com', 'placeholder_hashed_admin_password', 'ADMIN'), -- 请替换为真实哈希密码
('员工小王', 'staff_wang@example.com', 'placeholder_hashed_staff_password', 'STAFF'); -- 请替换为真实哈希密码

-- 4. 插入商品 (Products)
-- 假设 categories 的 id 自动生成为 1, 2, 3; suppliers 的 id 自动生成为 1, 2
INSERT INTO products (name, description, sku, category_id, supplier_id, purchase_price, selling_price, image_url, low_stock_threshold) VALUES
('高效笔记本电脑 Pro', '最新款15英寸笔记本电脑，性能强劲。', 'LAPTOP-PRO-001', 1, 1, 6500.00, 7999.00, 'https://via.placeholder.com/150/0000FF/808080?Text=LaptopPro', 10),
('无线降噪耳机 Plus', '沉浸式音效体验，超长续航。', 'HEADPHONES-PLUS-002', 2, 2, 800.00, 1299.00, 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Headphones', 20),
('智能办公键盘', '人体工学设计，带可编程按键。', 'KEYBOARD-SMART-003', 3, 1, 350.00, 599.00, 'https://via.placeholder.com/150/008000/FFFFFF?Text=Keyboard', 15);

-- 5. 插入库存项目 (Inventory Items) - 代表初始库存批次
-- 假设 products 的 id 自动生成为 1, 2, 3
INSERT INTO inventory_items (product_id, quantity, location, cost_price, notes) VALUES
(1, 50, '仓库A-货架01', 6500.00, '初始批次 - 笔记本电脑 Pro'),
(2, 100, '仓库B-货架02', 800.00, '初始批次 - 无线耳机 Plus'),
(3, 75, '仓库A-货架03', 350.00, '初始批次 - 智能键盘');

-- 6. 插入库存流水 (Stock Movements) - 对应上面的初始库存
-- 假设 inventory_items 的 id 自动生成为 1, 2, 3
-- 假设 users 的 id (管理员) 自动生成为 1
INSERT INTO stock_movements (inventory_item_id, product_id, user_id, type, quantity_change, reason) VALUES
(1, 1, 1, 'INITIAL_STOCK', 50, '系统初始化'),
(2, 2, 1, 'INITIAL_STOCK', 100, '系统初始化'),
(3, 3, 1, 'INITIAL_STOCK', 75, '系统初始化');

-- 文件结束