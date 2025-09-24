package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Promotion;
import iuh.fit.se.backend.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;

    public List<Promotion> getAll() { return promotionRepository.findAll(); }
    public Promotion get(Long id) { return promotionRepository.findById(id).orElse(null); }
    public Promotion save(Promotion promotion) { return promotionRepository.save(promotion); }
    public void delete(Long id) { promotionRepository.deleteById(id); }
}
