package iuh.fit.se.backend.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class OrderItemResponse {
    Long id;
    Long productId;
    String productName;
    String productImageUrl;
    BigDecimal price;
    Integer quantity;
}
