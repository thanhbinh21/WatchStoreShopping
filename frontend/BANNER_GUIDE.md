# Hướng dẫn sử dụng hệ thống Banner nâng cao

## Tổng quan

Hệ thống banner đã được nâng cấp với các tính năng:
- ✅ Liên kết thông minh (Product, Category, Promotion, Brand, Custom)
- ✅ Vị trí hiển thị (Homepage Slider, Homepage Banner, Sidebar, Footer, Product Page)
- ✅ Target thiết bị (All, Desktop, Mobile)
- ✅ Lịch trình hiển thị (Start Date, End Date)
- ✅ Tracking clicks

## Các vị trí banner

### 1. HOMEPAGE_SLIDER
- **Mô tả**: Slider chính trang chủ (tự động chuyển)
- **Component**: `<BannerSlider />`
- **Vị trí**: Đầu trang Home
- **Kích thước đề xuất**: 1920x600px

### 2. HOMEPAGE_BANNER
- **Mô tả**: Banner tĩnh trang chủ (grid layout)
- **Component**: `<BannerDisplay position="HOMEPAGE_BANNER" />`
- **Vị trí**: Giữa Hero và Sale Banner
- **Kích thước đề xuất**: 800x400px

### 3. SIDEBAR
- **Mô tả**: Banner sidebar (vertical stack)
- **Component**: `<BannerDisplay position="SIDEBAR" />`
- **Vị trí**: Bên cạnh product list (chưa implement)
- **Kích thước đề xuất**: 300x600px

### 4. FOOTER
- **Mô tả**: Banner footer (horizontal)
- **Component**: `<BannerDisplay position="FOOTER" />`
- **Vị trí**: Đầu footer
- **Kích thước đề xuất**: 400x200px

### 5. PRODUCT_PAGE
- **Mô tả**: Banner trang chi tiết sản phẩm
- **Component**: `<BannerDisplay position="PRODUCT_PAGE" />`
- **Vị trí**: Trong product detail (chưa implement)
- **Kích thước đề xuất**: 800x300px

## Sử dụng Banner Display

### Import component:
```jsx
import BannerDisplay from "@/components/BannerDisplay";
```

### Sử dụng:
```jsx
<BannerDisplay position="HOMEPAGE_BANNER" className="my-4" />
```

## Logic lọc banner

Banner sẽ được hiển thị khi:
1. ✅ `active = true`
2. ✅ `position` khớp với vị trí hiển thị
3. ✅ `targetDevice` khớp với thiết bị hiện tại (responsive)
4. ✅ Ngày hiện tại nằm trong khoảng `startDate` - `endDate` (nếu có)

## Tracking clicks

Khi user click vào banner có link, hệ thống tự động:
- Tăng `clickCount` trong database
- Không block navigation
- Chạy async để không ảnh hưởng UX

## API Endpoints

### Public APIs:
- `GET /api/banners` - Lấy active banners
- `POST /api/banners/{id}/click` - Tăng click count

### Admin APIs (require ADMIN role):
- `GET /api/banners/all` - Lấy tất cả banners
- `GET /api/banners/{id}` - Chi tiết banner
- `POST /api/banners` - Tạo banner mới
- `PUT /api/banners/{id}` - Cập nhật banner
- `DELETE /api/banners/{id}` - Xóa banner

## Database Migration

Chạy script SQL để thêm các cột mới:

```bash
mysql -u root -p watch_store < backend/script/migration_banner_enhancements.sql
```

## Ví dụ sử dụng

### Tạo banner cho slider homepage:
```javascript
{
  title: "Đồng hồ mùa hè 2025",
  linkType: "CATEGORY",
  linkId: 5, // ID danh mục
  position: "HOMEPAGE_SLIDER",
  targetDevice: "ALL",
  startDate: "2025-06-01T00:00:00",
  endDate: "2025-08-31T23:59:59",
  active: true
}
```

### Tạo banner chỉ hiển thị trên mobile:
```javascript
{
  title: "Sale Mobile App",
  linkType: "CUSTOM",
  linkUrl: "/download-app",
  position: "HOMEPAGE_BANNER",
  targetDevice: "MOBILE",
  active: true
}
```

## Best Practices

1. **Kích thước ảnh**: Tối ưu ảnh trước khi upload (webp, 80% quality)
2. **Alt text**: Luôn điền `title` cho SEO
3. **Testing**: Test trên cả Desktop và Mobile
4. **Scheduling**: Đặt lịch cho campaign có thời hạn
5. **Analytics**: Theo dõi `clickCount` để đánh giá hiệu quả

## Troubleshooting

### Banner không hiển thị?
- Kiểm tra `active = true`
- Kiểm tra `position` đúng
- Kiểm tra `startDate/endDate`
- Kiểm tra `targetDevice` phù hợp
- Check browser console cho errors

### Click không được count?
- Kiểm tra network tab: POST `/api/banners/{id}/click`
- Kiểm tra backend logs
- Verify banner có `linkUrl`
