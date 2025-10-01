package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.config.JwtService;
import iuh.fit.se.backend.dto.LoginRequest;
import iuh.fit.se.backend.dto.LoginResponse;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.service.UserService;
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

        return ResponseEntity.ok(new LoginResponse(token, user.getRole().toString()));
    }
}
