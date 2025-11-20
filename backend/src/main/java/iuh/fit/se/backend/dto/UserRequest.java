package iuh.fit.se.backend.dto;

import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import lombok.Data;
import org.springframework.util.StringUtils;

@Data
public class UserRequest {
    private String username;
    private String email;
    private String fullName;
    private String password;
    private Role role;

    public User toEntity() {
        return User.builder()
                .username(username != null ? username.trim() : null)
                .email(email != null ? email.trim() : null)
                .fullName(fullName != null ? fullName.trim() : null)
                .password(password)
                .role(role)
                .build();
    }

    public boolean hasPassword() {
        return StringUtils.hasText(password);
    }
}
