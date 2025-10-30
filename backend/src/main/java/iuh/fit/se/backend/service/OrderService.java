package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.OrderItemRequest;
import iuh.fit.se.backend.dto.OrderRequest;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
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

        if (request.getOrderItems() != null) {
            for (OrderItemRequest itemReq : request.getOrderItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(product.getCurrentPrice()); // 🔑 chốt giá tại thời điểm đặt hàng

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
            String customerName, String status,
            LocalDateTime fromDate, LocalDateTime toDate,
            Double minTotal, Double maxTotal,
            int page, int size, String sortBy, String sortDir
    ) {
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();

        System.out.println(customerName);
        if (customerName != null) {
            spec = spec.and(OrderSpecification.hasCustomerName(customerName));
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
}
