package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.ProductPromotionResponse;
import iuh.fit.se.backend.dto.PromotionSummary;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.Promotion;
import iuh.fit.se.backend.repository.PromotionRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;

    public List<Promotion> getAll() { return promotionRepository.findAll(); }
    public Optional<Promotion> get(Long id) { return promotionRepository.findById(id); }
    public Promotion save(Promotion promotion, List<Long> productIds) {
        ensureUniqueName(promotion);

        if (productIds != null) {
            List<Product> products = productRepository.findAllById(productIds);
            promotion.setProducts(products);
        } else if (promotion.getId() != null) {
            promotionRepository.findById(promotion.getId())
                    .map(Promotion::getProducts)
                    .ifPresent(promotion::setProducts);
        }
        return promotionRepository.save(promotion);
    }

    private void ensureUniqueName(Promotion promotion) {
        String name = promotion.getName();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Promotion name is required");
        }

        boolean exists = promotion.getId() == null
                ? promotionRepository.existsByNameIgnoreCase(name)
                : promotionRepository.existsByNameIgnoreCaseAndIdNot(name, promotion.getId());

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Promotion name already exists");
        }
    }
    public void delete(Long id) { promotionRepository.deleteById(id); }

    @Transactional(readOnly = true)
    public List<ProductPromotionResponse> getPromotionsGroupedByProduct() {
        Map<Long, ProductPromotionResponse> grouped = new LinkedHashMap<>();

        for (Promotion promotion : promotionRepository.findAll()) {
            for (Product product : promotion.getProducts()) {
        PromotionSummary summary = new PromotionSummary(
            promotion.getId(),
            promotion.getName(),
            promotion.getDiscount(),
            promotion.getStartDate(),
            promotion.getEndDate(),
            promotion.getProducts().stream().map(Product::getId).collect(Collectors.toList())
        );
                ProductPromotionResponse response = grouped.computeIfAbsent(
                        product.getId(),
                        id -> new ProductPromotionResponse(id, product.getName(), new ArrayList<>())
                );
                response.getPromotions().add(summary);
            }
        }

        return new ArrayList<>(grouped.values());
    }
}
