package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.PaymentRequest;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.Payment;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public List<Payment> getAll() { return paymentRepository.findAll(); }
    public Payment get(Long id) { return paymentRepository.findById(id).orElse(null); }

    public Payment create(PaymentRequest request) {
        Payment payment = Payment.builder()
                .method(request.getMethod())
                .amount(request.getAmount())
                .order(resolveOrder(request.resolveOrderId()))
                .build();
        return paymentRepository.save(payment);
    }

    public Payment update(Long id, PaymentRequest request) {
        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (request.getMethod() != null) {
            existing.setMethod(request.getMethod());
        }
        if (request.getAmount() != null) {
            existing.setAmount(request.getAmount());
        }
        Long orderId = request.resolveOrderId();
        if (orderId != null) {
            existing.setOrder(resolveOrder(orderId));
        }

        return paymentRepository.save(existing);
    }

    public void delete(Long id) { paymentRepository.deleteById(id); }

    private Order resolveOrder(Long orderId) {
        if (orderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order.id is required");
        }
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }
}
