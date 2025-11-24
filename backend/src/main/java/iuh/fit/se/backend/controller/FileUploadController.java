package iuh.fit.se.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    // Đường dẫn lưu file (tương đối với thư mục frontend/public)
    private static final String PRODUCT_UPLOAD_DIR = "../frontend/public/images/products/";
    private static final String BANNER_UPLOAD_DIR = "../frontend/public/images/banners/";
    private static final String POST_UPLOAD_DIR = "../frontend/public/images/posts/";

    @PostMapping("/product-images")
    public ResponseEntity<?> uploadProductImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, PRODUCT_UPLOAD_DIR, "product");
    }

    @PostMapping("/banner-images")
    public ResponseEntity<?> uploadBannerImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, BANNER_UPLOAD_DIR, "banner");
    }

    @PostMapping("/post-images")
    public ResponseEntity<?> uploadPostImages(@RequestParam("files") MultipartFile[] files) {
        return uploadImages(files, POST_UPLOAD_DIR, "post");
    }

    private ResponseEntity<?> uploadImages(MultipartFile[] files, String uploadDir, String prefix) {
        try {
            List<String> fileNames = new ArrayList<>();

            // Tạo thư mục nếu chưa tồn tại
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }

                // Validate file type
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body("File phải là ảnh (PNG, JPG, JPEG)");
                }

                // Validate file size (max 5MB)
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("File không được vượt quá 5MB");
                }

                // Generate unique filename
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFilename = prefix + "-" + System.currentTimeMillis() + "-" +
                        UUID.randomUUID().toString().substring(0, 8) + extension;

                // Save file
                Path filePath = Paths.get(uploadDir + uniqueFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                fileNames.add(uniqueFilename);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileNames", fileNames);
            response.put("message", "Upload thành công " + fileNames.size() + " file");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi upload file: " + e.getMessage());
        }
    }

    @DeleteMapping("/product-images/{filename}")
    public ResponseEntity<?> deleteProductImage(@PathVariable String filename) {
        return deleteImage(filename, PRODUCT_UPLOAD_DIR);
    }

    @DeleteMapping("/banner-images/{filename}")
    public ResponseEntity<?> deleteBannerImage(@PathVariable String filename) {
        return deleteImage(filename, BANNER_UPLOAD_DIR);
    }

    @DeleteMapping("/post-images/{filename}")
    public ResponseEntity<?> deletePostImage(@PathVariable String filename) {
        return deleteImage(filename, POST_UPLOAD_DIR);
    }

    private ResponseEntity<?> deleteImage(String filename, String uploadDir) {
        try {
            Path filePath = Paths.get(uploadDir + filename);
            Files.deleteIfExists(filePath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa file thành công");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi xóa file: " + e.getMessage());
        }
    }
}
