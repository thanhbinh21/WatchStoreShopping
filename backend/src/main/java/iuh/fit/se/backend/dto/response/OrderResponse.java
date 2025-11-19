package iuh.fit.se.backend.dto.response;

import iuh.fit.se.backend.entity.enums.OrderStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class OrderResponse {
    Long id;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    OrderStatus status;

    Long userId;
    String customerName;
    String customerEmail;
    String username;

    BigDecimal totalAmount;
    Integer totalQuantity;

    List<OrderItemResponse> items;
}
