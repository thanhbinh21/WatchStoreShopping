package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.response.NotificationResponse;
import iuh.fit.se.backend.entity.Notification;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.NotificationRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationResponse createNotification(User user, String title, String message) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required for notification");
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", saved.getId(), user.getId());
        return toResponse(saved);
    }

    public NotificationResponse createReviewDeletedNotification(User user, Product product, String reason) {
        String productName = product != null ? product.getName() : "sản phẩm";
        String title = "Đánh giá của bạn đã bị gỡ";
        String message = String.format(
                "Đánh giá của bạn về %s đã bị quản trị viên gỡ. Lý do: %s",
                productName,
                reason
        );
        return createNotification(user, title, message);
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        validateUserExists(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        validateUserExists(userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification does not belong to this user");
        }

        if (Boolean.TRUE.equals(notification.getRead())) {
            return toResponse(notification);
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    public void markAllAsRead(Long userId) {
        validateUserExists(userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean hasUpdates = false;
        for (Notification notification : notifications) {
            if (!Boolean.TRUE.equals(notification.getRead())) {
                notification.setRead(true);
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            notificationRepository.saveAll(notifications);
        }
    }

    public long countUnread(Long userId) {
        validateUserExists(userId);
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    private void validateUserExists(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }
        boolean exists = userRepository.existsById(userId);
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(Boolean.TRUE.equals(notification.getRead()))
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
