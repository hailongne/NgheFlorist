# TÀI LIỆU TOÀN DIỆN HỆ THỐNG NGHỆ FLORIST
*(Premium Flower Digital Showroom, Lead Conversion & Production Deployment Manual)*

> **Phiên bản**: 2.0 (Production Live)  
> **Cập nhật lần cuối**: 11/09/2026  
> **Kho lưu trữ GitHub**: [https://github.com/hailongne/NgheFlorist.git](https://github.com/hailongne/NgheFlorist.git) (Nhánh `main`)  
> **Địa chỉ IP Production**: [http://180.93.136.241](http://180.93.136.241)  
> **Tên miền chính thức**: `ngheflorist.com` (Đang cấu hình bản ghi DNS)  
> **Triết lý cốt lõi**: *"Show first, sell later."* — Tối giản, thẩm mỹ cao, tập trung trải nghiệm hình ảnh hoa tươi nghệ thuật và chuyển đổi khách hàng mượt mà qua Zalo & Hotline.

---

## MỤC LỤC
1. [Tổng Quan Hệ Thống & Triết Lý Sản Phẩm](#1-tổng-quan-hệ-thống--triết-lý-sản-phẩm)
2. [Chi Tiết Tính Năng Cửa Hàng (Storefront)](#2-chi-tiết-tính-năng-cửa-hàng-storefront)
3. [Hệ Thống Chuyển Đổi & Tư Vấn Zalo 1-Chạm](#3-hệ-thống-chuyển-đổi--tư-vấn-zalo-1-chạm)
4. [Chi Tiết Tính Năng Quản Trị (Admin CMS)](#4-chi-tiết-tính-năng-quản-trị-admin-cms)
5. [Kiến Trúc & Chế Độ Bảo Mật Toàn Diện (Security Architecture)](#5-kiến-trúc--chế-độ-bảo-mật-toàn-diện-security-architecture)
6. [Quy Chuẩn UI/UX Đa Nền Tảng (Mobile, Tablet, Desktop)](#6-quy-chuẩn-uiux-đa-nền-tảng-mobile-tablet-desktop)
7. [Báo Cáo Tiến Độ & Hạ Tầng Máy Chủ Thực Tế (Deployment Status)](#7-báo-cáo-tiến-độ--hạ-tầng-máy-chủ-thực-tế-deployment-status)
8. [Quy Trình Vận Hành & Cập Nhật Mã Nguồn (DevOps & Maintenance)](#8-quy-trình-vận-hành--cập-nhật-mã-nguồn-devops--maintenance)

---

## 1. TỔNG QUAN HỆ THỐNG & TRIẾT LÝ SẢN PHẨM

### 1.1. Bản Chất Định Vị
* **Nghệ Florist** là **Digital Showroom hoa tươi nghệ thuật & trái cây nhập khẩu**, không phải sàn thương mại điện tử kiểu Shopee/Lazada.
* **Loại bỏ sự phức tạp**: Không có giỏ hàng cồng kềnh, không cổng thanh toán phức tạp, không biến thể rối rắm hay đánh giá sao ảo.
* **Tập trung cốt lõi**:
  * Trưng bày các tác phẩm hoa tươi nghệ thuật với hình ảnh chất lượng cao.
  * Phục vụ trải nghiệm "lướt tạp chí hoa" mượt mà trên Mobile & Tablet.
  * Chuyển đổi khách hàng thành đơn hàng thông qua kết nối trực tiếp với Florist qua Zalo Hotline 1 & 2.

### 1.2. Kiến Trúc Kỹ Thuật Tổng Thể (Monorepo)
```
                                 [ Khách Hàng / Quản Trị ]
                                             │
                                             ▼ (Port 80 / 443)
                                ┌─────────────────────────┐
                                │     NGINX Web Server    │
                                └────────────┬────────────┘
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            [ Frontend React SPA ]                        [ Backend API Express ]
             Thư mục: frontend/dist                        Port nội bộ: 4000 (PM2)
            (Vite, React 18, Router)                                  │
                                                                      ▼
                                                          ┌───────────────────────┐
                                                          │     MySQL Database    │
                                                          │      Port: 3306       │
                                                          │ (Database: ngheflorist)│
                                                          └───────────────────────┘
```

---

## 2. CHI TIẾT TÍNH NĂNG CỬA HÀNG (STOREFRONT)

### 2.1. Trang Chủ (Home Page — `/`)
* **Thanh Header Sticky mờ**: Logo Nghệ Florist sắc nét, menu điều hướng danh mục, nút hotline gọi nhanh và icon tìm kiếm.
* **Hero Banner Lookbook**: Banner toàn cảnh sang trọng với thông điệp *"Trao gửi yêu thương bằng những đóa hoa thật đẹp"*, kèm nút bấm kêu gọi hành động (CTA) xem bộ sưu tập hoặc cắm hoa theo yêu cầu.
* **Bộ Sưu Tập Nổi Bật**: Hiển thị danh mục lớn (Bó hoa tươi, Giỏ hoa nghệ thuật, Kệ hoa sự kiện, Lan hồ điệp tuyển chọn).
* **Mẫu Hoa Tiêu Biểu**: Lưới sản phẩm hoa bán chạy nhất, hình ảnh hiển thị tỉ lệ 4:5 rõ nét, giá tham khảo rõ ràng.
* **Khối 5 Cam Kết Dịch Vụ Vàng**:
  1. *Giao Hỏa Tốc 2H* nội thành nhanh chóng.
  2. *Cắm Hoa Theo Yêu Cầu* đúng tone màu, phong cách, ngân sách.
  3. *Gửi Ảnh Duyệt Trước*: Chụp ảnh thành phẩm tại xưởng gửi khách duyệt 100% trước khi giao.
  4. *Uy Tín & Chất Lượng*: Cam kết đổi mới nếu hoa không đạt chất lượng cam kết.
  5. *Hoa Nhập Khẩu Tuyển Chọn*: Nguồn hoa tươi mới mỗi ngày.
* **Khối Đặt Hoa Theo Mẫu Riêng (Custom Floral Design)**: Lời mời khách hàng gửi ảnh mẫu trên Pinterest/Instagram để florist thực hiện.

### 2.2. Trang Bộ Sưu Tập Sản Phẩm (`/flowers` & `/category/:slug`)
* **Lọc Theo Danh Mục 2 Tầng**: Chọn danh mục cha và các danh mục con trực quan.
* **Bộ Lọc Ngân Sách Nhanh**: Thẻ chọn nhanh dưới dạng pill tags: *Tất cả • Dưới 500k • 500k – 1tr • 1tr – 2tr • Trên 2tr*.
* **Sắp Xếp Linh Hoạt**: Theo hoa mới nhất, bán chạy nhất, giá từ thấp đến cao, giá từ cao đến thấp.
* **Thẻ Sản Phẩm Tinh Tế (Product Card)**:
  * Ảnh mẫu hoa chiếm 80% diện tích thẻ.
  * Tên sản phẩm sang trọng (Font Playfair Display).
  * Giá tham khảo dạng số formatted rõ ràng theo chuẩn tiền tệ VND.
  * Nút `[ Chọn mẫu ]` hoặc nút xem nhanh chi tiết.

### 2.3. Trang Chi Tiết Hoa (`/product/:slug`)
* **Lookbook Gallery Ảnh**: Khung ảnh phóng lớn cho phép xem chi tiết cánh hoa, màu sắc và góc chụp cắm hoa.
* **Thông Tin Mẫu & Tư Vấn**:
  * Tên mẫu hoa nghệ thuật và mã sản phẩm.
  * Mức giá tham khảo (kèm lưu ý giá hoa có thể dao động nhẹ theo mùa).
  * Mô tả cảm xúc và thành phần hoa chính.
  * Khối cam kết tặng kèm thiệp thiết kế riêng & túi hoa cao cấp.
* **Nút Sticky CTA dưới chân màn hình**: Luôn hiển thị nút `[ 💬 Tư vấn qua Zalo ]` và nút `[ Đặt làm theo mẫu này ]`.

### 2.4. Trang Cắm Hoa Theo Mẫu Riêng (`/custom-order`)
* Phù hợp cho khách hàng muốn cắm theo ngân sách, sở thích hoặc gửi mẫu hoa có sẵn trên mạng:
  * **Bước 1**: Chọn loại hoa (Bó hoa, Giỏ hoa, Hộp hoa, Kệ hoa, Bình hoa cao cấp).
  * **Bước 2**: Nhập ngân sách mong muốn và tone màu yêu thích (Pastel ngọt ngào, Đỏ lãng mạn, Trắng thanh khiết, Vàng sang trọng...).
  * **Bước 3**: Tải ảnh mẫu hoa có sẵn (Chụp từ điện thoại hoặc tải ảnh từ máy tính).
  * **Bước 4**: Nhập thông tin nhận hoa, thời gian giao hàng, lời chúc in trên thiệp.
* **Gửi Thành Công**: Hệ thống tự động cấp mã định danh duy nhất (VD: `NF20260911001`), hiển thị bản tóm tắt và kích hoạt nút chuyển thẳng sang Zalo.

### 2.5. Các Trang Thương Hiệu & Chính Sách
* **Về Chúng Tôi (`/about`)**: Giới thiệu triết lý cắm hoa, tay nghề Florist và nguồn gốc hoa nhập khẩu từ Đà Lạt, Hà Lan, Ecuador.
* **Chính Sách & Cam Kết (`/policy`)**: Quy định giao hàng hỏa tốc, chính sách chụp ảnh duyệt trước, xuất hóa đơn VAT cho doanh nghiệp và chính sách hoàn tiền 100%.

---

## 3. HỆ THỐNG CHUYỂN ĐỔI & TƯ VẤN ZALO 1-CHẠM

Nghệ Florist loại bỏ toàn bộ rào cản đặt hàng bằng giải pháp **Zalo Realtime Synchronization**:

```
Khách Hàng Thích Mẫu Hoa 
          │
          ▼
Bấm nút "Tư Vấn Zalo 1" hoặc "Zalo 2"
          │
          ├──> Hệ thống tự động định dạng tin nhắn mẫu:
          │    - Tên mẫu hoa + Mã yêu cầu (nếu có)
          │    - Link xem mẫu trực tiếp
          │    - Mức ngân sách mong muốn
          │
          ▼
Mở ứng dụng Zalo trên điện thoại/máy tính
          │
          ▼
Florist tiếp nhận & chốt đơn lập tức trong 3 phút!
```

### Các điểm tương tác Zalo trên hệ thống:
1. **Thanh Header**: Nút hotline số 1 & 2 trực quan, chạm là gọi hoặc chuyển Zalo.
2. **Widget Tròn Góc Màn Hình (Quick Contact Widget)**: Nổi bật ở góc phải màn hình, có sẵn 2 nút Zalo ứng với 2 số hotline trực tiếp.
3. **Modal Chi Tiết Mẫu Hoa**: Nút `💬 Tư Vấn Zalo Ngay Với Mẫu Này` tự động điền sẵn tên hoa khi chat.
4. **Trang Giới Thiệu & Chân Trang (Footer)**: Đồng bộ tự động 2 số hotline từ cài đặt Admin CMS, không bao giờ bị lệch số.

---

## 4. CHI TIẾT TÍNH NĂNG QUẢN TRỊ (ADMIN CMS)

Đường dẫn quản trị: `http://180.93.136.241/admin`  
Tài khoản mặc định: `admin@ngheflorist.vn` *(Mật khẩu: `Admin@NgheFlorist2026!`)*

### 4.1. Quản Lý Yêu Cầu Khách Hàng (Customer Leads — `/admin/requests`)
* Hiển thị danh sách khách hàng gửi yêu cầu thiết kế riêng hoặc chọn mẫu.
* Thiết kế dạng **Thẻ Lead thông minh (Lead Cards)** trên mobile và bảng dữ liệu chi tiết trên desktop:
  * Mã yêu cầu (VD: `NF20260911001`).
  * Tên khách hàng & Số điện thoại / Zalo.
  * Mẫu hoa yêu cầu hoặc hình ảnh mẫu khách tải lên (nhấn vào phóng to xem chi tiết).
  * Ngân sách, thời gian cần giao hoa và nội dung thiệp chúc.
  * Thao tác nhanh: Nút **[Gọi ngay]** và **[Nhắn Zalo]** trực tiếp cho khách.
  * Cập nhật tiến độ xử lý: *Mới ➜ Đã liên hệ ➜ Đang cắm hoa ➜ Đã giao / Hoàn thành*.

### 4.2. Quản Lý Sản Phẩm Mẫu Hoa (`/admin/products`)
* **Duyệt theo Folder Explorer**: Phân cấp theo Thư mục Loại hoa ➜ Khoảng giá ➜ Danh sách mẫu hoa.
* **Thao tác Thêm / Sửa / Xóa Sản Phẩm**:
  * Tên hoa, đường dẫn URL (slug), mô tả ngắn, giá tham khảo.
  * Chọn danh mục cha và danh mục con.
  * Công tắc bật/tắt hiển thị sản phẩm ngoài website.
  * Tải nhiều hình ảnh hoa cùng lúc, chọn ảnh đại diện chính (Featured Image).

### 4.3. Quản Lý Danh Mục (`/admin/categories`)
* Quản lý cây danh mục 2 tầng (Ví dụ: Bó hoa ➜ Bó hoa hồng, Bó hoa baby, Bó hoa tulip).
* Sắp xếp thứ tự hiển thị bằng trường `sort_order`.
* Kiểm đếm số lượng sản phẩm hoa trực thuộc từng danh mục.
* Cơ chế khóa an toàn: Cảnh báo không cho xóa nếu danh mục đang chứa sản phẩm.

### 4.4. Quản Lý Banner Trang Chủ & Trang Nội Dung (`/admin/banners`, `/admin/pages`)
* Tùy chỉnh danh sách ảnh banner trượt trên đầu trang chủ.
* Chỉnh sửa tiêu đề, phụ đề, link liên kết khi khách bấm vào banner.
* Soạn thảo và cập nhật nội dung trang Giới thiệu (`/about`) và Chính sách (`/policy`).

### 4.5. Cấu Hình Website & Kênh Chuyển Đổi (`/admin/settings`)
* Đồng bộ thời gian thực (Real-time):
  * Tên thương hiệu, thông báo đầu trang (Announcement Bar).
  * Số Hotline 1, Hotline 2, Link Zalo 1, Link Zalo 2.
  * Địa chỉ tiệm hoa, email tiếp nhận thông tin, khung giờ mở cửa.
  * Mẫu tin nhắn tự động khi khách gửi yêu cầu cắm hoa.

### 4.6. Thư Viện Đa Phương Tiện & Nhật Ký Hệ Thống (`/admin/media`, `/admin/audit-logs`)
* **Media Library**: Xem toàn bộ hình ảnh hoa đã tải lên, sao chép link ảnh nhanh.
* **Audit Logs**: Ghi vết mọi hành vi thêm, sửa, xóa sản phẩm, danh mục hay thay đổi cài đặt của quản trị viên (ai làm, vào lúc nào, địa chỉ IP nào).

---

## 5. KIẾN TRÚC & CHẾ ĐỘ BẢO MẬT TOÀN DIỆN (SECURITY ARCHITECTURE)

Hệ thống Nghé Florist được thiết lập chế độ bảo mật cấp doanh nghiệp theo chuẩn **OWASP Top 10**:

```
                    Internet Request
                          │
                          ▼
            [ 1. Nginx Web Server Hardening ]
            - Giới hạn body size: 25M
            - Ẩn Nginx Version & Server Info
            - Chặn các truy cập trái phép
                          │
                          ▼
            [ 2. HTTP Security Headers (Helmet) ]
            - Content-Security-Policy (CSP)
            - Strict-Transport-Security (HSTS 1 năm)
            - X-Content-Type-Options: nosniff
            - X-Frame-Options: DENY (Chống Clickjacking)
                          │
                          ▼
            [ 3. Anti-DDoS & Rate Limiting ]
            - Giới hạn tần suất request (Brute-force protection)
            - Giới hạn request upload ảnh
                          │
                          ▼
            [ 4. JWT & Role-Based Access Control (RBAC) ]
            - Bearer Token xác thực quản trị
            - Mã hóa mật khẩu bcrypt (10 rounds)
                          │
                          ▼
            [ 5. SQL Injection Prevention ]
            - mysql2 Prepared Statements 100%
            - Named parameters, không ghép chuỗi thô
                          │
                          ▼
            [ 6. File Upload Sanitization ]
            - Kiểm tra MIME Type thực tế
            - Đổi tên file ngẫu nhiên chống overwrite
            - Tách biệt thư mục uploads tĩnh
```

### 5.1. Bảng Chi Tiết Các Lớp Bảo Mật

| Lớp bảo mật | Công nghệ / Biện pháp | Mục đích ngăn chặn |
| :--- | :--- | :--- |
| **Bảo mật Header** | `helmet` middleware trong Node.js | Ngăn chặn Cross-Site Scripting (XSS), Clickjacking, MIME Sniffing |
| **Chính sách CORS** | Whitelist tên miền cụ thể qua biến môi trường `ALLOWED_ORIGINS` | Chặn các website lạ gọi trộm API từ trình duyệt |
| **Chống Brute-force** | `express-rate-limit` | Chặn tấn công dò mật khẩu Admin và spam form đặt hoa |
| **Xác thực Admin** | `jsonwebtoken` (JWT) + `bcrypt` hash (10 salt rounds) | Bảo vệ tài khoản quản trị, không lưu mật khẩu dạng văn bản thô |
| **Phân quyền chặt chẽ** | RBAC (`roles`, `permissions`, `user_roles`) | Ngăn chặn leo thang đặc quyền (Privilege Escalation) |
| **Chống SQL Injection** | Sử dụng hoàn toàn MySQL Prepared Statements (`pool.query(sql, [params])`) | Triệt tiêu 100% nguy cơ tấn công SQL Injection |
| **Bảo vệ File Upload** | `multer` lọc file mime (`jpg`, `jpeg`, `png`, `webp`), giới hạn 10MB | Chặn upload file `.php`, `.sh`, `.exe` chứa mã độc |
| **Tường lửa Máy Chủ** | Ubuntu `ufw` (Uncomplicated Firewall) | Chỉ mở cổng `22` (SSH), `80` (HTTP), `443` (HTTPS). Cổng Database 3306 hoàn toàn đóng với bên ngoài |
| **Bảo vệ Hệ Thống** | `app.disable('x-powered-by')` | Ẩn danh hoàn toàn thông tin server Node.js trước máy quét hacker |

---

## 6. QUY CHUẨN UI/UX ĐA NỀN TẢNG (MOBILE, TABLET, DESKTOP)

| Tiêu chí | Mobile (Dưới 768px) | Tablet (768px - 1024px) | Desktop (1024px trở lên) |
| :--- | :--- | :--- | :--- |
| **Thanh điều hướng** | Header nhỏ 64px, menu trượt Drawer | Header mở rộng, thanh tìm kiếm nhanh | Menu ngang đầy đủ, dropdown danh mục |
| **Lưới sản phẩm hoa** | **2 cột cân đối** (khoảng cách 12px) | **3 cột thoáng đãng** | **4 cột showroom** sang trọng |
| **Tỷ lệ ảnh hoa** | Cố định chuẩn **4:5** (chống vỡ layout) | Cố định chuẩn **4:5** | Cố định chuẩn **4:5** |
| **Bộ lọc ngân sách** | Dạng thẻ trượt ngang ngón tay cái vuốt nhẹ | Thanh pill badges nằm ngang | Bộ lọc danh mục & giá bên trái / ngang |
| **Xem chi tiết hoa** | Gallery vuốt ngang + Nút dính đáy Sticky | Bố cục 2 cột đối xứng | Bố cục 2 cột gallery lớn bên trái |
| **Form đặt cắm hoa** | Wizard từng bước dễ bấm, chọn ảnh camera | Chia khối rõ ràng, kéo thả ảnh | Form rộng rãi kèm khu vực preview ảnh |
| **Khu vực Admin** | Giao diện Lead Cards 1-chạm gọi/Zalo | Bố cục split view, bảng biểu co giãn | Dashboard điều khiển đầy đủ công cụ |

---

## 7. BÁO CÁO TIẾN ĐỘ & HẠ TẦNG MÁY CHỦ THỰC TẾ (DEPLOYMENT STATUS)

### 7.1. Trạng Thái Triển Khai Hiện Tại: ✅ HOÀN TẤT 100% (LIVE ONLINE)
Toàn bộ mã nguồn đã được biên dịch và chạy thành công trên máy chủ sản xuất vào ngày **11/09/2026**.

```
[✓] Cài đặt hệ điều hành Ubuntu 22.04 LTS & cập nhật bảo mật
[✓] Cài đặt Node.js v20.20.2 & PM2 Process Manager
[✓] Cài đặt Nginx 1.18.0 & Cấu hình Reverse Proxy SPA
[✓] Cài đặt MySQL 8.0.46 & Thiết lập Database ngheflorist
[✓] Nạp toàn bộ dữ liệu cấu trúc bảng và dữ liệu hoa mẫu
[✓] Cấu hình file môi trường .env Production an toàn
[✓] Build mã nguồn Frontend React + Vite (HTML/CSS/JS nén tối ưu)
[✓] Build mã nguồn Backend Express TypeScript sang JavaScript
[✓] Khởi chạy dịch vụ nền PM2 ngheflorist-backend tự động khởi động cùng server
[✓] Kích hoạt tường lửa UFW (Cổng 22, 80, 443)
[✓] Kiểm tra kết nối API Storefront & Admin: HTTP 200 OK
```

### 7.2. Thông Tin Chi Tiết Hạ Tầng

* **Đơn Vị Cung Cấp**: TinoHost (Datacenter Việt Nam - Tốc độ cao).
* **Loại Máy Chủ**: Cloud VPS NVMe Cao Cấp.
* **Cấu Hình Phần Cứng**:
  * **CPU**: 2 vCPUs.
  * **RAM**: 2 GB RAM.
  * **Ổ Cứng**: 30 GB NVMe Storage (Tốc độ đọc/ghi dữ liệu siêu nhanh).
  * **Hệ Điều Hành**: Ubuntu 22.04.5 LTS (Jammy Jellyfish x86_64).
* **Địa Chỉ IP Trực Tiếp**: `180.93.136.241`
  * Link Storefront: [http://180.93.136.241](http://180.93.136.241)
  * Link Admin CMS: [http://180.93.136.241/admin](http://180.93.136.241/admin)
* **Tên Miền Đăng Ký**: `ngheflorist.com` (Đang chờ khách trỏ bản ghi DNS A).
* **Cổng Dịch Vụ Trên Server**:
  * Cổng 80/443 (Nginx) $\rightarrow$ Phục vụ web ngoài Internet.
  * Cổng 4000 (Node.js API) $\rightarrow$ Chỉ lắng nghe cục bộ `127.0.0.1`.
  * Cổng 3306 (MySQL Server) $\rightarrow$ Chỉ lắng nghe cục bộ `127.0.0.1`.

---

## 8. QUY TRÌNH VẬN HÀNH & CẬP NHẬT MÃ NGUỒN (DEVOPS & MAINTENANCE)

### 8.1. Hướng Dẫn Kích Hoạt Tên Miền `ngheflorist.com` (Bước Cuối)
Để tên miền `ngheflorist.com` dẫn thẳng về website thay vì phải gõ IP:
1. Đăng nhập trang quản lý TinoHost ➜ Mục **Tên miền** ➜ Chọn **`ngheflorist.com`** ➜ Quản lý bản ghi DNS.
2. Thêm 2 bản ghi:
   * **Bản ghi 1**: Loại `A` | Tên `@` | Trỏ đến `180.93.136.241`
   * **Bản ghi 2**: Loại `A` | Tên `www` | Trỏ đến `180.93.136.241`
3. Kích hoạt chứng chỉ bảo mật SSL (Khóa xanh HTTPS) miễn phí qua lệnh trên server:
   ```bash
   sudo certbot --nginx -d ngheflorist.com -d www.ngheflorist.com --non-interactive --agree-tos -m contact@ngheflorist.vn
   ```

### 8.2. Quy Trình Cập Nhật Code Mới Sau Này (Khi có thay đổi tính năng)
Khi bạn sửa code trên máy tính và muốn cập nhật lên website đang chạy:
1. Trên máy bạn: Đẩy code mới lên Git:
   ```bash
   git add .
   git commit -m "Cập nhật tính năng mới"
   git push origin main
   ```
2. Trên máy chủ VPS: Kéo code về và làm mới dịch vụ:
   ```bash
   cd /var/www/ngheflorist
   git pull origin main

   # Nếu có sửa Backend:
   cd /var/www/ngheflorist/backend
   npm install && npm run build
   pm2 restart ngheflorist-backend

   # Nếu có sửa Frontend:
   cd /var/www/ngheflorist/frontend
   npm install && npm run build
   ```

### 8.3. Các Lệnh Tiện Ích Kiểm Tra Trạng Thái Trên Máy Chủ
* Xem trạng thái Backend: `pm2 status`
* Xem nhật ký hoạt động / lỗi: `pm2 logs ngheflorist-backend`
* Khởi động lại Web server: `sudo systemctl restart nginx`
* Kiểm tra dung lượng ổ đĩa: `df -h`
* Kiểm tra mức RAM đang sử dụng: `free -m`

---
*Tài liệu bàn giao kỹ thuật hoàn tất — Dự án Nghé Florist sẵn sàng kinh doanh và đón tiếp khách hàng!*
