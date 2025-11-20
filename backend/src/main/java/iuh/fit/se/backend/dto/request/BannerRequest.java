package iuh.fit.se.backend.dto.request;

import lombok.Data;

@Data
public class BannerRequest {
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String description;
    private Integer displayOrder;
    private Boolean active;
}
