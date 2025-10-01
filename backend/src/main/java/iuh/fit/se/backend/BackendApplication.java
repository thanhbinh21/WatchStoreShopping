package iuh.fit.se.backend;

import iuh.fit.se.backend.entity.Role;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
	}

    @Bean
    CommandLineRunner run(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .password("123456")
                        .email("admin@watch.com")
                        .fullName("Administrator")
                        .role(Role.ADMIN)
                        .createdAt(LocalDateTime.now())
                        .build();
                userRepository.save(admin);
                System.out.println("✅ Admin user created!");
            }
        };
    }

}
