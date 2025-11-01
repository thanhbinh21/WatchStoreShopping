package iuh.fit.se.backend.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private String comment;
    private int rating;
    private Long userId;
    private Long productId;
}