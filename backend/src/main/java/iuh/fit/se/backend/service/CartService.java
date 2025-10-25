package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Cart;
import iuh.fit.se.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;

    public List<Cart> getAllCarts() { return cartRepository.findAll(); }
    public Cart getCart(Long id) { return cartRepository.findById(id).orElse(null); }
    public Cart saveCart(Cart cart) { return cartRepository.save(cart); }
    public void deleteCart(Long id) { cartRepository.deleteById(id); }
}
