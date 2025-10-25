package iuh.fit.se.Nhom08_WWW_JAVA.repository;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
