# TÀI LIỆU TOÀN DIỆN HỆ THỐNG NGHỆ FLORIST
*(Premium Flower Digital Showroom, Lead Conversion & Production Deployment Manual)*

> **Phiên bản**: 2.5 (Production Live & Brand Upgraded)  
> **Cập nhật lần cuối**: 17/09/2026  
> **Kho lưu trữ GitHub**: [https://github.com/hailongne/NgheFlorist.git](https://github.com/hailongne/NgheFlorist.git) (Nhánh `main`)  
> **Tên miền chính thức**: [https://ngheflorist.com](https://ngheflorist.com)  
> **Địa chỉ IP Production**: `180.93.136.241`  
> **Slogan / Tagline**: *"Nghệ Florist — Tiệm hoa & quả nhập khẩu"*  
> **Triết lý cốt lõi**: *"Show first, sell later."* — Tối giản, thẩm mỹ cao, trải nghiệm lookbook hoa tươi nghệ thuật chuẩn mực và chuyển đổi khách hàng mượt mà qua Zalo, Hotline & Widget tư vấn đa kênh.

---

## MỤC LỤC
1. [Tổng Quan Hệ Thống & Triết Lý Sản Phẩm](#1-tổng-quan-hệ-thống--triết-lý-sản-phẩm)
2. [Chi Tiết Tính Năng Cửa Hàng (Storefront)](#2-chi-tiết-tính-năng-cửa-hàng-storefront)
3. [Hệ Thống Chuyển Đổi & Tư Vấn Đa Kênh (Lead Conversion System)](#3-hệ-thống-chuyển-đổi--tư-vấn-đa-kênh-lead-conversion-system)
4. [Chi Tiết Tính Năng Quản Trị (Admin CMS)](#4-chi-tiết-tính-năng-quản-trị-admin-cms)
5. [Kiến Trúc & Chế Độ Bảo Mật Toàn Diện (Security Architecture)](#5-kiến-trúc--chế-độ-bảo-mật-toàn-diện-security-architecture)
6. [Quy Chuẩn UI/UX Đa Nền Tảng (Mobile, Tablet, Desktop)](#6-quy-chuẩn-uiux-đa-nền-tảng-mobile-tablet-desktop)
7. [Báo Cáo Tiến Độ & Hạ Tầng Máy Chủ Thực Tế (Deployment Status)](#7-báo-cáo-tiến-độ--hạ-tầng-máy-chủ-thực-tế-deployment-status)
8. [Quy Trình Vận Hành & Cập Nhật Mã Nguồn (DevOps & Maintenance)](#8-quy-trình-vận-hành--cập-nhật-mã-nguồn-devops--maintenance)

---

## 1. TỔNG QUAN HỆ THỐNG & TRIẾT LÝ SẢN PHẨM

### 1.1. Bản Chất Định Vị & Nhận Diện Thương Hiệu
* **Nghệ Florist** là **Digital Showroom hoa tươi nghệ thuật & trái cây nhập khẩu**, tôn vinh từng tác phẩm cắm hoa thiết kế tinh tế, không phải sàn thương mại điện tử đại trà.
* **Bộ nhận diện chuẩn hóa (Brand Identity)**:
  * **Logo thương hiệu**: Sử dụng sắc xanh dương thương hiệu độc quyền `#1FAAE1` (`logoNgheFlorist-brand-blue.png?v=2`), loại bỏ hoàn toàn các biến thể màu đen/màu cũ trên toàn bộ Header, Footer và trang quản trị.
  * **Tagline chính thức**: *"Nghệ Florist - Tiệm hoa & quả nhập khẩu"*.
  * **Phong cách thẩm mỹ**: Tone màu Pastel kết hợp xanh Teal & Deep Slate sang trọng, hiện đại, mang hơi thở lookbook hoa tạp chí cao cấp.
* **Tập trung cốt lõi**:
  * Trưng bày các bộ sưu tập hoa tươi nghệ thuật với hình ảnh chất lượng cao, tỉ lệ cân đối.
  * Trải nghiệm mượt mà, tối ưu sâu cho thiết bị di động (Mobile & Tablet).
  * Chuyển đổi khách hàng thành đơn hàng nhanh chóng qua widget nút tư vấn nổi và hotline trực tiếp.

### 1.2. Kiến Trúc Kỹ Thuật Tổng Thể (Monorepo)
```
                                 [ Khách Hàng / Quản Trị ]
                                             │
                                             ▼ (Port 80 / 443 HTTPS - SSL)
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
                                                          │(Database: ngheflorist)│
                                                          └───────────────────────┘
```

---

## 2. CHI TIẾT TÍNH NĂNG CỬA HÀNG (STOREFRONT)

### 2.1. Trang Chủ (Home Page — `/`)
* **Thanh Header Sticky mờ**: Logo Nghệ Florist xanh thương hiệu, menu điều hướng danh mục hoa, nút tư vấn gọi nhanh, tìm kiếm sản phẩm thông minh và tài khoản khách hàng.
* **Hero Banner Lookbook**: Banner toàn cảnh sang trọng với thông điệp *"Trao gửi yêu thương bằng những đóa hoa thật đẹp"*, kèm nút kêu gọi hành động (CTA) xem bộ sưu tập hoặc cắm hoa theo yêu cầu.
* **Bộ Sưu Tập Nổi Bật**: Hiển thị các nhóm sản phẩm chủ lực (Bó hoa tươi, Giỏ hoa nghệ thuật, Kệ hoa khai trương, Lan hồ điệp tuyển chọn).
* **Mẫu Hoa Tiêu Biểu**: Lưới sản phẩm hoa tuyển chọn, tỉ lệ chuẩn ảnh hoa 1:1 và 4:5 rõ nét, giá tham khảo minh bạch.
* **Banners Quảng Cáo Chiến Dịch (Campaign Banners)**:
  * Hiển thị tỉ lệ chuẩn ngang 16:9 sắc nét (trên mobile 16:11 chống tràn viền).
  * Hiệu ứng chuyển động mượt mà, hỗ trợ gắn link chiến dịch trực tiếp đến từng nhóm hoa sự kiện.
* **Khối 5 Cam Kết Dịch Vụ Vàng**:
  1. *Giao Hỏa Tốc 2H* nội thành nhanh chóng.
  2. *Cắm Hoa Theo Yêu Cầu* đúng tone màu, phong cách, ngân sách.
  3. *Gửi Ảnh Duyệt Trước*: Chụp ảnh thành phẩm tại xưởng gửi khách duyệt 100% trước khi giao.
  4. *Uy Tín & Chất Lượng*: Cam kết đổi mới nếu hoa không đạt độ tươi và chuẩn mẫu.
  5. *Hoa Nhập Khẩu Tuyển Chọn*: Nguồn hoa tươi mới mỗi ngày từ Đà Lạt, Hà Lan, Ecuador.
* **Khối Đặt Hoa Theo Mẫu Riêng (Custom Floral Design)**: Hỗ trợ khách hàng gửi ảnh mẫu trên Pinterest/Instagram để florist thực hiện theo yêu cầu.

### 2.2. Trang Bộ Sưu Tập Sản Phẩm (`/flowers` & `/category/:slug`)
* **Bộ Lọc Thông Minh Đa Tầng**:
  * **Trên Mobile**: Tối ưu nút bấm `"Lọc"` nhỏ gọn, Drawer trượt mượt mà, phân loại 1 hàng 2 cột cân đối, không bị xô lệch layout.
  * **Thẻ Lọc Ngân Sách Nhanh**: Thanh vuốt ngang các mức ngân sách: *Tất cả • Dưới 500k • 500k – 1tr • 1tr – 2tr • Trên 2tr*.
  * **Sắp Xếp Linh Hoạt**: Theo mới nhất, bán chạy nhất, giá từ thấp đến cao, giá từ cao đến thấp.
* **Thẻ Sản Phẩm Tinh Tế (Product Card)**:
  * Ảnh mẫu hoa rõ nét với lớp xử lý dự phòng `ImageWithFallback` thông minh (nếu thiếu ảnh sẽ hiện logo bo tròn có đệm, không bị kéo vỡ).
  * Nhãn phân loại và giá formatted theo chuẩn tiền tệ VND.
  * Nút `[ Chọn mẫu ]` mở ngay modal tư vấn chuyên nghiệp.

### 2.3. Modal Yêu Cầu Tư Vấn & Chọn Mẫu Hoa (`CustomerRequestModal.tsx`)
* **Thiết kế tối ưu sâu cho Mobile**:
  * Tabs chọn dạng tư vấn: *Chọn mẫu có sẵn* hoặc *Thiết kế hoa theo yêu cầu*.
  * Khung xem trước mẫu hoa nhỏ gọn (ảnh 44x44px), hiển thị rõ ràng giá tham khảo.
  * Nhãn trường (Labels) và ô nhập liệu (Inputs) có kích thước chuẩn `0.82rem – 0.85rem`, chiều cao 36–38px, khoảng cách giữa các trường được tinh giản giúp form thanh thoát, thoáng đãng, không bị dài dòng.
  * Thẻ tag chọn nhanh kiểu dáng hoa (Bó hoa, Giỏ hoa, Kệ hoa, Hoa cưới, Lan hồ điệp...) và ngân sách tham khảo hiển thị vừa vặn, không tràn lề.
  * Hỗ trợ tải tối đa 3 ảnh mẫu hoa yêu thích kèm ô ghi chú cho Florist.
  * Nút bấm gửi yêu cầu nổi bật, tự động lưu thông tin vào hệ thống quản trị và kết nối Zalo.

### 2.4. Trang Chi Tiết Sản Phẩm & Hệ Thống Nút Tư Vấn Nhanh 50/50 (`/product/:slug`)
* **Thư viện ảnh sản phẩm (Lookbook Gallery)**:
  * Ảnh chính tỉ lệ 3:4 chuẩn Studio cao cấp, hiển thị sắc nét kèm nút lưu vào danh sách yêu thích (Wishlist).
  * Hàng thumbnails thu nhỏ bên dưới chuyển ảnh tức thì khi click.
  * Trên Mobile: Lookbook cuộn ngang mượt mà.
* **Thay thế toàn bộ nút CTA cũ bằng Nút Tư Vấn Nhanh (Contact Widgets)**:
  * Tự động đồng bộ các kênh tư vấn từ trang quản trị `Quản Lý Nút Tư Vấn Nhanh` (Zalo 1, Zalo 2, FanPage Messenger, Hotline Gọi Nhanh).
  * Thiết kế thẻ nút nổi bật, trực quan, có icon nhận diện thương hiệu và mô tả dịch vụ.
* **Popup Tư Vấn & Đặt Hàng 50/50 Thông Minh**:
  * **Cột Trái (50%) — Form Đặt Hoa Chuẩn Thực Tế**:
    * Tự động lấy dữ liệu từ tài khoản khách hàng nếu đã đăng nhập (Họ tên, SĐT, Địa chỉ).
    * Các trường: Số lượng kèm stepper `[-] [+]`, Ngày & giờ nhận hoa, SĐT người đặt, SĐT người nhận hoa, Địa chỉ giao hoa chi tiết, Nội dung in thiệp/biển chúc mừng, Ghi chú.
    * Khi bấm gửi: Tự động format tin nhắn đặt hàng chuẩn từng dòng, sao chép cả ảnh & tin nhắn vào Clipboard, lưu Lead vào hệ thống và mở ngay ứng dụng chat.
  * **Cột Phải (50%) — Bỏ Qua Form Chat Trực Tiếp Với Sale**:
    * Xem trước ảnh mẫu hoa sắc nét, tên và giá tham khảo.
    * Tự động sao chép ảnh mẫu hoa vào Clipboard.
    * 3 nút tiện ích: *Sao chép ảnh*, *Tải ảnh về máy*, *Sao chép link sản phẩm*.
    * Nút mở trực tiếp kênh tư vấn ngay không cần điền form.
* **Gợi Ý Mẫu Hoa Tương Tự Phong Cách Shopee**:
  * Đặt ở dưới cùng chi tiết sản phẩm với tiêu đề cam nổi bật *"CÓ THỂ BẠN CŨNG THÍCH"*.
  * Lưới sản phẩm responsive: **2 cột chuẩn trên Mobile**, **4 cột trên Desktop**.
  * Hiển thị 8–12 mẫu hoa cùng danh mục hoặc cùng phong cách được yêu thích nhất kèm nút xem thêm.

### 2.5. Chân Trang Chuẩn Mực & Đồng Bộ (Footer)
* **Tagline thương hiệu**: *"Nghệ Florist - Tiệm hoa & quả nhập khẩu"*.
* **Thông Tin Liên Hệ Chuẩn Hóa**:
  * 📍 **Địa chỉ**: `22 ngõ 115 Phố Núi Trúc, Ba Đình, Hà Nội` (đồng bộ tự động từ cài đặt CMS).
  * ✉️ **Email**: `ngheflorist.com@gmail.com` (gắn link `mailto:` tiện lợi).
  * 📞 **Hotline**: `0862 926 866` (gắn link `tel:` bấm gọi tức thì, đồng bộ 100% với số điện thoại đã lưu trong Cài Đặt Website).
* **Bố Cục Responsive Đa Màn Hình**:
  * **Desktop**: 4 cột cân xứng (`2.2fr 1fr 1fr 1.5fr`) gồm Brand + Liên hệ, Khám phá, Danh mục hoa, Cam kết dịch vụ.
  * **Tablet (769px – 1024px)**: Tự động chuyển đổi sang lưới 2 cột (`1.35fr 1fr`) rộng rãi, dễ đọc.
  * **Mobile (< 768px)**: Hộp thông tin liên hệ bo góc nhẹ (`.footer-mobile-contact`) hiển thị địa chỉ, email và hotline cân bằng, trang nhã.

### 2.5. Các Trang Thương Hiệu & Chính Sách
* **Về Chúng Tôi (`/about`)**: Giới thiệu không gian tiệm hoa, triết lý cắm hoa và nguồn hoa nhập khẩu.
* **Chính Sách & Cam Kết (`/policy`)**: Quy định giao hàng hỏa tốc, chụp ảnh thành phẩm duyệt trước và cam kết bảo hành.

---

## 3. HỆ THỐNG CHUYỂN ĐỔI & TƯ VẤN ĐA KÊNH (LEAD CONVERSION SYSTEM)

Hệ thống tư vấn của Nghệ Florist được thiết kế tập trung, tinh giản và chuyển đổi trực tiếp:

```
Khách Hàng Lướt Mẫu / Cần Tư Vấn
               │
               ▼
Bấm nút Widget Tư Vấn hoặc Nút Chọn Mẫu
               │
               ├──> 1. Widget Đa Kênh Nổi: Lựa chọn Zalo 1, Zalo 2, Gọi Hotline, Messenger
               └──> 2. Form Tư Vấn: Điền thông tin + gửi ảnh mẫu ➜ Tạo mã Lead tự động
               │
               ▼
Mở ứng dụng Zalo / Cuộc gọi trực tiếp với Florist
               │
               ▼
Florist tiếp nhận & chốt đơn nhanh chóng trong 3 phút!
```

### Các điểm tương tác chuyển đổi trên hệ thống:
1. **Quản Lý Nút Tư Vấn Nổi (`QuickContactWidget.tsx`)**:
   * Widget tròn góc dưới màn hình, tích hợp mở danh sách các kênh tư vấn có thể cấu hình linh hoạt từ Admin (Zalo, Hotline, Messenger, Fanpage).
2. **Thanh Header**: Nút hotline gọi nhanh và mở trực tiếp kênh Zalo.
3. **Modal Chọn Mẫu Nhanh**: Tự động đính kèm tên mẫu hoa, giá và link sản phẩm vào nội dung trao đổi.
4. **Footer Website**: Hiển thị đầy đủ số hotline và email đồng bộ từ hệ thống.

---

## 4. CHI TIẾT TÍNH NĂNG QUẢN TRỊ (ADMIN CMS)

* **Đường dẫn quản trị**: `https://ngheflorist.com/admin`
* **Tài khoản quản trị duy nhất**: `admin@ngheflorist.vn`
* **Giao diện Menu Sidebar**:
  * Cố định độ rộng chuẩn `260px` (`min-width: 260px`, `flex: 0 0 260px`, `flex-shrink: 0`), chống hiện tượng co rúm hay rớt chữ dọc trên mọi kích thước màn hình.
  * Nhóm menu chia rõ ràng: **Trung Tâm Lead & Tư Vấn**, **Bộ Sưu Tập Hoa**, **Quản Trị CMS & Giao Diện**, **Hệ Thống**.

### 4.1. Quản Lý Yêu Cầu Khách Hàng (Customer Leads — `/admin/requests`)
* Hiển thị danh sách khách hàng gửi yêu cầu thiết kế riêng hoặc chọn mẫu.
* Thẻ Lead thông minh:
  * Mã yêu cầu định danh (VD: `NF20260917001`).
  * Tên khách hàng & Số điện thoại / Zalo.
  * Mẫu hoa yêu cầu hoặc hình ảnh mẫu khách tải lên (nhấn phóng to xem chi tiết).
  * Ngân sách, thời gian nhận hoa, khu vực giao và nội dung thiệp chúc.
  * Thao tác 1-chạm: Nút **[Gọi ngay]** và **[Nhắn Zalo]** trực tiếp.
  * Cập nhật trạng thái xử lý: *Mới ➜ Đã liên hệ ➜ Đang cắm hoa ➜ Đã giao / Hoàn thành*.

### 4.2. Quản Lý Nút Tư Vấn Nổi (Contact Widgets CMS — `/admin/contact-widgets`)
* Quản lý tập trung toàn bộ các kênh liên hệ nổi ở góc màn hình:
  * Thêm/sửa kênh tư vấn: Zalo, Điện thoại (Hotline), Facebook Messenger, Fanpage.
  * Tiêu đề, phụ đề, đường dẫn liên kết (`https://zalo.me/...`, `tel:...`).
  * Sắp xếp thứ tự hiển thị bằng trường `sort_order`.
  * Công tắc bật/tắt (kích hoạt/hủy kích hoạt) từng kênh tức thì.

### 4.3. Quản Lý Sản Phẩm Mẫu Hoa (`/admin/products`)
* Duyệt theo danh mục và bộ lọc giá.
* Thao tác Thêm / Sửa / Xóa sản phẩm:
  * Tên hoa, slug, mô tả cảm xúc, giá tham khảo.
  * Gán danh mục cha / danh mục con.
  * Công tắc bật/tắt hiển thị sản phẩm ngoài website.
  * Tải ảnh sản phẩm, tự động tạo ảnh đại diện với xử lý fallback an toàn.

### 4.4. Quản Lý Danh Mục Hoa (`/admin/categories`)
* Quản lý cây danh mục 2 tầng (Bó hoa tươi, Giỏ hoa tươi, Kệ hoa khai trương, Lan hồ điệp...).
* Thiết lập thứ tự sắp xếp và đếm số lượng hoa thuộc từng danh mục.
* Cơ chế bảo vệ: Cảnh báo an toàn không cho xóa danh mục đang có sản phẩm.

### 4.5. Quản Lý Banners Quảng Cáo (Homepage Banners — `/admin/banners`)
* Quản lý các banner chiến dịch hiển thị ngoài trang chủ.
* **Cải tiến giao diện**:
  * Tỉ lệ khung ảnh chuẩn ngang 16:9 thanh thoát, hiện đại.
  * Khung thông báo placeholder trực quan **"Chưa có hình ảnh banner"** kèm nút **[+ Tải ảnh lên]** nhanh chóng khi banner chưa có ảnh, loại bỏ triệt để hiện tượng phóng to cắt cụt logo.
  * Chỉnh sửa tiêu đề, phụ đề, đường dẫn liên kết CTA và thứ tự hiển thị.

### 4.6. Cài Đặt Website & Đồng Bộ Footer (`/admin/settings`)
* **Thiết kế giao diện 2 cột cân bằng (Balanced Grid)**:
  * Đã loại bỏ phần cấu hình kênh chuyển đổi cũ (do đã chuyển sang module Quản Lý Nút Tư Vấn độc lập).
  * Đã loại bỏ trường thanh thông báo đầu trang không sử dụng để giao diện tinh giản tuyệt đối.
* **Cột trái — Thông Tin Tiệm Hoa & Liên Hệ**:
  * Tên thương hiệu tiệm hoa (hiển thị trên tiêu đề, footer và hóa đơn).
  * **Hotline tư vấn đặt hoa \***: Đồng bộ trực tiếp 100% với số điện thoại hiển thị ở Chân trang (Footer) trên toàn bộ Desktop, Tablet và Mobile.
  * **Email hỗ trợ khách hàng**: Đồng bộ trực tiếp với email ở Chân trang.
  * **Địa chỉ tiệm hoa / Showroom \***: Đồng bộ trực tiếp với địa chỉ ở Chân trang và trang Giới Thiệu.
  * Giờ mở cửa phục vụ & Đơn vị tiền tệ (VND).
* **Cột phải — Xem Trước Trực Quan & Tiện Ích**:
  * **Xem Trước Thông Tin Chân Trang (Footer Live Preview)**: Khung mô phỏng thời gian thực, cập nhật ngay khi admin gõ thay đổi thông tin.
  * **Thẻ điều hướng nhanh**: Mở trực tiếp sang trang *Quản Lý Nút Tư Vấn*.
* Nút **Lưu Thay Đổi** được bố trí ở cả góc trên bên phải header và dưới chân form.

### 4.7. Quản Lý Nội Dung Trang & Chân Trang (`/admin/navigation`, `/admin/pages`)
* Tùy chỉnh mô tả thương hiệu và dòng bản quyền ở chân trang.
* Xem trước bố cục chân trang thực tế (đã đồng bộ tagline mới *"Nghệ Florist - Tiệm hoa & quả nhập khẩu"* cùng địa chỉ, email và hotline).
* Soạn thảo và chỉnh sửa nội dung trang Về Nghệ (`/about`) và Chính Sách (`/policy`).

### 4.8. Thư Viện Media & Nhật Ký Hệ Thống (`/admin/media`, `/admin/audit-logs`)
* **Media Library**: Quản lý kho ảnh hoa tải lên, sao chép link ảnh nhanh.
* **Audit Logs**: Ghi vết bảo mật lịch sử thao tác của admin (thời gian, hành động, đối tượng, địa chỉ IP).

---

## 5. KIẾN TRÚC & CHẾ ĐỘ BẢO MẬT TOÀN DIỆN (SECURITY ARCHITECTURE)

Hệ thống Nghệ Florist được thiết lập chế độ bảo mật cấp doanh nghiệp theo chuẩn **OWASP Top 10**:

```
                    Internet Request
                          │
                          ▼
            [ 1. Nginx Web Server Hardening ]
            - Giới hạn body size: 25M
            - Ẩn Nginx Version & Server Info
            - SSL/TLS Let's Encrypt chứng chỉ an toàn
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
            - Bearer Token xác thực quản trị nghiêm ngặt
            - Mã hóa mật khẩu bcrypt (10 rounds)
            - Kiểm soát quyền chặt chẽ (Strict single-admin rule)
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

### Bảng Chi Tiết Các Lớp Bảo Mật:

| Lớp bảo mật | Công nghệ / Biện pháp | Mục đích ngăn chặn |
| :--- | :--- | :--- |
| **Bảo mật Header** | `helmet` middleware trong Node.js | Ngăn chặn Cross-Site Scripting (XSS), Clickjacking, MIME Sniffing |
| **Chính sách CORS** | Whitelist tên miền cụ thể qua `ALLOWED_ORIGINS` | Chặn các website lạ gọi trộm API từ trình duyệt |
| **Chống Brute-force** | `express-rate-limit` | Chặn tấn công dò mật khẩu Admin và spam form đặt hoa |
| **Xác thực Admin** | `jsonwebtoken` (JWT) + `bcrypt` hash (10 salt rounds) | Bảo vệ tài khoản quản trị, chống lộ lọt thông tin |
| **Phân quyền chặt chẽ** | RBAC (`roles`, `permissions`, `user_roles`) | Ngăn chặn leo thang đặc quyền (Privilege Escalation) |
| **Chống SQL Injection** | Sử dụng hoàn toàn MySQL Prepared Statements (`pool.query(sql, [params])`) | Triệt tiêu 100% nguy cơ tấn công SQL Injection |
| **Bảo vệ File Upload** | `multer` lọc file mime (`jpg`, `jpeg`, `png`, `webp`), giới hạn 10MB | Chặn upload file `.php`, `.sh`, `.exe` chứa mã độc |
| **Tường lửa Máy Chủ** | Ubuntu `ufw` (Uncomplicated Firewall) | Chỉ mở cổng `22` (SSH), `80` (HTTP), `443` (HTTPS). Cổng Database 3306 hoàn toàn đóng với bên ngoài |
| **Bảo vệ Hệ Thống** | `app.disable('x-powered-by')` | Ẩn danh hoàn toàn thông tin server Node.js trước máy quét hacker |

---

## 6. QUY CHUẨN UI/UX ĐA NỀN TẢNG (MOBILE, TABLET, DESKTOP)

| Tiêu chí | Mobile (Dưới 768px) | Tablet (769px – 1024px) | Desktop (1024px trở lên) |
| :--- | :--- | :--- | :--- |
| **Thanh điều hướng** | Header 60px, logo giữa, menu trượt Drawer | Header mở rộng, logo + hotline gọi nhanh | Menu ngang đầy đủ, dropdown danh mục cao cấp |
| **Lưới sản phẩm hoa** | **2 cột cân đối** (khoảng cách 8–10px) | **3 cột thoáng đãng** | **4 cột showroom** sang trọng |
| **Banners quảng cáo** | Tỉ lệ ngang 16:11, không tràn viền | Tỉ lệ 16:9 rộng rãi | Tỉ lệ 16:9 sắc nét, hiệu ứng lướt nhẹ |
| **Modal đặt tư vấn** | Font gọn `0.82rem`, input `36px`, chip vừa vặn | Form 2 cột thanh thoát | Form rộng rãi, hộp xem trước mẫu trực quan |
| **Chân trang (Footer)** | Box liên hệ bo tròn (`.footer-mobile-contact`) | Lưới 2 cột (`1.35fr 1fr`) thoáng đãng | 4 cột hoàn chỉnh (`2.2fr 1fr 1fr 1.5fr`) |
| **Quản trị Admin** | Sidebar trượt Drawer, nút gọi/Zalo 1-chạm | Layout co giãn thông minh | Sidebar cố định 260px, Dashboard 2 cột cân bằng |

---

## 7. BÁO CÁO TIẾN ĐỘ & HẠ TẦNG MÁY CHỦ THỰC TẾ (DEPLOYMENT STATUS)

### 7.1. Trạng Thái Triển Khai Hiện Tại: ✅ LIVE PRODUCTION (HOÀN THIỆN)
Hệ thống đang hoạt động trực tuyến ổn định tại tên miền chính thức: **[https://ngheflorist.com](https://ngheflorist.com)**.

```
[✓] Hệ điều hành Ubuntu 22.04 LTS & cập nhật bản vá bảo mật
[✓] NGINX Web Server cấu hình Reverse Proxy & chứng chỉ SSL HTTPS
[✓] Node.js v20 & PM2 Process Manager chạy tiến trình nền ngheflorist-backend
[✓] MySQL 8.0 Database lưu trữ toàn bộ dữ liệu cấu trúc và sản phẩm
[✓] Đồng bộ bộ nhận diện logo xanh thương hiệu #1FAAE1 toàn diện
[✓] Hoàn thiện module Quản Lý Nút Tư Vấn Nổi đa kênh
[✓] Hoàn thiện form modal tư vấn tối ưu sâu cho Mobile
[✓] Đồng bộ hotline, email, địa chỉ từ Cài Đặt Website xuống Chân trang (Footer)
[✓] Cố định độ rộng Sidebar Admin và khắc phục lỗi hiển thị ảnh banner
[✓] Tường lửa UFW kích hoạt (chỉ mở 22, 80, 443)
```

### 7.2. Thông Tin Chi Tiết Hạ Tầng

* **Đơn Vị Cung Cấp**: TinoHost (Datacenter Việt Nam - Băng thông tốc độ cao).
* **Loại Máy Chủ**: Cloud VPS NVMe Cao Cấp.
* **Cấu Hình Phần Cứng**:
  * **CPU**: 2 vCPUs.
  * **RAM**: 2 GB RAM.
  * **Ổ Cứng**: 30 GB NVMe Storage.
  * **Hệ Điều Hành**: Ubuntu 22.04.5 LTS (x86_64).
* **Địa Chỉ IP Trực Tiếp**: `180.93.136.241`
* **Tên Miền Chính Thức**: [https://ngheflorist.com](https://ngheflorist.com)
  * Link Storefront: [https://ngheflorist.com](https://ngheflorist.com)
  * Link Admin CMS: [https://ngheflorist.com/admin](https://ngheflorist.com/admin)
* **Cổng Dịch Vụ**:
  * Cổng 80 / 443 (Nginx) $\rightarrow$ Phục vụ web ra Internet với chứng chỉ SSL.
  * Cổng 4000 (Node.js API) $\rightarrow$ Lắng nghe nội bộ `127.0.0.1`.
  * Cổng 3306 (MySQL Server) $\rightarrow$ Lắng nghe nội bộ `127.0.0.1`.

---

## 8. QUY TRÌNH VẬN HÀNH & CẬP NHẬT MÃ NGUỒN (DEVOPS & MAINTENANCE)

### 8.1. Quy Trình Cập Nhật Code Lên Máy Chủ (CI/CD Deploy)
Mọi thay đổi trên nhánh `main` được triển khai tự động lên VPS:
1. **Trên máy phát triển**:
   ```bash
   git add .
   git commit -m "feat/fix: mô tả nội dung cập nhật"
   git push origin main
   ```
2. **Kéo mã nguồn và biên dịch trên VPS**:
   ```bash
   cd /var/www/ngheflorist
   git pull origin main

   # Build Frontend:
   cd /var/www/ngheflorist/frontend
   npm install && npm run build

   # Build & Restart Backend (nếu có thay đổi API):
   cd /var/www/ngheflorist/backend
   npm install && npm run build
   pm2 restart ngheflorist-backend
   ```

### 8.2. Các Lệnh Tiện Ích Kiểm Tra Trạng Thái Server
* Xem trạng thái tiến trình: `pm2 status`
* Xem nhật ký hoạt động / lỗi: `pm2 logs ngheflorist-backend`
* Khởi động lại dịch vụ web: `sudo systemctl restart nginx`
* Kiểm tra dung lượng ổ đĩa: `df -h`
* Kiểm tra mức RAM: `free -m`

---
*Tài liệu bàn giao kỹ thuật toàn diện — Dự án Nghệ Florist vận hành chuyên nghiệp, chuẩn mực và sẵn sàng mở rộng!*
