package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.config.JwtService;
import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.request.LoginRequest;
import iuh.fit.se.backend.dto.request.RegisterRequest;
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
}
