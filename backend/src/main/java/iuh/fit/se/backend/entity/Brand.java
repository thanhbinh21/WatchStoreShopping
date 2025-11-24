package iuh.fit.se.backend.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    private String description;

    private String logoUrl;

    @OneToMany(mappedBy = "brand")
    @JsonManagedReference(value = "brand-products")
    @JsonIgnore // Ignore products khi serialize để tránh circular reference và giảm payload
    private List<Product> products = new ArrayList<>();
}

