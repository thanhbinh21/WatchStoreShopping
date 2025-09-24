package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Payment;
import iuh.fit.se.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public List<Payment> getAll() { return paymentRepository.findAll(); }
    public Payment get(Long id) { return paymentRepository.findById(id).orElse(null); }
    public Payment save(Payment payment) { return paymentRepository.save(payment); }
    public void delete(Long id) { paymentRepository.deleteById(id); }
}
