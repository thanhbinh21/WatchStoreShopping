package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.PaymentRequest;
import iuh.fit.se.backend.dto.PaymentSummary;
import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.Payment;
import iuh.fit.se.backend.repository.OrderRepository;
import iuh.fit.se.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<PaymentSummary> getSummaries(String keyword) {
        List<Payment> payments = paymentRepository.findAll();

        return payments.stream()
                .filter(payment -> matchesKeyword(payment, keyword))
                .sorted(Comparator.comparing(
                        Payment::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentSummary getSummary(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return toSummary(payment);
    }

    public PaymentSummary create(PaymentRequest request) {
        validateRequest(request);

        Order order = resolveOrder(request.resolveOrderId());
        Payment payment = Payment.builder()
                .method(request.getMethod())
                .amount(request.getAmount())
                .order(order)
                .build();

        Payment saved = paymentRepository.save(payment);
        return toSummary(saved);
    }

    public PaymentSummary update(Long id, PaymentRequest request) {
        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (request.getMethod() != null) {
            existing.setMethod(request.getMethod());
        }
        if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than 0");
            }
            existing.setAmount(request.getAmount());
        }
        Long orderId = request.resolveOrderId();
        if (orderId != null) {
            existing.setOrder(resolveOrder(orderId));
        }

        Payment saved = paymentRepository.save(existing);
        return toSummary(saved);
    }

    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
        }
        paymentRepository.deleteById(id);
    }

    private Order resolveOrder(Long orderId) {
        if (orderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order.id is required");
        }
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private void validateRequest(PaymentRequest request) {
        if (request.getMethod() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }
        if (request.getAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than 0");
        }
        if (request.resolveOrderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is required");
        }
    }

    private PaymentSummary toSummary(Payment payment) {
        Order order = payment.getOrder();
        return new PaymentSummary(
                payment.getId(),
                payment.getMethod(),
                payment.getAmount(),
                order != null ? order.getId() : null,
                order != null ? Optional.ofNullable(order.getFullName()).orElse(null) : null,
                order != null ? order.getCreatedAt() : null,
                payment.getCreatedAt()
        );
    }

    private boolean matchesKeyword(Payment payment, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String normalized = keyword.trim().toLowerCase(Locale.ROOT);

        if (payment.getMethod() != null && payment.getMethod().name().toLowerCase(Locale.ROOT).contains(normalized)) {
            return true;
        }

        if (payment.getId() != null && String.valueOf(payment.getId()).contains(normalized)) {
            return true;
        }

        Order order = payment.getOrder();
        if (order != null) {
            if (order.getId() != null && String.valueOf(order.getId()).contains(normalized)) {
                return true;
            }
            if (order.getFullName() != null && order.getFullName().toLowerCase(Locale.ROOT).contains(normalized)) {
                return true;
            }
        }

        return false;
    }
}
