package iuh.fit.se.Nhom08_WWW_JAVA.service;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.Order;
import iuh.fit.se.Nhom08_WWW_JAVA.entity.OrderItem;
import iuh.fit.se.Nhom08_WWW_JAVA.entity.Product;
import iuh.fit.se.Nhom08_WWW_JAVA.repository.OrderRepository;
import iuh.fit.se.Nhom08_WWW_JAVA.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Order createOrder(Order order) {
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                // Load product từ database
                Product fullProduct = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException(
                                "Product not found with id " + item.getProduct().getId()));

                // Gán product đầy đủ vào order item
                item.setProduct(fullProduct);

                // Gán giá sản phẩm vào price của order item
                item.setPrice(fullProduct.getPrice());

                // Thiết lập quan hệ hai chiều
                item.setOrder(order);
            }
        }

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
}
