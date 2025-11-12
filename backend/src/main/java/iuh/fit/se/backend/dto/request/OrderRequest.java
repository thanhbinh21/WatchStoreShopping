package iuh.fit.se.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull(message = "UserId is required")
    private Long userId;
    private List<OrderItemRequest> orderItems;
}
