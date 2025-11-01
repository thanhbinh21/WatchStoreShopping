USE watch_store;

-- Users
INSERT INTO users (username, password, email, full_name, role, created_at, image_url)
VALUES 
('duyphan', '123456', 'duy@watchstore.vn', 'Phan Tấn Duy', 'USER', NOW(), '../assets/images/product.png');

-- Categories
INSERT INTO categories (name, description)
VALUES
('Luxury', 'Đồng hồ cao cấp'),
('Sport', 'Đồng hồ thể thao'),
('Casual', 'Đồng hồ thời trang hàng ngày');

-- Suppliers
INSERT INTO suppliers (name, contact)
VALUES
('Rolex SA', 'contact@rolex.com'),
('Casio Vietnam', 'support@casio.vn'),
('Seiko Japan', 'info@seiko.jp');

-- Products
INSERT INTO products (name, brand, description, price, image_url, category_id, supplier_id)
VALUES
('Rolex Submariner', 'Rolex', 'Đồng hồ lặn cao cấp', 250000000, 'rolex.jpg', 1, 1),
('Casio G-Shock', 'Casio', 'Đồng hồ thể thao siêu bền', 3500000, 'gshock.jpg', 2, 2),
('Seiko Presage', 'Seiko', 'Đồng hồ cơ thanh lịch', 12000000, 'seiko.jpg', 3, 3);


-- Inventories
INSERT INTO inventories (stock, product_id)
VALUES
(5, 1),
(20, 2),
(10, 3);

-- Carts
INSERT INTO carts (user_id) VALUES (2);

-- Cart Items
INSERT INTO cart_items (quantity, cart_id, product_id)
VALUES
(1, 1, 1),
(2, 1, 2);


-- Orders
INSERT INTO orders (status, user_id, created_at)
VALUES 
('PENDING', 2, NOW()),
('PAID', 2, NOW());

-- Order Items
INSERT INTO order_items (quantity, price, order_id, product_id)
VALUES
(1, 250000000, 1, 1),
(2, 3500000, 1, 2);

-- Payments
INSERT INTO payments (method, amount, order_id, created_at)
VALUES
('CASH', 257000000.00, 1, NOW()),
('MOMO', 3500000.00, 2, NOW());

-- Shipments
INSERT INTO shipments (address, status, order_id, created_at)
VALUES
('123 Lê Lợi, Q1, TP.HCM', 'PENDING', 1, NOW()),
('45 Trần Hưng Đạo, Q5, TP.HCM', 'SHIPPED', 2, NOW());

-- Promotions
INSERT INTO promotions (name, discount, created_at, start_date, end_date)
VALUES
('Giảm giá Tết', 10.00, NOW(), '2025-01-01 00:00:00', '2025-01-10 23:59:59'),
('Black Friday', 20.00, NOW(), '2025-11-01 00:00:00', '2025-11-30 23:59:59');

-- Promotion Products
INSERT INTO promotion_products VALUES (1, 2), (2, 3);

-- Reviews
INSERT INTO reviews (comment, rating, user_id, product_id, created_at)
VALUES
('Rất đẹp và sang trọng!', 5, 2, 1, NOW()),
('Đeo bền, pin trâu', 4, 2, 2, NOW());
