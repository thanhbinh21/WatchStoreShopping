package iuh.fit.se.backend.config;

import iuh.fit.se.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                                                                   AuthenticationProvider authenticationProvider) throws Exception {
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
                        .requestMatchers("/api/reviews/**").hasRole("ADMIN") // Reviews yêu cầu ADMIN
                        .requestMatchers("/api/orders/**").hasRole("ADMIN")  // Orders yêu cầu ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")   // Chỉ ADMIN được truy cập

                        .anyRequest().authenticated()                        // Các API khác cần login
                                )
                                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

        @Bean
        public AuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService) {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
