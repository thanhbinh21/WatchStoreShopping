package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.CartItemDto;
import iuh.fit.se.backend.dto.CartResponse;
import iuh.fit.se.backend.entity.Cart;
import iuh.fit.se.backend.entity.CartItem;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.repository.CartItemRepository;
import iuh.fit.se.backend.repository.CartRepository;
import iuh.fit.se.backend.repository.ProductRepository;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public CartResponse getUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found")));
                    return cartRepository.save(newCart);
                });

        List<CartItemDto> items = cart.getCartItems().stream().map(item ->
                new CartItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getPrimaryImageUrl(),
                        item.getQuantity(),
                        item.getProduct().getCurrentPrice() // BigDecimal OK!
                )
        ).toList();

        BigDecimal total = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, Double.parseDouble(total.toString()));
    }


    @Override
    public CartResponse addToCart(Long userId, Long productId, Integer quantity) {
        CartResponse response = getUserCart(userId);
        Cart cart = cartRepository.findByUserId(userId).get();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (cartItem == null) {
            cartItem = new CartItem(null, quantity, cart, product);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        cartItemRepository.save(cartItem);
        return getUserCart(userId);
    }

    @Override
    public CartResponse updateQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return getUserCart(item.getCart().getUser().getId());
    }

    @Override
    public CartResponse removeItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();
        Long userId = item.getCart().getUser().getId();
        cartItemRepository.delete(item);
        return getUserCart(userId);
    }

    @Override
    public void clearCart(Long userId) {

    }
}
