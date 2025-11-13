package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String brand;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String categoryName;
    private String supplierName;
    private String status;
    private Integer stockQuantity;

    private Double rating;       // trung bình rating
    private Long numOfRating;    // tổng số review


}
