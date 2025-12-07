package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.OrderItemRequest;
import iuh.fit.se.backend.dto.request.OrderRequest;
import iuh.fit.se.backend.dto.response.OrderItemResponse;
import iuh.fit.se.backend.dto.response.OrderResponse;
import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import iuh.fit.se.backend.entity.enums.PaymentMethod;
import iuh.fit.se.backend.entity.enums.PaymentStatus;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order saveOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        
        // Set shipping information
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setWard(request.getWard());
        order.setDistrict(request.getDistrict());
        order.setCity(request.getCity());
        order.setNote(request.getNote());
        
        // Set payment method and status
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);

        if (request.getOrderItems() != null) {
            for (OrderItemRequest itemReq : request.getOrderItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

                // Kiểm tra số lượng tồn kho
                int availableStock = product.getStockQuantity();
                if (availableStock < itemReq.getQuantity()) {
                    throw new RuntimeException("Sản phẩm " + product.getName() + " chỉ còn " + availableStock + " trong kho");
                }

                // Trừ số lượng tồn kho
                if (!product.getInventories().isEmpty()) {
                    int remainingQuantity = itemReq.getQuantity();
                    for (Inventory inventory : product.getInventories()) {
                        if (remainingQuantity <= 0) break;
                        
                        int currentStock = inventory.getStock();
                        int toDeduct = Math.min(currentStock, remainingQuantity);
                        
                        inventory.setStock(currentStock - toDeduct);
                        remainingQuantity -= toDeduct;
                        
                        log.info("Trừ {} sản phẩm từ inventory #{}, còn lại: {}", 
                                toDeduct, inventory.getId(), inventory.getStock());
                    }
                }

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(product.getCurrentPrice()); //  chốt giá tại thời điểm đặt hàng
                item.setProductName(product.getName()); // snapshot tên sản phẩm
                item.setProductImageUrl(product.getPrimaryImageUrl()); // snapshot ảnh sản phẩm

                order.getOrderItems().add(item);
            }
        }

        Order savedOrder = orderRepository.save(order);
        
        // Chỉ gửi email xác nhận cho COD, VNPay sẽ gửi khi thanh toán thành công
        if (savedOrder.getPaymentMethod() == PaymentMethod.CASH) {
            emailService.sendOrderConfirmationEmail(savedOrder);
        }
        
        log.info("✅ Đơn hàng #{} đã được tạo và số lượng đã được trừ khỏi kho", savedOrder.getId());
        return savedOrder;
    }

    public Order updateOrder(Long id, OrderRequest request) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setUser(user);

        // Xóa orderItems cũ
        existing.getOrderItems().clear();

        // Thêm orderItems mới
        if (request.getOrderItems() != null) {
            for (OrderItemRequest itemReq : request.getOrderItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                OrderItem item = new OrderItem();
                item.setOrder(existing);
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(product.getCurrentPrice()); // giữ giá tại thời điểm cập nhật

                existing.getOrderItems().add(item);
            }
        }

        return orderRepository.save(existing);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Page<Order> searchOrders(
            String customerName,
            String username,
            Long userId,
            String status,
            LocalDateTime fromDate, LocalDateTime toDate,
            Double minTotal, Double maxTotal,
            int page, int size, String sortBy, String sortDir
    ) {
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();

        if (customerName != null) {
            spec = spec.and(OrderSpecification.hasCustomerName(customerName));
        }
        if (username != null) {
            spec = spec.and(OrderSpecification.hasUsername(username));
        }
        if (userId != null) {
            spec = spec.and(OrderSpecification.hasUserId(userId));
        }
        if (status != null) {
            spec = spec.and(OrderSpecification.hasStatus(status));
        }
        if (fromDate != null) {
            spec = spec.and(OrderSpecification.createdAfter(fromDate));
        }
        if (toDate != null) {
            spec = spec.and(OrderSpecification.createdBefore(toDate));
        }
        if (minTotal != null) {
            spec = spec.and(OrderSpecification.hasTotalGreaterThanOrEqual(minTotal));
        }
        if (maxTotal != null) {
            spec = spec.and(OrderSpecification.hasTotalLessThanOrEqual(maxTotal));
        }

        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return orderRepository.findAll(spec, pageable);
    }

        public Page<OrderResponse> getAdminOrders(
            String customerName,
            String username,
            Long userId,
            String status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Double minTotal,
            Double maxTotal,
            int page,
            int size,
            String sortBy,
            String sortDir
        ) {
        return searchOrders(customerName, username, userId, status, fromDate, toDate, minTotal, maxTotal, page, size, sortBy, sortDir)
                .map(this::toOrderResponse);
    }

    public OrderResponse getOrderResponse(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toOrderResponse(order);
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        OrderStatus oldStatus = order.getStatus();
        
        // Nếu chuyển sang trạng thái CANCELLED, hoàn lại số lượng vào kho
        if (status == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            log.info("🔄 Hủy đơn hàng #{}, hoàn lại số lượng vào kho", id);
            
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                int quantityToRestore = item.getQuantity();
                
                // Hoàn lại số lượng vào inventory đầu tiên
                if (!product.getInventories().isEmpty()) {
                    Inventory firstInventory = product.getInventories().get(0);
                    firstInventory.setStock(firstInventory.getStock() + quantityToRestore);
                    
                    log.info("✅ Hoàn {} sản phẩm '{}' vào kho, tổng: {}", 
                            quantityToRestore, product.getName(), firstInventory.getStock());
                }
            }
        }

        order.setStatus(status);

        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
    }

    /**
     * Update payment status for an order (used by VNPay callback)
     * @param orderId Order ID
     * @param paymentStatus New payment status
     * @param transactionNo VNPay transaction number
     */
    @org.springframework.transaction.annotation.Transactional
    public void updatePaymentStatus(Long orderId, PaymentStatus paymentStatus, String transactionNo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Check if payment status is already set (idempotency check)
        if (order.getPaymentStatus() == paymentStatus) {
            log.info("⏭️ Order #{} payment status already set to {}, skipping update", orderId, paymentStatus);
            return;
        }

        order.setPaymentStatus(paymentStatus);
        
        try {
            orderRepository.save(order);
            
            // Send confirmation email asynchronously to avoid blocking
            if (paymentStatus == PaymentStatus.PAID) {
                // Fetch fresh order with all relationships loaded before async call
                Order orderWithRelations = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
                // Force load relationships
                orderWithRelations.getOrderItems().size();
                orderWithRelations.getUser().getEmail();
                
                // Remove purchased products from user's cart
                Long userId = orderWithRelations.getUser().getId();
                log.info("🔄 Removing purchased products from cart for user #{}...", userId);
                try {
                    List<Long> productIds = orderWithRelations.getOrderItems().stream()
                            .map(item -> item.getProduct().getId())
                            .collect(Collectors.toList());
                    cartService.removeProductsFromCart(userId, productIds);
                    log.info("✅ Removed {} products from cart for user #{} after successful payment", productIds.size(), userId);
                } catch (Exception e) {
                    log.error("❌ Failed to remove products from cart for user #{}: {}", userId, e.getMessage(), e);
                }
                
                final Order orderForEmail = orderWithRelations;
                new Thread(() -> {
                    try {
                        emailService.sendOrderConfirmationEmail(orderForEmail);
                    } catch (Exception e) {
                        log.error("Failed to send order confirmation email for order #{}", orderId, e);
                    }
                }).start();
            }
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            log.warn("⚠️ Order #{} was updated by another transaction, retrying...", orderId);
            // Retry once with fresh data
            Order freshOrder = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
            
            if (freshOrder.getPaymentStatus() != paymentStatus) {
                freshOrder.setPaymentStatus(paymentStatus);
                orderRepository.save(freshOrder);
                log.info("✅ Order #{} payment status updated on retry", orderId);
            }
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        BigDecimal total = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = order.getOrderItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> {
                    Product product = item.getProduct();
                    return OrderItemResponse.builder()
                            .id(item.getId())
                            .productId(product != null ? product.getId() : null)
                            .productName(product != null ? product.getName() : null)
                            .productImageUrl(product != null ? product.getPrimaryImageUrl() : null)
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .build();
                })
                .collect(Collectors.toList());

        User user = order.getUser();

        return OrderResponse.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .userId(user != null ? user.getId() : null)
                .customerName(user != null ? user.getFullName() : null)
                .customerEmail(user != null ? user.getEmail() : null)
                .username(user != null ? user.getUsername() : null)
                .totalAmount(total)
                .totalQuantity(totalQuantity)
                .items(items)
                .build();
    }
}
