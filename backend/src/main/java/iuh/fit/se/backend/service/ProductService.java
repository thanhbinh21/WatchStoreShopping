package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.ProductResponse;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.ReviewRepository;
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
            String name, String category, String supplier,
            Double minPrice, Double maxPrice,
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
        if (supplier != null) {
            spec = (spec == null ? ProductSpecification.hasSupplier(supplier)
                    : spec.and(ProductSpecification.hasSupplier(supplier)));
        }
        if (minPrice != null || maxPrice != null) {
            spec = (spec == null ? ProductSpecification.hasPriceBetween(minPrice, maxPrice)
                    : spec.and(ProductSpecification.hasPriceBetween(minPrice, maxPrice)));
        }

        Sort sort = Sort.by(order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return productPage.map(p -> {
            Double avg = reviewRepository.getAverageRating(p.getId());
            Long total = reviewRepository.getTotalReviews(p.getId());
            return new ProductResponse(
                    p.getId(),
                    p.getName(),
                    p.getBrand(),
                    p.getDescription(),
                    p.getCurrentPrice(),
                    p.getPrimaryImageUrl(),
                    p.getCategory() != null ? p.getCategory().getName() : null,
                    p.getSupplier() != null ? p.getSupplier().getName() : null,
                    avg != null ? avg : 0.0,
                    total != null ? total : 0L
            );
        });
    }
    public List<Product> findProductByCategoryID(Long id) {
        return productRepository.findByCategoryId(id);
    }
}
