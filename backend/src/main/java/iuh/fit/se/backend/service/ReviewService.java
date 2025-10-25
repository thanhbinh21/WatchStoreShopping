package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Review;
import iuh.fit.se.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public List<Review> getAll() { return reviewRepository.findAll(); }
    public Review get(Long id) { return reviewRepository.findById(id).orElse(null); }
    public List<Review> getByProduct(Long productId) { return reviewRepository.findByProductId(productId); }
    public List<Review> getByUser(Long userId) { return reviewRepository.findByUserId(userId); }
    public Review save(Review review) { return reviewRepository.save(review); }
    public void delete(Long id) { reviewRepository.deleteById(id); }
}
