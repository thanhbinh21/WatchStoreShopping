package iuh.fit.se.Nhom08_WWW_JAVA.service;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.Product;
import iuh.fit.se.Nhom08_WWW_JAVA.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(p -> {
                    p.setName(updatedProduct.getName());
                    p.setBrand(updatedProduct.getBrand());
                    p.setDescription(updatedProduct.getDescription());
                    p.setPrice(updatedProduct.getPrice());
                    p.setStock(updatedProduct.getStock());
                    p.setImageUrl(updatedProduct.getImageUrl());
                    return productRepository.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
