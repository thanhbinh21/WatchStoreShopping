package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.UserSummary;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import iuh.fit.se.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummary> searchUsers(String keyword, Role role, boolean includeInactive, Pageable pageable) {
        String sanitizedKeyword = sanitizeKeyword(keyword);
        return userRepository.searchUsers(sanitizedKeyword, role, includeInactive, pageable)
                .map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserSummary> getUserSummary(Long id) {
        return userRepository.findById(id).map(this::toSummary);
    }

    @Override
    @Transactional
    public UserSummary createUser(UserRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        String username = normalize(request.getUsername());
        String email = normalize(request.getEmail());
        String fullName = normalize(request.getFullName());

        if (!StringUtils.hasText(username)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!StringUtils.hasText(fullName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        if (!request.hasPassword()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        ensureUniqueUsername(username, null);
        ensureUniqueEmail(email, null);

        Role role = request.getRole() != null ? request.getRole() : Role.USER;

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserSummary updateUser(Long id, UserRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(request.getUsername())) {
            String username = normalize(request.getUsername());
            if (!username.equalsIgnoreCase(user.getUsername())) {
                ensureUniqueUsername(username, id);
            }
            user.setUsername(username);
        }

        if (StringUtils.hasText(request.getEmail())) {
            String email = normalize(request.getEmail());
            if (!email.equalsIgnoreCase(user.getEmail())) {
                ensureUniqueEmail(email, id);
            }
            user.setEmail(email);
        }

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(normalize(request.getFullName()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.hasPassword()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserSummary updateUserRole(Long id, Role role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(role);
        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserSummary updateUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setActive(active);
        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public void softDeleteUser(Long id) {
        updateUserStatus(id, false);
    }

    @Override
    @Transactional
    public User validateUser(String username, String password) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return null;
        }

        Optional<User> optionalUser = userRepository.findByUsername(normalize(username));
        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }

        if (!user.isActive()) {
            long activeCount = userRepository.countByActiveTrue();
            if (activeCount == 0) {
                user.setActive(true);
                user = userRepository.save(user);
            } else {
                return null;
            }
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return false;
        }
        return userRepository.findByUsername(normalize(username)).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return false;
        }
        return userRepository.findByEmail(normalize(email)).isPresent();
    }

    private UserSummary toSummary(User user) {
        return new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    private void ensureUniqueUsername(String username, Long excludeId) {
        userRepository.findByUsername(username)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
                });
    }

    private void ensureUniqueEmail(String email, Long excludeId) {
        userRepository.findByEmail(email)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                });
    }

    private String sanitizeKeyword(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        return keyword.trim().toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        return value != null ? value.trim() : null;
    }
}
