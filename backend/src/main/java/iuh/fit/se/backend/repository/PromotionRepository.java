package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
}
