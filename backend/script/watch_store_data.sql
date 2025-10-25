USE watch_store;
SET FOREIGN_KEY_CHECKS = 0;
INSERT INTO users (username, password, email, full_name, role, created_at) VALUES
('vovanhung', '123456', 'vovanhung2864@gmail.com', 'Võ Văn Hùng', 'USER', '2022-12-01 00:00:00'),
('lephanhuynh', '123456', 'nhuhuynh2862@gmail.com', 'Lê Phan Huỳnh Như', 'USER', '2022-12-02 00:00:00'),
('dangkhoa', '123456', 'dangkhoa2345@gmail.com', 'Võ Quang Đăng Khoa', 'USER', '2022-12-03 00:00:00'),
('thieuhoang', '123456', 'thieuhoang2346@gmail.com', 'Thiều Việt Hoàng', 'USER', '2023-04-01 00:00:00'),
('binhminh', '123456', 'binhminh@gmail.com', 'Hoàng Bình Minh', 'USER', '2023-04-05 00:00:00'),
('baotram', '123456', 'baotram2345@gmail.com', 'Thiều Bảo Trâm', 'USER', '2023-04-06 00:00:00'),
('camthu', '123456', 'camthu@gmail.com', 'Lê Hồng Cẩm Thu', 'USER', '2023-04-07 00:00:00'),
('ngoctram', '123456', 'ngoctram567@gmail.com', 'Lê Ngọc Trâm', 'USER', '2023-04-08 00:00:00'),
('camtho', '123456', 'camtho234@gmail.com', 'Phạm Cẩm Thơ', 'USER', '2023-04-09 00:00:00'),
('congtru', '123456', 'congtru2865@gmail.com', 'Đào Công Trứ', 'USER', '2023-04-10 00:00:00'),
('admin', 'admin123', 'admin@watchstore.vn', 'Admin WatchStore', 'ADMIN', NOW());
INSERT INTO categories (name, description) VALUES
('Seiko', 'Seiko - thương hiệu Nhật Bản'),
('Casio', 'Casio - thương hiệu Nhật Bản'),
('Citizen', 'Citizen - thương hiệu Nhật Bản'),
('Orient', 'Orient - thương hiệu Nhật Bản'),
('Apple', 'Apple - smartwatch'),
('Rolex', 'Rolex - thương hiệu xa xỉ'),
('Omega', 'Omega - thương hiệu cao cấp'),
('Swatch', 'Swatch - trẻ trung'),
('Tissot', 'Tissot - Thụy Sỹ');
INSERT INTO suppliers (name, contact) VALUES
('Tân Phúc', 'tanphuc@gmail.com'),
('Thịnh Long', 'thinhlong@gmail.com'),
('Kim Long', 'thinhgia@gmail.com'),
('Thế Giới Đồng Hồ', 'thegioidongho@gmail.com'),
('Minh Tân', 'minhtan@gmail.com'),
('Đức Tài', 'ductai@gmail.com'),
('Nam Sơn', 'namson@gmail.com'),
('Thịnh Hưng', 'thinhhung@gmail.com'),
('Duy Anh', 'duyanh@gmail.com');
INSERT INTO products (name, brand, description, price, image_url, category_id, supplier_id) VALUES
('Seiko 5 Field Sports Style SRPG29K1', 'Seiko', 'Mẫu Seiko SRPG29K1 thiết kế đơn giản chức năng 3 kim, dạ quang, mặt số xanh 39.4mm.', 7090000.00, 'SRPG29K1-699x699.png', (SELECT id FROM categories WHERE name='Seiko' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Seiko 5 Field Specialist Style SRPG41K1', 'Seiko', 'Mẫu Seiko SRPG41K1 thiết kế đơn giản, mặt số 39.4mm.', 8050000.00, 'SRPG41K1.png', (SELECT id FROM categories WHERE name='Seiko' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Seiko SSB351P1', 'Seiko', 'Seiko SSB351P1 phiên bản chronograph, mặt 43.9mm.', 6375000.00, 'SSB351P1-699x699.png', (SELECT id FROM categories WHERE name='Seiko' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Casio EFV-550L-1AVUDF', 'Casio', 'Casio EFV-550L-1AVUDF Edifice, 47mm.', 3529000.00, '68_EFV-550L-1AVUDF-1-699x699.png', (SELECT id FROM categories WHERE name='Casio' LIMIT 1), (SELECT id FROM suppliers WHERE name='Tân Phúc' LIMIT 1)),
('Casio MTP-1302D-7A1VDF', 'Casio', 'Casio MTP-1302D-7A1VDF – Nữ – Quartz 38.5mm.', 1347000.00, '35_MTP-1302D-7A1VDF-699x699.png', (SELECT id FROM categories WHERE name='Casio' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thịnh Long' LIMIT 1)),
('Casio AEQ-110W-3AVDF', 'Casio', 'Casio AEQ-110W-3AVDF – Đồng hồ điện tử, đa chức năng.', 1581000.00, '118_AEQ-110W-3AVDF-699x699.png', (SELECT id FROM categories WHERE name='Casio' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thịnh Long' LIMIT 1)),
('Citizen BM7370-89E', 'Citizen', 'Citizen BM7370-89E Eco-Drive, dây kim loại.', 8000000.00, 'BM7370-89E-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen AN8195-58E', 'Citizen', 'Citizen AN8195-58E Quartz 42mm.', 5985000.00, 'AN8195-58E-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen NP1020-15A', 'Citizen', 'Citizen NP1020-15A Automatic, dây da.', 8450000.00, '138_NP1020-15A-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Orient Sun And Moon RA-AS0103A10B', 'Orient', 'Orient RA-AS0103A10B Sun & Moon, automatic.', 11490000.00, 'RA-AS0103A10B-699x699.png', (SELECT id FROM categories WHERE name='Orient' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Orient Bambino FAC08003A0', 'Orient', 'Orient Bambino FAC08003A0 - cổ điển, automatic.', 7510000.00, 'FAC08003A0-1-699x699.png', (SELECT id FROM categories WHERE name='Orient' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Orient FGW01004A0', 'Orient', 'Orient FGW01004A0 Quartz, kính sapphire.', 4160000.00, 'FGW01004A0-699x699.png', (SELECT id FROM categories WHERE name='Orient' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('Apple Watch SE Nhôm 2022 GPS - 40mm', 'Apple', 'Apple Watch SE 2022 Nhôm GPS.', 8990000.00, '0011842_midnight_550.png', (SELECT id FROM categories WHERE name='Apple' LIMIT 1), (SELECT id FROM suppliers WHERE name='Minh Tân' LIMIT 1)),
('Apple Watch Ultra LTE 49mm Ocean Band Vàng', 'Apple', 'Apple Watch Ultra LTE 49mm.', 23990000.00, '0001670_white_550.png', (SELECT id FROM categories WHERE name='Apple' LIMIT 1), (SELECT id FROM suppliers WHERE name='Minh Tân' LIMIT 1)),
('Apple Watch 8 45mm nhôm GPS + Cellular Đỏ', 'Apple', 'Apple Watch 8 45mm.', 15990000.00, '0014063_apple-watch-series-8-45mm-nhom-gps-cellular-sao-chep_550.png', (SELECT id FROM categories WHERE name='Apple' LIMIT 1), (SELECT id FROM suppliers WHERE name='Minh Tân' LIMIT 1)),
('SEIKO 5 FIELD SRPD77K1', 'Seiko', 'SEIKO 5 SRPD77K1 automatic 42.5mm.', 8090000.00, 'SRPG33K1-699x699.png', (SELECT id FROM categories WHERE name='Seiko' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('CASIO ECB-900DB-1BDR', 'Casio', 'CASIO ECB-900DB-1BDR Solar Edifice.', 6909000.00, '52_ECB-900DB-1BDR-699x699.png', (SELECT id FROM categories WHERE name='Casio' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thịnh Long' LIMIT 1)),
('Orient SK RA-AA0B01G19B', 'Orient', 'Orient SK RA-AA0B01G19B mạ vàng automatic.', 7909000.00, 'AQ-S810W-1A4VDF-699x699.png', (SELECT id FROM categories WHERE name='Orient' LIMIT 1), (SELECT id FROM suppliers WHERE name='Thế Giới Đồng Hồ' LIMIT 1)),
('CITIZEN BI5054-53L', 'Citizen', 'Citizen BI5054-53L Quartz.', 4270000.00, '177_BI5054-53L-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen AR1135-10E', 'Citizen', 'Citizen AR1135-10E Eco-Drive.', 6900000.00, 'AR1135-10E-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen AR1113-12A', 'Citizen', 'Citizen AR1113-12A Eco-Drive.', 8530000.00, 'AR1113-12A-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen BM9012-02A', 'Citizen', 'Citizen BM9012-02A Eco-Drive dây da.', 6900000.00, '159_BM9012-02A-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen BI5006-81P', 'Citizen', 'Citizen BI5006-81P Quartz.', 4985000.00, '86_BI5006-81P-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen ER0210-55Y', 'Citizen', 'Citizen ER0210-55Y Nữ Quartz khảm xà cừ.', 3785000.00, '18_ER0210-55Y-699x699.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1)),
('Citizen ED8180-52X', 'Citizen', 'Citizen ED8180-52X Nữ Quartz.', 4855000.00, 'ED8180-52X.png', (SELECT id FROM categories WHERE name='Citizen' LIMIT 1), (SELECT id FROM suppliers WHERE name='Kim Long' LIMIT 1));
INSERT INTO inventories (stock, product_id) SELECT 32, id FROM products WHERE name='Seiko 5 Field Sports Style SRPG29K1';
INSERT INTO inventories (stock, product_id) SELECT 27, id FROM products WHERE name='Seiko 5 Field Specialist Style SRPG41K1';
INSERT INTO inventories (stock, product_id) SELECT 28, id FROM products WHERE name='Seiko SSB351P1';
INSERT INTO inventories (stock, product_id) SELECT 20, id FROM products WHERE name='Casio EFV-550L-1AVUDF';
INSERT INTO inventories (stock, product_id) SELECT 18, id FROM products WHERE name='Casio MTP-1302D-7A1VDF';
INSERT INTO inventories (stock, product_id) SELECT 11, id FROM products WHERE name='Casio AEQ-110W-3AVDF';
INSERT INTO inventories (stock, product_id) SELECT 19, id FROM products WHERE name='Citizen BM7370-89E';
INSERT INTO inventories (stock, product_id) SELECT 18, id FROM products WHERE name='Citizen AN8195-58E';
INSERT INTO inventories (stock, product_id) SELECT 18, id FROM products WHERE name='Citizen NP1020-15A';
INSERT INTO inventories (stock, product_id) SELECT 33, id FROM products WHERE name='Orient Sun And Moon RA-AS0103A10B';
INSERT INTO inventories (stock, product_id) SELECT 30, id FROM products WHERE name='Orient Bambino FAC08003A0';
INSERT INTO inventories (stock, product_id) SELECT 35, id FROM products WHERE name='Orient FGW01004A0';
INSERT INTO inventories (stock, product_id) SELECT 32, id FROM products WHERE name='Apple Watch SE Nhôm 2022 GPS - 40mm';
INSERT INTO inventories (stock, product_id) SELECT 15, id FROM products WHERE name='Apple Watch Ultra LTE 49mm Ocean Band Vàng';
INSERT INTO inventories (stock, product_id) SELECT 20, id FROM products WHERE name='Apple Watch 8 45mm nhôm GPS + Cellular Đỏ';
INSERT INTO inventories (stock, product_id) SELECT 14, id FROM products WHERE name='SEIKO 5 FIELD SRPD77K1';
INSERT INTO inventories (stock, product_id) SELECT 13, id FROM products WHERE name='CASIO ECB-900DB-1BDR';
INSERT INTO inventories (stock, product_id) SELECT 16, id FROM products WHERE name='Orient SK RA-AA0B01G19B';
INSERT INTO inventories (stock, product_id) SELECT 18, id FROM products WHERE name='CITIZEN BI5054-53L';
INSERT INTO inventories (stock, product_id) SELECT 23, id FROM products WHERE name='Citizen AR1135-10E';
INSERT INTO inventories (stock, product_id) SELECT 10, id FROM products WHERE name='Citizen AR1113-12A';
INSERT INTO inventories (stock, product_id) SELECT 10, id FROM products WHERE name='Citizen BM9012-02A';
INSERT INTO inventories (stock, product_id) SELECT 10, id FROM products WHERE name='Citizen BI5006-81P';
INSERT INTO inventories (stock, product_id) SELECT 8, id FROM products WHERE name='Citizen ER0210-55Y';
INSERT INTO inventories (stock, product_id) SELECT 10, id FROM products WHERE name='Citizen ED8180-52X';
INSERT INTO carts (user_id) SELECT id FROM users WHERE email='vovanhung2864@gmail.com' LIMIT 1;
INSERT INTO carts (user_id) SELECT id FROM users WHERE email='nhuhuynh2862@gmail.com' LIMIT 1;
INSERT INTO cart_items (quantity, cart_id, product_id) SELECT 1, c.id, p.id FROM carts c JOIN users u ON u.id=c.user_id JOIN products p ON p.name='Seiko 5 Field Sports Style SRPG29K1' WHERE u.email='vovanhung2864@gmail.com' LIMIT 1;
INSERT INTO cart_items (quantity, cart_id, product_id) SELECT 2, c.id, p.id FROM carts c JOIN users u ON u.id=c.user_id JOIN products p ON p.name='Casio AEQ-110W-3AVDF' WHERE u.email='nhuhuynh2862@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'DELIVERED', u.id, '2022-12-29 03:56:02', 20000, 0, 7110000, '521, CMT8#Phường 14#Quận 10#Thành phố Hồ Chí Minh', 'CASH', NULL FROM users u WHERE u.email='vovanhung2864@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'DELIVERED', u.id, '2023-03-21 04:12:14', 20000, 0, 8070000, '521, CMT8#Phường 14#Quận 10#Thành phố Hồ Chí Minh', 'VNPAY', NULL FROM users u WHERE u.email='nhuhuynh2862@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'DELIVERED', u.id, '2023-03-23 04:12:14', 20000, 0, 6395000, '521, CMT8#Phường 14#Quận 10#Thành phố Hồ Chí Minh', 'VNPAY', NULL FROM users u WHERE u.email='dangkhoa2345@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-04-20 04:30:45', 35000, 1548775, 29461725, '34#Phường Bồng Lai#Thị xã Quế Võ#Tỉnh Bắc Ninh', 'MOMO', 'VO001' FROM users u WHERE u.email='thieuhoang2346@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-04-24 04:35:13', 120000, 543750, 17701250, '31#Phường Mỹ Long#Thành phố Long Xuyên#Tỉnh An Giang', 'VNPAY', 'VO009' FROM users u WHERE u.email='binhminh@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-04-29 04:39:09', 120000, 1164975, 22254525, '31#Phường Mỹ Long#Thành phố Long Xuyên#Tỉnh An Giang', 'CREDIT', 'VO001' FROM users u WHERE u.email='binhminh@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-13 04:54:28', 35000, 0, 2963000, '31#Phường Mỹ Long#Thành phố Long Xuyên#Tỉnh An Giang', 'CASH', NULL FROM users u WHERE u.email='binhminh@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-16 04:56:03', 35000, 0, 18089500, '34#Xã Lương Can#Huyện Hà Quảng#Tỉnh Cao Bằng', 'CASH', NULL FROM users u WHERE u.email='dangkhoa2345@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-19 05:03:16', 35000, 0, 7125000, '34#Xã Lương Can#Huyện Hà Quảng#Tỉnh Cao Bằng', 'CASH', NULL FROM users u WHERE u.email='dangkhoa2345@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-19 05:03:42', 20000, 0, 10051000, '521, CMT8#Phường 14#Quận 10#Thành phố Hồ Chí Minh', 'MOMO', NULL FROM users u WHERE u.email='vovanhung2864@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-19 05:03:52', 20000, 0, 15210500, '521, CMT8#Phường 14#Quận 10#Thành phố Hồ Chí Minh', 'CASH', NULL FROM users u WHERE u.email='vovanhung2864@gmail.com' LIMIT 1;
INSERT INTO orders (status, user_id, created_at, shipping_fee, order_discount, order_total, address, payment_method, voucher_code) SELECT 'PENDING', u.id, '2023-05-19 05:04:42', 35000, 0, 7605000, '34#Phường Bồng Lai#Thị xã Quế Võ#Tỉnh Bắc Ninh', 'CASH', NULL FROM users u WHERE u.email='thieuhoang2346@gmail.com' LIMIT 1;
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 7090000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Seiko 5 Field Sports Style SRPG29K1' WHERE o.created_at='2022-12-29 03:56:02' AND u.email='vovanhung2864@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8050000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Seiko 5 Field Specialist Style SRPG41K1' WHERE o.created_at='2023-03-21 04:12:14' AND u.email='nhuhuynh2862@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 6375000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Seiko SSB351P1' WHERE o.created_at='2023-03-23 04:12:14' AND u.email='dangkhoa2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8000000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen BM7370-89E' WHERE o.created_at='2023-04-20 04:30:45' AND u.email='thieuhoang2346@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 5985000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen AN8195-58E' WHERE o.created_at='2023-04-20 04:30:45' AND u.email='thieuhoang2346@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8450000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen NP1020-15A' WHERE o.created_at='2023-04-20 04:30:45' AND u.email='thieuhoang2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8540500.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Apple Watch SE Nhôm 2022 GPS - 40mm' WHERE o.created_at='2023-04-20 04:30:45' AND u.email='thieuhoang2346@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 2, 3529000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio EFV-550L-1AVUDF' WHERE o.created_at='2023-04-24 04:35:13' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 7, 1581000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio AEQ-110W-3AVDF' WHERE o.created_at='2023-04-24 04:35:13' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 1347000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio MTP-1302D-7A1VDF' WHERE o.created_at='2023-04-29 04:39:09' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 15190500.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Apple Watch 8 45mm nhôm GPS + Cellular Đỏ' WHERE o.created_at='2023-04-29 04:39:09' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 6762000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen AR1135-10E' WHERE o.created_at='2023-04-29 04:39:09' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 1347000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio MTP-1302D-7A1VDF' WHERE o.created_at='2023-05-13 04:54:28' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 1581000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio AEQ-110W-3AVDF' WHERE o.created_at='2023-05-13 04:54:28' AND u.email='binhminh@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 3529000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio EFV-550L-1AVUDF' WHERE o.created_at='2023-05-16 04:56:03' AND u.email='dangkhoa2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 5985000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen AN8195-58E' WHERE o.created_at='2023-05-16 04:56:03' AND u.email='dangkhoa2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8540500.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Apple Watch SE Nhôm 2022 GPS - 40mm' WHERE o.created_at='2023-05-16 04:56:03' AND u.email='dangkhoa2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 7090000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Seiko 5 Field Sports Style SRPG29K1' WHERE o.created_at='2023-05-19 05:03:16' AND u.email='dangkhoa2345@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 1581000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Casio AEQ-110W-3AVDF' WHERE o.created_at='2023-05-19 05:03:42' AND u.email='vovanhung2864@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 8450000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen NP1020-15A' WHERE o.created_at='2023-05-19 05:03:42' AND u.email='vovanhung2864@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 1, 15190500.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Apple Watch 8 45mm nhôm GPS + Cellular Đỏ' WHERE o.created_at='2023-05-19 05:03:52' AND u.email='vovanhung2864@gmail.com';
INSERT INTO order_items (quantity, price, order_id, product_id) SELECT 2, 3785000.00, o.id, p.id FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON p.name='Citizen ER0210-55Y' WHERE o.created_at='2023-05-19 05:04:42' AND u.email='thieuhoang2346@gmail.com';
INSERT INTO payments (method, amount, order_id, created_at) SELECT 'CASH', SUM(oi.price*oi.quantity), o.id, o.created_at FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.created_at='2022-12-29 03:56:02' GROUP BY o.id;
INSERT INTO payments (method, amount, order_id, created_at) SELECT 'VNPAY', SUM(oi.price*oi.quantity), o.id, o.created_at FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.created_at='2023-03-21 04:12:14' GROUP BY o.id;
INSERT INTO payments (method, amount, order_id, created_at) SELECT 'MOMO', SUM(oi.price*oi.quantity), o.id, o.created_at FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.created_at='2023-04-20 04:30:45' GROUP BY o.id;
INSERT INTO shipments (address, status, order_id, created_at) SELECT '521, CMT8, Phường 14, Quận 10, TP.HCM', 'DELIVERED', o.id, o.created_at FROM orders o WHERE o.created_at='2022-12-29 03:56:02';
INSERT INTO shipments (address, status, order_id, created_at) SELECT '34, Phường Bồng Lai, Thị xã Quế Võ, Tỉnh Bắc Ninh', 'PENDING', o.id, o.created_at FROM orders o WHERE o.created_at='2023-04-20 04:30:45';
INSERT INTO promotions (name, discount, created_at, start_date, end_date) VALUES
('30/4', 5.00, NOW(), '2023-04-24 00:00:00', '2023-04-30 23:59:59'),
('5/5', 2.00, NOW(), '2023-05-04 00:00:00', '2023-05-07 23:59:59'),
('Noel', 3.00, NOW(), '2023-12-15 00:00:00', '2023-12-25 23:59:59'),
('Black Friday 2025', 20.00, NOW(), '2025-11-01 00:00:00', '2025-11-30 23:59:59'),
('Tet 2025', 10.00, NOW(), '2025-01-01 00:00:00', '2025-01-10 23:59:59');
INSERT INTO promotion_products (promotion_id, product_id) SELECT pr.id, p.id FROM promotions pr JOIN products p ON p.name='Apple Watch SE Nhôm 2022 GPS - 40mm' WHERE pr.name='30/4';
INSERT INTO promotion_products (promotion_id, product_id) SELECT pr.id, p.id FROM promotions pr JOIN products p ON p.name='SEIKO 5 FIELD SRPD77K1' WHERE pr.name='Black Friday 2025';
INSERT INTO reviews (comment, rating, user_id, product_id, created_at) SELECT 'Rất đẹp và sang trọng!', 5, u.id, p.id, NOW() FROM users u JOIN products p ON p.name='Seiko 5 Field Sports Style SRPG29K1' WHERE u.email='vovanhung2864@gmail.com';
INSERT INTO reviews (comment, rating, user_id, product_id, created_at) SELECT 'Đeo bền, pin trâu', 4, u.id, p.id, NOW() FROM users u JOIN products p ON p.name='Casio AEQ-110W-3AVDF' WHERE u.email='vovanhung2864@gmail.com';
INSERT INTO reviews (comment, rating, user_id, product_id, created_at) SELECT 'Thiết kế tinh tế, đáng tiền', 5, u.id, p.id, NOW() FROM users u JOIN products p ON p.name='Apple Watch 8 45mm nhôm GPS + Cellular Đỏ' WHERE u.email='binhminh@gmail.com';
INSERT INTO reviews (comment, rating, user_id, product_id, created_at) SELECT 'Phù hợp đi làm, lịch lãm', 4, u.id, p.id, NOW() FROM users u JOIN products p ON p.name='Orient Bambino FAC08003A0' WHERE u.email='dangkhoa2345@gmail.com';
INSERT INTO reviews (comment, rating, user_id, product_id, created_at) SELECT 'Mạnh mẽ, pin ngon', 5, u.id, p.id, NOW() FROM users u JOIN products p ON p.name='Citizen BM7370-89E' WHERE u.email='nhuhuynh2862@gmail.com';
SET FOREIGN_KEY_CHECKS = 1;
