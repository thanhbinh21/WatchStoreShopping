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

    public void sendPasswordResetEmail(String to, String fullName, String token, String frontendBaseUrl) {
        String subject = "Yêu cầu đặt lại mật khẩu - Watch Store";
        String resetUrl = String.format("%s/reset-password?token=%s", frontendBaseUrl, token);
        String text = String.format(
                "Xin chào %s,\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\nĐể đặt lại mật khẩu, vui lòng truy cập link sau (hết hạn trong 1 giờ):\n%s\n\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\nTrân trọng,\nWatch Store Team",
                fullName != null ? fullName : "", resetUrl
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
