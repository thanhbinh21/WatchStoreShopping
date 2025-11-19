package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.OrderRequest;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Getting orders for userId: {}, authenticated user: {}", userId, userDetails.getUsername());
        
        // Get current user from authentication using username
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        log.info("Current user ID: {}, Role: {}", currentUser.getId(), currentUser.getRole());
        
        // Check if user is trying to access their own orders or is ADMIN
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        
        if (!isAdmin && !currentUser.getId().equals(userId)) {
            log.warn("User {} trying to access orders of user {}", currentUser.getId(), userId);
            return ResponseEntity.status(403).body("Bạn không có quyền xem đơn hàng của người khác");
        }
        
        var orders = orderService.getOrdersByUser(userId);
        log.info("Found {} orders for user {}", orders.size(), userId);
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public Order getOne(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderRequest request) {
        Order saved = orderService.saveOrder(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(
            @PathVariable Long id,
            @RequestBody OrderRequest request
    ) {
        Order saved = orderService.updateOrder(id, request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Order>> searchOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate,
            @RequestParam(required = false) Double minTotal,
            @RequestParam(required = false) Double maxTotal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(orderService.searchOrders(
                customerName, status, fromDate, toDate, minTotal, maxTotal, page, size, sortBy, sortDir
        ));
    }
}
