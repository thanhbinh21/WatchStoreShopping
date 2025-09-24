package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Inventory;
import iuh.fit.se.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping
    public List<Inventory> getAll() {
        return inventoryService.getAll();
    }

    @GetMapping("/{id}")
    public Inventory getOne(@PathVariable Long id) {
        return inventoryService.get(id);
    }

    @PostMapping
    public Inventory create(@RequestBody Inventory inventory) {
        return inventoryService.save(inventory);
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @RequestBody Inventory inventory) {
        inventory.setId(id);
        return inventoryService.save(inventory);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
}
