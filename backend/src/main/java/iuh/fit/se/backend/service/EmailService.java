package iuh.fit.se.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationEmail(String to, String fullName) {
        String subject = "Chào mừng đến với Watch Store";
        String text = String.format("Xin chào %s,\n\nCám ơn bạn đã đăng ký tài khoản tại Watch Store.\n\nTrân trọng,\nWatch Store Team", fullName != null ? fullName : "");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
