package iuh.fit.se.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;

    private double price; // <-- thêm đây

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference(value = "order-items")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (product != null) {
            this.price = product.getPrice();
        }
    }
}
