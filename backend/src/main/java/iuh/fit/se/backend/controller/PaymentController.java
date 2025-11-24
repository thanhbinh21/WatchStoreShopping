package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.PaymentRequest;
import iuh.fit.se.backend.dto.PaymentSummary;
import iuh.fit.se.backend.entity.enums.PaymentMethod;
import iuh.fit.se.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentSummary>>> getAllPayments(
            @RequestParam(value = "search", required = false) String search
    ) {
        List<PaymentSummary> data = paymentService.getSummaries(search);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentSummary>> getPaymentById(@PathVariable Long id) {
        try {
            PaymentSummary summary = paymentService.getSummary(id);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> getPaymentMethods() {
        return ResponseEntity.ok(ApiResponse.success(Arrays.asList(PaymentMethod.values())));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createPayment(@RequestBody PaymentRequest request) {
        try {
            paymentService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Payment created"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updatePayment(@PathVariable Long id, @RequestBody PaymentRequest request) {
        try {
            paymentService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("Payment updated"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deletePayment(@PathVariable Long id) {
        try {
            paymentService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Payment deleted"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }
}
