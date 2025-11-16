package iuh.fit.se.backend.config;

import iuh.fit.se.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                   AuthenticationProvider authenticationProvider) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // tắt CSRF cho API
                .cors(cors -> {
                }) // Bật CORS để dùng CorsConfig
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
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payments/**").permitAll()
                        // Upload API - chỉ ADMIN
                        .requestMatchers("/api/upload/**").hasRole("ADMIN")

                        // Phân quyền cho Products
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Phân quyền cho Categories - PUT/POST/DELETE trước GET
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // Phân quyền cho Brands - PUT/POST/DELETE trước GET
                        .requestMatchers(HttpMethod.POST, "/api/brands/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/brands/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/brands/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()

                        // Phân quyền cho Suppliers - PUT/POST/DELETE trước GET
                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**").permitAll()

                        // Reviews
                        .requestMatchers(HttpMethod.GET, "/api/reviews/product/**").permitAll()
                        .requestMatchers("/api/reviews/**").hasRole("ADMIN")

                        // Độc quyền (ADMIN)
                        .requestMatchers("/api/reviews/**").hasRole("ADMIN") // Reviews yêu cầu ADMIN
                        .requestMatchers("/api/orders/**").hasRole("ADMIN")  // Orders yêu cầu ADMIN
                        .requestMatchers("/api/promotions/**").hasRole("ADMIN") // Promotions yêu cầu ADMIN cho tạo/sửa/xóa
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")   // Chỉ ADMIN được truy cập
                        .requestMatchers("/api/products/**").hasRole("ADMIN")  // Products yêu cầu ADMIN
                        .requestMatchers("/api/inventories/**").hasRole("ADMIN")  // Inventories yêu cầu ADMIN
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")   // Categories yêu cầu ADMIN
                        .requestMatchers("/api/inventories/**").hasRole("ADMIN")

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
