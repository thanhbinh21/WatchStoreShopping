package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Promotion;
import iuh.fit.se.backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    public List<Promotion> getAll() {
        return promotionService.getAll();
    }

    @GetMapping("/{id}")
    public Promotion getOne(@PathVariable Long id) {
        return promotionService.get(id);
    }

    @PostMapping
    public Promotion create(@RequestBody Promotion promotion) {
        return promotionService.save(promotion);
    }

    @PutMapping("/{id}")
    public Promotion update(@PathVariable Long id, @RequestBody Promotion promotion) {
        promotion.setId(id);
        return promotionService.save(promotion);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        promotionService.delete(id);
    }
}
