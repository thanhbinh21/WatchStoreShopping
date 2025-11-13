package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Inventory> getAllInventories() {
        return inventoryService.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Inventory getInventory(@PathVariable Long id) {
        return inventoryService.get(id);
    }

    @GetMapping("/product/{productId}")
    public Inventory getByProduct(@PathVariable Long productId) {
        return inventoryService.getByProduct(productId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Inventory create(@RequestBody Inventory inventory) {
        return inventoryService.save(inventory);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @RequestBody Inventory inventory) {
        inventory.setId(id);
        return inventoryService.save(inventory);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
}
