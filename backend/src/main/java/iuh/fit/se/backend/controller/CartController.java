package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.entity.Cart;
import iuh.fit.se.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public List<Cart> getAll() {
        return cartService.getAllCarts();
    }

    @GetMapping("/{id}")
    public Cart getOne(@PathVariable Long id) {
        return cartService.getCart(id);
    }

    @PostMapping
    public Cart create(@RequestBody Cart cart) {
        return cartService.saveCart(cart);
    }

    @PutMapping("/{id}")
    public Cart update(@PathVariable Long id, @RequestBody Cart cart) {
        cart.setId(id);
        return cartService.saveCart(cart);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartService.deleteCart(id);
    }
}
