package iuh.fit.se.backend.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private String comment;
    private int rating;
    private IdReference user;
    private IdReference product;

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    @Data
    public static class IdReference {
        private Long id;
    }
}