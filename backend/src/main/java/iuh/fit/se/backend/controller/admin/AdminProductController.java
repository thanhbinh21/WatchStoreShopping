package iuh.fit.se.backend.controller.admin;

import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Product> getAllProductsForAdmin() {
        return productService.getAllProducts();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Product getProductForAdmin(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return productService.saveProduct(product);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
