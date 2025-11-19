package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.OrderRequest;
import iuh.fit.se.backend.dto.request.OrderStatusUpdateRequest;
import iuh.fit.se.backend.dto.response.OrderResponse;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime fromDate,
            @RequestParam(required = false) LocalDateTime toDate,
            @RequestParam(required = false) Double minTotal,
            @RequestParam(required = false) Double maxTotal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(orderService.getAdminOrders(
                customerName,
                status,
                fromDate,
                toDate,
                minTotal,
                maxTotal,
                page,
                size,
                sortBy,
                sortDir
        ));
    }

    @GetMapping("/user/{userId}")
    public List<Order> getByUser(@PathVariable Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderResponse(id));
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

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody @Validated OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
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
