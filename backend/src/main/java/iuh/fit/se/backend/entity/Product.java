package iuh.fit.se.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String brand;

    private String description;

    private double price;

    private int stock; // số lượng tồn kho

    private String imageUrl; // link ảnh sản phẩm

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference(value = "category-products")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonBackReference(value = "supplier-products")
    private Supplier supplier;
}
