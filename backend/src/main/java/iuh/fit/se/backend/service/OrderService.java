package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.OrderItemRequest;
import iuh.fit.se.backend.dto.request.OrderRequest;
import iuh.fit.se.backend.dto.response.OrderItemResponse;
import iuh.fit.se.backend.dto.response.OrderResponse;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.OrderStatus;
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
    private final ProductRepository productRepository;

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
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
        
        // Set payment method
        order.setPaymentMethod(request.getPaymentMethod());

        if (request.getOrderItems() != null) {
            for (OrderItemRequest itemReq : request.getOrderItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

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

        return orderRepository.save(order);
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

        order.setStatus(status);

        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
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
