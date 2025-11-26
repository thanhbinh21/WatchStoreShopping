package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.response.ProductResponse;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.ProductPriceRepository;
import iuh.fit.se.backend.repository.ReviewRepository;
import iuh.fit.se.backend.dto.response.PriceRangeResponse;
import iuh.fit.se.backend.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final ReviewRepository reviewRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

        public Page<ProductResponse> searchProducts(
            String name, String category, String brand, String supplier,
            Double minPrice, Double maxPrice, String status,
            int page, int size, String sortBy, String order
        ) {
        Specification<Product> spec = null;

        if (name != null) {
            spec = ProductSpecification.hasName(name);
        }
        if (category != null) {
            spec = (spec == null ? ProductSpecification.hasCategory(category)
                    : spec.and(ProductSpecification.hasCategory(category)));
        }
        if (brand != null) {
            spec = (spec == null ? ProductSpecification.hasBrand(brand)
                    : spec.and(ProductSpecification.hasBrand(brand)));
        }
        if (supplier != null) {
            spec = (spec == null ? ProductSpecification.hasSupplier(supplier)
                    : spec.and(ProductSpecification.hasSupplier(supplier)));
        }
        if (minPrice != null || maxPrice != null) {
            spec = (spec == null ? ProductSpecification.hasPriceBetween(minPrice, maxPrice)
                    : spec.and(ProductSpecification.hasPriceBetween(minPrice, maxPrice)));
        }
        if (status != null) {
            spec = (spec == null ? ProductSpecification.hasStatus(status)
                : spec.and(ProductSpecification.hasStatus(status)));
        }

        Sort sort = Sort.by(order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return productPage.map(p -> {
            Double avg = reviewRepository.getAverageRating(p.getId());
            Long total = reviewRepository.getTotalReviews(p.getId());
            
            ProductResponse response = new ProductResponse();
            response.setId(p.getId());
            response.setName(p.getName());
            response.setBrand(p.getBrand().getName());
            response.setBrandId(p.getBrand().getId());
            response.setDescription(p.getDescription());
            response.setPrice(p.getCurrentPrice());
            response.setImageUrl(p.getPrimaryImageUrl());
            response.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : null);
            response.setCategoryId(p.getCategory() != null ? p.getCategory().getId() : null);
            response.setSupplierName(p.getSupplier() != null ? p.getSupplier().getName() : null);
            response.setSupplierId(p.getSupplier() != null ? p.getSupplier().getId() : null);
            response.setStatus(p.getStatus() != null ? p.getStatus().toString() : null);
            response.setCreatedAt(p.getCreatedAt());
            response.setStockQuantity(p.getStockQuantity());
            response.setRating(avg != null ? avg : 0.0);
            response.setNumOfRating(total != null ? total : 0L);
            
            return response;
        });
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public PriceRangeResponse getPriceRange() {
        // get min/max for current prices. If null, return sensible defaults
        java.math.BigDecimal min = productPriceRepository.findMinCurrentPrice();
        java.math.BigDecimal max = productPriceRepository.findMaxCurrentPrice();

        if (min == null) min = java.math.BigDecimal.ZERO;
        if (max == null) max = java.math.BigDecimal.valueOf(10000000L);

        return new PriceRangeResponse(min, max);
    }
}
