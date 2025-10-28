package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public List<Inventory> getAll() { return inventoryRepository.findAll(); }
    public Inventory get(Long id) { return inventoryRepository.findById(id).orElse(null); }
    public Inventory getByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("No inventory found for product id " + productId));
    }
    public Inventory save(Inventory inventory) { return inventoryRepository.save(inventory); }
    public void delete(Long id) { inventoryRepository.deleteById(id); }
}
