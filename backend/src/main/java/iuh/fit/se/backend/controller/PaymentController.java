package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.request.PaymentRequest;
import iuh.fit.se.backend.dto.PaymentSummary;
import iuh.fit.se.backend.dto.response.PaymentResponse;
import iuh.fit.se.backend.entity.enums.PaymentMethod;
import iuh.fit.se.backend.entity.enums.PaymentStatus;
import iuh.fit.se.backend.service.OrderService;
import iuh.fit.se.backend.service.PaymentService;
import iuh.fit.se.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final OrderService orderService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest paymentRequest,
                                           HttpServletRequest request) {
        try {
            String paymentUrl = vnPayService.createPayment(request, paymentRequest);

            if (paymentUrl != null) {
                PaymentResponse response = new PaymentResponse();
                response.setStatus("OK");
                response.setMessage("Success");
                response.setPaymentUrl(paymentUrl);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.badRequest().body("Failed to create payment");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/vnpay-return")
    public ResponseEntity<?> paymentReturn(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_TransactionNo = params.get("vnp_TransactionNo");

        if (!vnPayService.verifyPayment(params)) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        try {
            Long orderId = Long.parseLong(vnp_TxnRef);
            PaymentStatus status = "00".equals(vnp_ResponseCode) ? PaymentStatus.PAID : PaymentStatus.FAILED;
            orderService.updatePaymentStatus(orderId, status, vnp_TransactionNo);
            
            String message = status == PaymentStatus.PAID ? "Payment successful" : "Payment failed";
            return ResponseEntity.ok(message);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid order ID");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing payment: " + e.getMessage());
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> paymentIPN(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_TransactionNo = params.get("vnp_TransactionNo");

        boolean isValid = vnPayService.verifyPayment(params);

        Map<String, Object> result = new HashMap<>();

        if (isValid) {
            if ("00".equals(vnp_ResponseCode)) {
                // Cập nhật trạng thái đơn hàng trong database
                try {
                    Long orderId = Long.parseLong(vnp_TxnRef);
                    orderService.updatePaymentStatus(orderId, PaymentStatus.PAID, vnp_TransactionNo);
                } catch (Exception e) {
                    System.err.println("Error updating payment status in IPN: " + e.getMessage());
                }
                result.put("RspCode", "00");
                result.put("Message", "Confirm Success");
            } else {
                result.put("RspCode", "00");
                result.put("Message", "Confirm Success");
            }
        } else {
            result.put("RspCode", "97");
            result.put("Message", "Invalid Signature");
        }

        return ResponseEntity.ok(result);
    }



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
}
