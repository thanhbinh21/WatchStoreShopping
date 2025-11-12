package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.ReviewRequest;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.Review;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.ReviewRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<Review> getAll() { return reviewRepository.findAll(); }
    public Review get(Long id) { return reviewRepository.findById(id).orElse(null); }
    public List<Review> getByProduct(Long productId) { return reviewRepository.findByProductId(productId); }
    public List<Review> getByUser(Long userId) { return reviewRepository.findByUserId(userId); }
    public Review save(Review review) { return reviewRepository.save(review); }
    public void delete(Long id) { reviewRepository.deleteById(id); }

        public Review createReview(ReviewRequest dto) {
                if (dto.getUserId() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user.id is required");
                }
                if (dto.getProductId() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "product.id is required");
                }

                User user = userRepository.findById(dto.getUserId())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                Product product = productRepository.findById(dto.getProductId())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        Review review = Review.builder()
                .comment(dto.getComment())
                .rating(dto.getRating())
                .user(user)
                .product(product)
                .build();

        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, ReviewRequest dto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (dto.getComment() != null) review.setComment(dto.getComment());
        review.setRating(dto.getRating());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            review.setUser(user);
        }

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
            review.setProduct(product);
        }

        return reviewRepository.save(review);
    }
}
