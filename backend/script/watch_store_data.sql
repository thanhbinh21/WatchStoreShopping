SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Xóa dữ liệu cũ (theo thứ tự foreign key)
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM reviews;
DELETE FROM shipments;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM promotion_products;
DELETE FROM promotions;
DELETE FROM product_specs;
DELETE FROM product_prices;
DELETE FROM product_images;
DELETE FROM inventories;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM suppliers;
-- DELETE FROM users; -- Bỏ comment nếu muốn xóa users

SET FOREIGN_KEY_CHECKS = 1;

-- Reset AUTO_INCREMENT
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE suppliers AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE inventories AUTO_INCREMENT = 1;
ALTER TABLE carts AUTO_INCREMENT = 1;
ALTER TABLE cart_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE shipments AUTO_INCREMENT = 1;
ALTER TABLE reviews AUTO_INCREMENT = 1;
ALTER TABLE promotions AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;
ALTER TABLE product_prices AUTO_INCREMENT = 1;
ALTER TABLE product_specs AUTO_INCREMENT = 1;

-- 1. Thêm danh mục (Categories)
INSERT INTO `categories` (`name`, `description`) VALUES
('Đồng hồ Nam', 'Đồng hồ dành cho nam giới'),
('Đồng hồ Nữ', 'Đồng hồ dành cho nữ giới'),
('Đồng hồ Thông minh', 'Smartwatch và đồng hồ thông minh'),
('Đồng hồ Thể thao', 'Đồng hồ thể thao và outdoor'),
('Đồng hồ Cao cấp', 'Đồng hồ luxury và cao cấp');

-- 2. Thêm nhà cung cấp (Suppliers)
INSERT INTO `suppliers` (`name`, `contact`) VALUES
('Casio Vietnam', 'casio@example.com | 0901234567'),
('Citizen Vietnam', 'citizen@example.com | 0901234568'),
('Seiko Vietnam', 'seiko@example.com | 0901234569'),
('Apple Vietnam', 'apple@example.com | 0901234570'),
('Samsung Vietnam', 'samsung@example.com | 0901234571'),
('Orient Vietnam', 'orient@example.com | 0901234572'),
('Fossil Vietnam', 'fossil@example.com | 0901234573'),
('Daniel Wellington', 'dw@example.com | 0901234574');

-- 3. Thêm người dùng (Users)
-- IMPORTANT: Bỏ comment dòng dưới nếu bạn chưa có users trong database
-- Nếu đã có users, hãy cập nhật user_id trong các bảng Carts, Orders phù hợp với ID users hiện tại
/*
INSERT INTO `users` (`username`, `email`, `full_name`, `password`, `role`, `created_at`) VALUES
('admin', 'admin@watchstore.com', 'Administrator', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'ADMIN', NOW()),
('nguyenvana', 'nguyenvana@email.com', 'Nguyễn Văn A', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567891', 'USER', NOW()),
('tranthib', 'tranthib@email.com', 'Trần Thị B', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567892', 'USER', NOW()),
('phamvanc', 'phamvanc@email.com', 'Phạm Văn C', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567893', 'USER', NOW()),
('lehoangd', 'lehoangd@email.com', 'Lê Hoàng D', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567894', 'USER', NOW());
*/

