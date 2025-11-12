package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.config.JwtService;
import iuh.fit.se.backend.dto.request.LoginRequest;
import iuh.fit.se.backend.dto.response.LoginResponse;
import iuh.fit.se.backend.dto.request.RegisterRequest;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private JwtService jwtService;

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

        // Tạo user mới
        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword()) // TODO: nên mã hóa password
                .email(request.getEmail())
                .fullName(request.getFullName())
//                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .build();

        userService.createUser(newUser);

        return ResponseEntity.ok("Đăng ký thành công");
    }
}
