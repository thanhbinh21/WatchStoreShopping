package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.OrderItem;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull(message = "UserId is required")
    private Long userId;
    private List<OrderItemRequest> orderItems;
}
