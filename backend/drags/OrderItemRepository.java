package iuh.fit.se.Nhom08_WWW_JAVA.repository;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
