package iuh.fit.se.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // tắt CSRF cho API
                .cors(cors -> {}) // Bật CORS để dùng CorsConfig
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập Swagger/OpenAPI mà không cần đăng nhập
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()
                        // Quy tắc mở
                        .requestMatchers("/api/auth/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // Phân quyền
                        .requestMatchers("/api/products/**").permitAll()     // Ai cũng xem được sản phẩm

                        // Độc quyền (ADMIN)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")  // Chỉ ADMIN được truy cập

                        .anyRequest().authenticated()                        // Các API khác cần login
                );
        return http.build();
    }
}