-- 4. Thêm sản phẩm (Products)
INSERT INTO `products` (`name`, `brand`, `description`, `price`, `category_id`, `supplier_id`, `status`, `image_url`, `created_at`) VALUES
('Casio G-Shock GA-2100', 'Casio', 'Đồng hồ thể thao nam, chống nước 200m, thiết kế octagon', 3500000, 4, 1, 'ACTIVE', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', NOW()),
('Citizen Eco-Drive AT8154', 'Citizen', 'Đồng hồ nam cao cấp, pin năng lượng ánh sáng, chronograph', 12500000, 5, 2, 'ACTIVE', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500', NOW()),
('Seiko 5 Sports SRPD', 'Seiko', 'Đồng hồ cơ automatic nam, phong cách sports', 5800000, 1, 3, 'ACTIVE', 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500', NOW()),
('Apple Watch Series 9', 'Apple', 'Smartwatch cao cấp, GPS, màn hình OLED, theo dõi sức khỏe', 10500000, 3, 4, 'ACTIVE', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500', NOW()),
('Samsung Galaxy Watch 6', 'Samsung', 'Smartwatch Android, theo dõi giấc ngủ, 40mm', 7200000, 3, 5, 'ACTIVE', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500', NOW()),
('Orient Bambino Gen 2', 'Orient', 'Đồng hồ cơ automatic nam, phong cách dress watch', 4200000, 1, 6, 'ACTIVE', 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500', NOW()),
('Fossil Gen 6 Smartwatch', 'Fossil', 'Smartwatch Wear OS, màn hình AMOLED 1.28"', 6500000, 3, 7, 'ACTIVE', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', NOW()),
('Daniel Wellington Classic Petite', 'Daniel Wellington', 'Đồng hồ nữ minimalist, dây da, mặt 32mm', 3800000, 2, 8, 'ACTIVE', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500', NOW()),
('Casio Baby-G BA-110', 'Casio', 'Đồng hồ thể thao nữ, chống nước, nhiều màu sắc', 2900000, 4, 1, 'ACTIVE', 'https://images.unsplash.com/photo-1600519677897-fec2e0a9a64e?w=500', NOW()),
('Seiko Presage Cocktail Time', 'Seiko', 'Đồng hồ nam cao cấp, automatic, mặt số nghệ thuật', 15500000, 5, 3, 'ACTIVE', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500', NOW()),
('Citizen Promaster Diver', 'Citizen', 'Đồng hồ lặn chuyên nghiệp, chống nước 200m', 8900000, 4, 2, 'ACTIVE', 'https://images.unsplash.com/photo-1611858830736-230b91e5d9d7?w=500', NOW()),
('Fossil Carlie Mini', 'Fossil', 'Đồng hồ nữ thời trang, mặt nhỏ 28mm, dây thép', 3200000, 2, 7, 'ACTIVE', 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=500', NOW());

-- 5. Thêm kho hàng (Inventories)
INSERT INTO `inventories` (`product_id`, `stock`, `updated_at`) VALUES
(1, 25, NOW()),
(2, 15, NOW()),
(3, 30, NOW()),
(4, 20, NOW()),
(5, 18, NOW()),
(6, 22, NOW()),
(7, 12, NOW()),
(8, 28, NOW()),
(9, 35, NOW()),
(10, 10, NOW()),
(11, 16, NOW()),
(12, 24, NOW());

-- 6. Thêm hình ảnh sản phẩm (Product Images)
INSERT INTO `product_images` (`product_id`, `image_url`, `is_primary`) VALUES
(1, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', 1),
(1, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', 0),
(2, 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800', 1),
(3, 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', 1),
(3, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800', 0),
(4, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', 1),
(5, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800', 1),
(8, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 1),
(10, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800', 1);

-- 7. Thêm thông số sản phẩm (Product Specs)
INSERT INTO `product_specs` (`product_id`, `key_name`, `value`) VALUES
(1, 'Đường kính mặt', '45mm'),
(1, 'Độ chống nước', '200m'),
(1, 'Loại máy', 'Quartz'),
(1, 'Chất liệu dây', 'Nhựa resin'),
(2, 'Đường kính mặt', '43mm'),
(2, 'Loại máy', 'Eco-Drive (năng lượng ánh sáng)'),
(2, 'Chất liệu vỏ', 'Thép không gỉ'),
(3, 'Đường kính mặt', '42.5mm'),
(3, 'Loại máy', 'Automatic (cơ tự động)'),
(3, 'Độ chống nước', '100m'),
(4, 'Kích thước màn hình', '45mm'),
(4, 'Loại màn hình', 'OLED Retina'),
(4, 'Hệ điều hành', 'watchOS');

-- 8. Thêm giá sản phẩm (Product Prices)
INSERT INTO `product_prices` (`product_id`, `price`, `price_type`, `is_current`, `start_date`, `end_date`) VALUES
(1, 3500000, 'REGULAR', 1, NOW(), NULL),
(2, 12500000, 'REGULAR', 1, NOW(), NULL),
(3, 5800000, 'REGULAR', 1, NOW(), NULL),
(4, 10500000, 'REGULAR', 1, NOW(), NULL),
(5, 7200000, 'REGULAR', 1, NOW(), NULL);

-- 9. Thêm khuyến mãi (Promotions)
INSERT INTO `promotions` (`name`, `discount`, `start_date`, `end_date`, `created_at`) VALUES
('Flash Sale Cuối Tuần', 15.00, '2025-10-25 00:00:00', '2025-10-27 23:59:59', NOW()),
('Khuyến mãi Smartwatch', 10.00, '2025-10-20 00:00:00', '2025-11-10 23:59:59', NOW()),
('Sale Đồng Hồ Nam', 20.00, '2025-10-28 00:00:00', '2025-11-15 23:59:59', NOW());

-- 10. Thêm sản phẩm khuyến mãi (Promotion Products)
INSERT INTO `promotion_products` (`promotion_id`, `product_id`) VALUES
(1, 1),
(1, 9),
(2, 4),
(2, 5),
(2, 7),
(3, 1),
(3, 3),
(3, 6);

-- 11. Thêm giỏ hàng (Carts)
INSERT INTO `carts` (`user_id`) VALUES
(1);

-- 12. Thêm sản phẩm trong giỏ (Cart Items)
INSERT INTO `cart_items` (`cart_id`, `product_id`, `quantity`) VALUES
(4, 1, 1),
(4, 8, 1),
(4, 4, 1);

-- 13. Thêm đơn hàng (Orders)
INSERT INTO `orders` (`user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'COMPLETED', '2025-10-15 10:30:00', '2025-10-20 14:20:00'),
(1, 'SHIPPED', '2025-10-20 09:15:00', '2025-10-25 11:00:00'),
(1, 'PAID', '2025-10-27 16:45:00', '2025-10-27 17:00:00'),
(1, 'PENDING', '2025-10-28 08:20:00', NULL),
(1, 'COMPLETED', '2025-10-10 14:30:00', '2025-10-18 10:00:00');

-- 14. Thêm sản phẩm trong đơn hàng (Order Items)
INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 3, 1, 5800000),
(1, 9, 1, 2900000),
(2, 4, 1, 10500000),
(3, 2, 1, 12500000),
(4, 1, 2, 3500000),
(5, 8, 1, 3800000),
(5, 12, 1, 3200000);

-- 15. Thêm thanh toán (Payments)
INSERT INTO `payments` (`order_id`, `amount`, `method`, `created_at`) VALUES
(1, 8700000, 'VNPAY', '2025-10-15 10:35:00'),
(2, 10500000, 'CREDIT_CARD', '2025-10-20 09:20:00'),
(3, 12500000, 'BANK_TRANSFER', '2025-10-27 17:00:00'),
(5, 7000000, 'MOMO', '2025-10-10 14:35:00');

-- 16. Thêm vận chuyển (Shipments)
INSERT INTO `shipments` (`order_id`, `address`, `status`, `created_at`) VALUES
(1, '123 Nguyễn Huệ, Quận 1, TP.HCM', 'DELIVERED', '2025-10-16 08:00:00'),
(2, '456 Lê Lợi, Quận 3, TP.HCM', 'SHIPPED', '2025-10-22 09:00:00'),
(3, '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'PENDING', '2025-10-27 18:00:00'),
(5, '321 Võ Văn Tần, Quận 3, TP.HCM', 'DELIVERED', '2025-10-12 10:00:00');

-- 17. Thêm đánh giá (Reviews)
INSERT INTO `reviews` (`product_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(3, 1, 5, 'Đồng hồ rất đẹp, chất lượng tốt, giao hàng nhanh!', '2025-10-21 10:00:00', NULL),
(9, 1, 4, 'Đồng hồ dễ thương, phù hợp cho nữ. Giá hợp lý.', '2025-10-21 10:15:00', NULL),
(4, 1, 5, 'Apple Watch tuyệt vời, tính năng đầy đủ, pin khỏe!', '2025-10-26 15:30:00', NULL),
(8, 1, 5, 'Thiết kế minimalist rất đẹp, đúng như mô tả.', '2025-10-19 09:20:00', NULL),
(3, 1, 4, 'Đồng hồ cơ chạy chính xác, giá tốt trong tầm.', '2025-10-28 11:00:00', NULL);