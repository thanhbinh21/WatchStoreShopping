package iuh.fit.se.backend.specification;

import iuh.fit.se.backend.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasName(String name) {
        return (root, query, cb) ->
                name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategory(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null) return null;
            Join<Object, Object> category = root.join("category", JoinType.INNER);
            return cb.equal(cb.lower(category.get("name")), categoryName.toLowerCase());
        };
    }

    public static Specification<Product> hasSupplier(String supplierName) {
        return (root, query, cb) -> {
            if (supplierName == null) return null;
            Join<Object, Object> supplier = root.join("supplier", JoinType.INNER);
            return cb.equal(cb.lower(supplier.get("name")), supplierName.toLowerCase());
        };
    }

    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return null;
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            } else {
                return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
            }
        };
    }
}
