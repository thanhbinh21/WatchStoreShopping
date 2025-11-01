package iuh.fit.se.Nhom08_WWW_JAVA.service;

import iuh.fit.se.Nhom08_WWW_JAVA.entity.Category;
import iuh.fit.se.Nhom08_WWW_JAVA.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        return categoryRepository.findById(id)
                .map(c -> {
                    c.setName(updatedCategory.getName());
                    c.setDescription(updatedCategory.getDescription());
                    return categoryRepository.save(c);
                })
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
