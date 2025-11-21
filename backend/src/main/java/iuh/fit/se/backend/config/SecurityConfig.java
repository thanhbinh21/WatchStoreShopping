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
                                // Swagger/OpenAPI - Public
                                .requestMatchers(
                                        "/v3/api-docs/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/swagger-resources/**",
                                        "/webjars/**"
                                ).permitAll()

                                // Auth endpoints - Public
                                .requestMatchers("/api/auth/**").permitAll()

//                        cart
                                .requestMatchers(HttpMethod.GET, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.PUT, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/api/cart/**").permitAll()

                                // Products - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                                // Categories - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                                // Brands - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/brands/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/brands/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/brands/**").hasRole("ADMIN")

                                // Suppliers - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasRole("ADMIN")

                                // Reviews - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                                .requestMatchers("/api/reviews/**").hasRole("ADMIN")

                                // Orders - Users can create and view their orders, ADMIN can manage all
                                .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()  // Users can create orders
                                .requestMatchers(HttpMethod.GET, "/api/orders/user/**").authenticated()  // Users can view their orders (must be before /api/orders/**)
                                .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel").authenticated()  // Users can cancel their own orders
                                .requestMatchers("/api/orders/**").hasRole("ADMIN")  // ADMIN can manage all orders

                                // Banner
                                .requestMatchers(HttpMethod.GET, "/api/banners/**").permitAll()

                                // Posts
                                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()

                                // Độc quyền (ADMIN)
                                .requestMatchers("/api/reviews/**").hasRole("ADMIN") // Reviews yêu cầu ADMIN
                                .requestMatchers("/api/promotions/**").hasRole("ADMIN") // Promotions yêu cầu ADMIN cho tạo/sửa/xóa
                                .requestMatchers(HttpMethod.POST, "/api/payments/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/payments/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasRole("ADMIN")
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")   // Chỉ ADMIN được truy cập
                                .requestMatchers("/api/products/**").hasRole("ADMIN")  // Products yêu cầu ADMIN
                                .requestMatchers("/api/inventories/**").hasRole("ADMIN")  // Inventories yêu cầu ADMIN
                                .requestMatchers("/api/categories/**").hasRole("ADMIN")   // Categories yêu cầu ADMIN
                                // Promotions - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()


                                // Payments - GET public
                                .requestMatchers(HttpMethod.GET, "/api/payments/**").permitAll()

                                // Cart - POST public (add to cart without login)
                                .requestMatchers(HttpMethod.POST, "/api/cart/**").permitAll()

                                // Upload - ADMIN only
                                .requestMatchers("/api/upload/**").hasRole("ADMIN")

                                // Admin endpoints - ADMIN only

                                .requestMatchers("/api/inventories/**").hasRole("ADMIN")

                                // All other requests need authentication
                                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @SuppressWarnings("deprecation")
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
