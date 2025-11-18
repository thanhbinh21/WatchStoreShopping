package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.enums.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private PaymentMethod method;
    private BigDecimal amount;
    private Long orderId;
    private IdReference order;

    public Long resolveOrderId() {
        if (orderId != null) {
            return orderId;
        }
        return order != null ? order.getId() : null;
    }

    @Data
    public static class IdReference {
        private Long id;
    }
}
