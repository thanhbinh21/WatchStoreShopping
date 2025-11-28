package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.config.JwtService;
import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.request.LoginRequest;
import iuh.fit.se.backend.dto.request.RegisterRequest;
import iuh.fit.se.backend.dto.request.ForgotPasswordRequest;
import iuh.fit.se.backend.dto.request.ResetPasswordRequest;
import iuh.fit.se.backend.dto.request.ChangePasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.Principal;
import iuh.fit.se.backend.service.PasswordResetService;
import iuh.fit.se.backend.service.EmailService;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.dto.response.LoginResponse;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import iuh.fit.se.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    private final org.springframework.core.env.Environment env;
    private final iuh.fit.se.backend.repository.UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.validateUser(request.getUsername(), request.getPassword());
        if (user == null) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().toString());

        return ResponseEntity.ok(new LoginResponse(token, user.getRole().toString(), user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Kiểm tra username hoặc email đã tồn tại
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại");
        }
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng");
        }

        UserRequest userRequest = new UserRequest();
        userRequest.setUsername(request.getUsername());
        userRequest.setPassword(request.getPassword());
        userRequest.setEmail(request.getEmail());
        userRequest.setFullName(request.getFullName());
        userRequest.setRole(Role.USER);

        userService.createUser(userRequest);

        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        String email = request.getEmail().trim();
        // Find user entity by email
        iuh.fit.se.backend.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Do not reveal whether email exists; respond OK
            return ResponseEntity.ok("If that email is registered, a reset link has been sent.");
        }

        String token = passwordResetService.createTokenForUser(user);

        String frontendBase = env.getProperty("app.frontend.url", "http://localhost:5173");
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token, frontendBase);
        } catch (Exception ex) {
            System.err.println("Failed to send reset email: " + ex.getMessage());
        }

        return ResponseEntity.ok("If that email is registered, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null || request.getToken() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }
        boolean ok = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        if (!ok) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Current and new passwords are required");
        }
        String username = principal.getName();
        iuh.fit.se.backend.entity.User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Mật khẩu đã được thay đổi");
    }
}
