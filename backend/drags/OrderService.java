package iuh.fit.se.Nhom08_WWW_JAVA.service;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.Order;

import java.util.List;

public interface OrderService {
    Order createOrder(Order order);
    List<Order> getOrdersByUserId(Long userId);
    Order getOrderById(Long orderId);
}
