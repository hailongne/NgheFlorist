# ĐẶC TẢ THIẾT KẾ TOÀN DIỆN MOBILE & TABLET — NGHỆ FLORIST
*(Premium Flower Digital Showroom & Lead Conversion Platform)*

> **Triết lý cốt lõi**: *"Show first, sell later."*  
> Đơn giản — Đẹp — Nhiều hình ảnh — Dễ lướt — Ít thao tác — Tập trung trưng bày.  
> Mobile và Tablet là **trải nghiệm chính (First-class citizen)**, không phải bản thu nhỏ méo mó của Desktop.

---

## MỤC LỤC
1. [Mục Tiêu & Định Vị Trải Nghiệm](#1-mục-tiêu--định-vị-trải-nghiệm)
2. [Nguyên Tắc Thiết Kế UI/UX Mobile & Tablet](#2-nguyên-tắc-thiết-kế-uiux-mobile--tablet)
3. [Đặc Tả Chi Tiết Giao Diện Mobile (Storefront)](#3-đặc-tả-chi-tiết-giao-diện-mobile-storefront)
   - 3.1. Mobile Header & Navigation Drawer
   - 3.2. Mobile Homepage (Catalogue Flow)
   - 3.3. Mobile Product Grid & Product Card (75-85% Ảnh)
   - 3.4. Mobile Category Album & Budget Filter (Bottom Sheet)
   - 3.5. Mobile Search & Filter UX
   - 3.6. Mobile Product Detail (Lookbook Experience & Sticky CTA)
   - 3.7. Mobile Custom Order Form (3-Step Wizard) & Easy Photo Upload
   - 3.8. Mobile Customer Request Success Modal
   - 3.9. Mobile Footer
4. [Đặc Tả Chi Tiết Giao Diện Tablet (Storefront & Lookbook)](#4-đặc-tả-chi-tiết-giao-diện-tablet-storefront--lookbook)
   - 4.1. Tablet Homepage & Hero Rộng
   - 4.2. Tablet Category Grid & Lưới Mẫu Hoa (3 Cột)
   - 4.3. Tablet Product Detail (Bố Cục 2 Cột Đối Xứng)
5. [Đặc Tả Giao Diện Quản Trị Mobile & Tablet (Admin Panel)](#5-đặc-tả-giao-diện-quản-trị-mobile--tablet-admin-panel)
   - 5.1. Admin Navigation Drawer & Menu Tối Giản
   - 5.2. Admin Trang Đích: Yêu Cầu Khách Hàng Dạng Thẻ (Lead Cards)
   - 5.3. Admin Folder Explorer Trên Mobile: Quản Lý Sản Phẩm Dạng Cây Thư Mục
   - 5.4. Admin Danh Mục 2 Tầng Trên Mobile & Tablet
   - 5.5. Admin Full-Screen Drawer / Page Cho CRUD Sản Phẩm
   - 5.6. Admin Media Library & CMS Mobile
6. [Quy Chuẩn Kỹ Thuật: Breakpoints, Touch UX, Image Ratio & Performance](#6-quy-chuẩn-kỹ-thuật-breakpoints-touch-ux-image-ratio--performance)
7. [Mẫu Prompts Chuyên Biệt Cho Mobile & Tablet (Sẵn Sàng Cho AI / Designer)](#7-mẫu-prompts-chuyên-biệt-cho-mobile--tablet)

---

## 1. MỤC TIÊU & ĐỊNH VỊ TRẢI NGHIỆM

### 1.1. Bản Chất
* Nghệ Florist là **Premium Flower Digital Showroom**.
* Tuyệt đối không phải marketplace, không phải e-commerce truyền thống.
* Không nhồi nhét: Cart, Checkout, Biến thể (Variants), Dropdown chọn size, Tồn kho (Stock), Đánh giá/Rating sao.

### 1.2. Phễu Trải Nghiệm Khách Hàng (Customer Journey)
```
Mở Website
   ↓
Thấy Hoa Ngay (Visual First)
   ↓
Lướt Tự Nhiên Như Cuốn Tạp Chí
   ↓
Chọn Thư Mục (Bó hoa / Giỏ hoa...)
   ↓
Lọc Khoảng Ngân Sách
   ↓
Xem Mẫu Đẹp (Lookbook)
   ↓
Gửi Yêu Cầu (Zalo Primary / FB Secondary)
```

### 1.3. Phễu Quản Trị Viên (Admin Flow)
```
Mở Admin
   ↓
Yêu Cầu Khách Hàng (Lead Cards thao tác 1-chạm: Gọi / Zalo)
   hoặc
Quản Lý Mẫu Hoa (Folder Explorer: Thư Mục Loại Hoa → Khoảng Giá → Mẫu Hoa)
```

---

## 2. NGUYÊN TẮC THIẾT KẾ UI/UX MOBILE & TABLET

1. **Simplicity > Features**: Giảm tối đa thao tác, loại bỏ các nút và văn bản thừa.
2. **Visual Dominance (Ảnh là trung tâm)**: Ảnh chiếm từ 75% đến 85% diện tích card và màn hình. Khách nhìn thấy hoa trước khi đọc thông tin.
3. **Typography Editorial**: Tiêu đề font có chân mềm mại sang trọng (`Playfair Display`), nội dung thanh thoát (`Plus Jakarta Sans`), cỡ chữ dễ đọc, line-height thoáng.
4. **Touch-Friendly**: Mọi vùng chạm (Touch Target) đạt chuẩn $\ge 44 \times 44\text{px}$, khoảng cách nút an toàn, không có hiệu ứng "hover-only".
5. **No Horizontal Scroll**: Tuyệt đối không có hiện tượng vỡ layout hay thanh cuộn ngang ngoài ý muốn (ngoại trừ các carousel xem ảnh/filter ngang được chủ định).
6. **Không phóng to/thu nhỏ máy móc**: Tablet tận dụng chiều ngang (2-4 cột, split view); Mobile ưu tiên 1 cột dọc và lưới 2 cột sản phẩm.

---

## 3. ĐẶC TẢ CHI TIẾT GIAO DIỆN MOBILE (STOREFRONT)

### 3.1. Mobile Header & Navigation Drawer
* **Header Bar (Sticky, Chiều cao 64px - 70px)**:
  * Nền: Trắng `#FFFFFF` hoặc mờ hiệu ứng kính (`backdrop-filter: blur(12px)`), viền dưới mảnh `#E4EEF1`.
  * Bố cục 3 khối tối giản:
    ```
    ┌─────────────────────────────────────────┐
    │  [☰ Menu]         NGHỆ         [🔍 Tìm]  │
    └─────────────────────────────────────────┘
    ```
  * Nút menu `[☰]`: Icon 24px, diện tích chạm $44\times 44\text{px}$.
  * Logo Nghệ Florist: Nằm chính giữa trang trọng, sắc nét, chiều cao 36px.
  * Nút tìm kiếm `[🔍]`: Bấm vào trượt ra thanh search input gọn gàng ngay đầu trang.

* **Navigation Drawer (Slide-in từ bên trái)**:
  * Nền trắng tinh khôi kết hợp điểm nhấn Soft Pastel Blue `#EAF6F9`.
  * Danh mục hiển thị:
    * 🌸 **Trang Chủ**
    * 📁 **Bộ Sưu Tập Hoa**:
      * *Bó hoa tươi*
      * *Giỏ hoa sang trọng*
      * *Kệ hoa khai trương / sự kiện*
      * *Lan hồ điệp*
      * *Hoa cưới thiết kế*
    * 🎁 **Thiết Kế Hoa Theo Yêu Cầu**
    * 🌿 **Về Nghệ Florist**
    * 📜 **Chính Sách & Cam Kết**
  * Cuối Drawer: Nút gọi nhanh hotline `0987 654 321` và nút chat trực tiếp `Nhắn Zalo Tư Vấn`.

---

### 3.2. Mobile Homepage (Catalogue Flow)
Thứ tự các section từ trên xuống dưới — Mỗi section ngắn gọn, có mục đích riêng biệt:

1. **Hero Section (Chiếm 75-85% viewport đầu tiên)**:
   * Ảnh Hero hoa tràn viền hoặc bo góc cong nhẹ (`var(--radius-lg)`), tỷ lệ dọc tối ưu cho điện thoại (tỷ lệ 4:5 hoặc 9:16).
   * Overlay chữ nghệ thuật nhẹ:
     * Tiêu đề: *Nghệ Florist* (Font Playfair Display tao nhã).
     * Dòng cảm xúc: *Những đóa hoa tinh tế gửi trao yêu thương.*
   * **1 Nút Primary CTA duy nhất**: `[ Xem bộ sưu tập hoa ]` (Nút lớn bo tròn, màu Teal `#5D9EAF`, nằm trong vùng chạm ngón cái).

2. **Bộ Sưu Tập Nổi Bật (Featured Collections)**:
   * Thẻ danh mục dạng trượt ngang (Horizontal Snap Carousel) hoặc lưới 2 cột: Bó hoa, Giỏ hoa, Kệ hoa...
   * Mỗi thẻ gồm ảnh hoa đại diện lớn, tên loại hoa và số lượng mẫu.

3. **Mẫu Hoa Tiêu Biểu (Curated Showcase Products)**:
   * Lưới 2 cột hiển thị 4-6 mẫu hoa đẹp nhất.

4. **Bộ Sưu Tập Theo Ngân Sách (Budget Explorer)**:
   * Thanh trượt các pill button bo tròn:
     `[ Dưới 500k ]` • `[ 500k – 1tr ]` • `[ 1tr – 2tr ]` • `[ Trên 2tr ]`
   * Chạm vào tự động chuyển sang trang danh mục với bộ lọc tương ứng.

5. **Banner Thiết Kế Riêng (Custom Floral Design)**:
   * Khối card nền xanh nhạt `#EAF6F9` viền mảnh `#CBE0E7`.
   * Thông điệp: *"Bạn muốn cắm hoa theo tone màu, ngân sách hoặc mẫu riêng?"*
   * Nút bấm: `[ Đặt cắm hoa theo yêu cầu ]`.

6. **Câu Chuyện Nghệ (Brand Essence)**:
   * 1 ảnh chụp florist đang cắm hoa tinh tế + 2 câu văn ngắn về triết lý hoa tươi nhập mới mỗi ngày và cam kết chụp ảnh thật cho khách duyệt trước khi giao.

7. **CTA Cuối Trang**:
   * Kêu gọi kết nối Zalo với Florist để nhận gợi ý hoa phù hợp trong 5 phút.

---

### 3.3. Mobile Product Grid & Product Card (75-85% Ảnh)
* **Bố cục chuẩn**: **Lưới 2 cột (2-Column Grid)**, gap 12px.
* **Tỷ lệ khung ảnh**: Tỷ lệ **4:5** (hoặc 3:4) đồng nhất toàn trang.
* **Cấu trúc Thẻ Sản Phẩm (Product Card)**:
  ```
  ┌───────────────────────┐
  │                       │
  │                       │
  │     ẢNH MẪU HOA       │  <- Chiếm 80% diện tích card
  │      (Tỷ lệ 4:5)      │
  │                       │
  │            [♡ Wishlist]│
  ├───────────────────────┤
  │ Tên Mẫu Hoa Tinh Tế   │  <- 1-2 dòng, font thanh lịch
  │ Giá tham khảo: 600.000₫│ <- Font số rõ ràng
  │ [ Chọn mẫu ]          │  <- Nút chạm nhanh
  └───────────────────────┘
  ```
* **Quy tắc hiển thị**:
  * **CÓ**: Ảnh sắc nét, Tên mẫu hoa, Chữ *"Giá tham khảo:"* + số tiền, Nút `[Chọn mẫu]`.
  * **TUYỆT ĐỐI KHÔNG HIỂN THỊ**: Mã SKU, Tồn kho, Chọn kích cỡ (size), Đánh giá sao, Thông số kỹ thuật rườm rà.

---

### 3.4. Mobile Category Album & Budget Filter
* **Trang Danh Mục**: Trình bày như một Lookbook / Album hoa sang trọng, không giống bảng dashboard khô cứng.
* **Budget Filter (Bộ lọc ngân sách)**:
  * Đặt ngay dưới tiêu đề trang dạng danh sách thẻ trượt ngang (Pill Badges) dễ vuốt bằng ngón tay cái:
    `[ Tất cả ]` • `[ Dưới 500k ]` • `[ 500k - 1tr ]` • `[ 1tr - 1.5tr ]` • `[ Trên 2tr ]`
  * Nút có hiệu ứng active rõ ràng (Màu Deep Teal nền sáng hoặc chữ trắng tương phản).

---

### 3.5. Mobile Search & Filter UX
* **Search Mobile**:
  * Bấm icon kính lúp $\rightarrow$ Mở thanh tìm kiếm toàn màn hình hoặc drop-down mượt mà từ header:
    `[ ← ] [ 🔍 Nhập tên hoa, loại hoa hoặc tone màu... ]`
  * Gợi ý tìm kiếm nhanh: *Hoa sinh nhật, Hoa hồng đỏ, Giỏ hoa tone pastel, Kệ hoa khai trương...*

* **Filter UX (Bottom Sheet Drawer)**:
  * Không dùng sidebar co rúm từ desktop.
  * Bấm nút `[ ⚡ Bộ Lọc ]` $\rightarrow$ Mở **Bottom Sheet** trượt từ đáy màn hình lên:
    * **Loại hoa**: Bó hoa, Giỏ hoa, Kệ hoa, Lan hồ điệp...
    * **Khoảng ngân sách**: Radio button to, dễ chạm.
    * Nút hành động dính đáy: `[ Xem kết quả (X mẫu hoa) ]` và `[ Đặt lại ]`.

---

### 3.6. Mobile Product Detail (Lookbook Experience & Sticky CTA)
* **Gallery Ảnh Kiểu Lookbook**:
  * Ảnh sản phẩm chiếm toàn bộ chiều ngang màn hình (Full-width Swipe Carousel).
  * Vuốt ngang (Swipe) mượt mà để xem các góc chụp và chi tiết hoa.
  * Dấu chấm chỉ báo trang ảnh (Dots indicator) nhỏ nhắn tinh tế.
* **Thông Tin Mẫu Hoa**:
  * Tên mẫu hoa (Font Playfair Display cỡ 22px - 26px).
  * Giá tham khảo nổi bật (vd: `650.000 ₫`).
  * Ghi chú nhẹ nhàng: `* Mẫu hoa cắm thủ công, giá thực tế có thể thay đổi nhẹ theo mùa hoa.`
  * Đoạn mô tả cảm xúc ngắn về phong cách cắm và loại hoa chủ đạo.
* **4 Cam Kết Dịch Vụ Cốt Lõi (Box viền mềm nền `#F7FBFC`)**:
  * 🎁 Tặng kèm biển và thiệp thiết kế riêng theo yêu cầu.
  * 📷 Luôn gửi ảnh sản phẩm trước khi giao đến tay khách hàng.
  * 🛡️ Có hoá đơn cho các doanh nghiệp.
  * 🛍️ Có túi đựng hoa tinh tế.
* **Sticky CTA Bar (Cố định ở đáy màn hình điện thoại)**:
  ```
  ┌──────────────────────────────────────────────┐
  │  Giá tham khảo: 650.000 ₫                    │
  │  [ 💬 Gửi Yêu Cầu Với Mẫu Này ]              │
  └──────────────────────────────────────────────┘
  ```
  * Nằm an toàn trên thanh điều hướng của hệ điều hành (`padding-bottom: env(safe-area-inset-bottom)`).
  * Khách cuộn đến đâu trên trang chi tiết cũng có thể bấm gửi yêu cầu ngay lập tức.

---

### 3.7. Mobile Custom Order Form (3-Step Wizard) & Easy Photo Upload
Trang `/custom-order` trên Mobile không phải một form dài dằng dặc mà được tối ưu thành các khối thẻ trực quan:

* **Bước 1 — Nhu Cầu Hoa**:
  * Chọn hình thức hoa (Các nút thẻ hình ảnh: Bó hoa, Giỏ hoa, Kệ hoa, Lan hồ điệp, Khác).
  * Chọn ngân sách dự kiến (Thẻ chọn nhanh hoặc ô nhập tiền).
  * Chọn tone màu (Các ô màu tròn: Pastel, Đỏ, Trắng, Vàng, Tự do...).
* **Bước 2 — Tải Ảnh Mẫu Tham Khảo (Cực kỳ đơn giản)**:
  ```
  ┌──────────────────────────────────────────────┐
  │                    ＋                        │
  │           Chọn ảnh mẫu hoa                   │
  │        (Chụp từ Camera hoặc Thư viện)        │
  └──────────────────────────────────────────────┘
  ```
  * Sau khi chọn ảnh $\rightarrow$ Hiện thumbnail vuông nhỏ kèm nút `[×]` để xóa nếu muốn đổi ảnh khác.
* **Bước 3 — Thông Tin Nhận Hoa & Lời Nhắn**:
  * Họ tên & Số điện thoại / Zalo.
  * Ngày giờ nhận hoa (Date picker gốc của điện thoại, không cần gõ phím).
  * Địa chỉ nhận hoa và nội dung thiệp chúc mừng.
* **Nút hoàn tất**: `[ Gửi Yêu Cầu Thiết Kế ]`.

---

### 3.8. Mobile Customer Request Success Modal
Màn hình xuất hiện ngay sau khi gửi yêu cầu thành công:
1. **Icon tích xanh lớn** + Tiêu đề *"Gửi Yêu Cầu Thành Công!"*.
2. **Mã yêu cầu nổi bật**: `NF20260909001` kèm nút `[📋 Sao chép mã]`.
3. **KHỐI CẢNH BÁO BẮT BUỘC (Vàng Amber / Đỏ)**:
   > ⚠️ **LƯU Ý QUAN TRỌNG ĐỂ ĐẶT ĐƯỢC HÀNG**:  
   > Quý khách vui lòng bấm nút nhắn Zalo hoặc Fanpage bên dưới để gửi thông tin cho sales. **Nếu chưa liên hệ trực tiếp với sales, Nghệ Florist sẽ không thể tiếp nhận và xử lý đơn hàng.**
4. **Cặp nút chuyển đổi lớn**:
   * `[ 💬 Nhắn Zalo Cho Florist (Chính) ]` (Tự động copy toàn bộ nội dung đơn vào clipboard khi bấm).
   * `[ 🌐 Nhắn Facebook Messenger ]`.

---

### 3.9. Mobile Footer
Gọn gàng, tinh tế, không chiếm nhiều màn hình:
* Logo Nghệ Florist & Slogan ngắn.
* Nhóm liên kết dạng danh sách thoáng: *Bộ sưu tập • Cắm hoa theo yêu cầu • Về chúng tôi • Chính sách*.
* Hotline bấm gọi 1-chạm (`tel:0987654321`).
* Bản quyền: `© 2026 Nghệ Florist. All rights reserved.`
* Đệm an toàn `env(safe-area-inset-bottom)`.

---

## 4. ĐẶC TẢ CHI TIẾT GIAO DIỆN TABLET (STOREFRONT & LOOKBOOK)

Tablet (iPad Mini, iPad Air, iPad Pro, Android Tablets từ 768px đến 1024px) không phải là mobile phóng to, cũng không phải desktop bị bóp nghẹt:

### 4.1. Tablet Homepage & Hero Rộng
* **Hero Section**:
  * Tận dụng chiều rộng màn hình, hiển thị bố cục Banner 2 cột hoặc Hero rộng với typography lớn, sang trọng.
  * Hình ảnh hoa thể hiện rõ nét các góc cắm, độ sâu trường ảnh và vẻ đẹp của cánh hoa.

### 4.2. Tablet Category Grid & Lưới Mẫu Hoa (3 Cột)
* **Thư mục danh mục**: Lưới 3 hoặc 4 cột hình chữ nhật đứng (tỷ lệ 4:5), mỗi ô là một bức tranh hoa sống động.
* **Lưới mẫu hoa**:
  * Hiển thị **3 cột sản phẩm** cân xứng (thay vì 2 cột như mobile hay 4 cột như desktop).
  * Giữ nguyên nguyên tắc ảnh chiếm 80% diện tích card, giá tham khảo rõ ràng.

### 4.3. Tablet Product Detail (Bố Cục 2 Cột Đối Xứng)
* Tận dụng hoàn hảo chiều ngang màn hình tablet:
  ```
  ┌────────────────────────┬────────────────────────┐
  │                        │  Tên Mẫu Hoa Tuyệt Đẹp │
  │                        │  Mã: NF-012            │
  │      GALLERY ẢNH       │  Giá tham khảo: 850k   │
  │      KHUNG LỚN         │  ───────────────────── │
  │                        │  4 Cam kết dịch vụ     │
  │  [o] [o] [o] (Thumb)   │  [ 💬 Gửi Yêu Cầu ]    │
  └────────────────────────┴────────────────────────┘
  ```
* Cột trái: Gallery ảnh lớn kèm dải thumbnail chạm chọn nhanh.
* Cột phải: Toàn bộ thông tin, cam kết dịch vụ và nút CTA Zalo to bản dễ bấm.

---

## 5. ĐẶC TẢ GIAO DIỆN QUẢN TRỊ MOBILE & TABLET (ADMIN PANEL)

Admin trên điện thoại và tablet phải mang lại cảm giác: **"Quản lý đơn giản như duyệt album ảnh trên điện thoại"**, hoàn toàn không nhồi nhét bảng biểu dày đặc kiểu ERP.

### 5.1. Admin Navigation Drawer & Menu Tối Giản
* Header Admin Mobile:
  `[☰ Menu]   Quản Trị Nghệ Florist   [👤 Admin]`
* Mở drawer với các mục rõ ràng:
  * 📋 **Yêu Cầu Khách Hàng (Mặc định)**
  * 📁 **Quản Lý Mẫu Hoa (Folder Explorer)**
  * 📂 **Quản Lý Danh Mục (2 Tầng)**
  * 🖼️ **Thư Viện Ảnh (Media)**
  * ⚙️ **Cài Đặt & Kênh Chuyển Đổi**

---

### 5.2. Admin Trang Đích: Yêu Cầu Khách Hàng Dạng Thẻ (Lead Cards)
* **Tuyệt đối không dùng table cuộn ngang dài lê thê trên mobile.**
* Danh sách yêu cầu chuyển thành **Thẻ Card thông minh (Lead Card)**:
  ```
  ┌──────────────────────────────────────────────┐
  │ NF20260909001                    [Mới ●]     │
  │ Khách: Nguyễn Văn A - 0912 345 678           │
  │ Mẫu: Bó hoa Pastel Rose (Ngân sách: 800k)    │
  │ Ngày cần: 10/09/2026 lúc 09:30 sáng          │
  │                                              │
  │ [📞 Gọi ngay]   [💬 Mở Zalo]   [👁️ Chi tiết]  │
  └──────────────────────────────────────────────┘
  ```
* **Thao tác 1-chạm cho Sales**:
  * Nút `[Gọi ngay]`: Kích hoạt cuộc gọi điện thoại trực tiếp `tel:...`.
  * Nút `[Mở Zalo]`: Mở app Zalo chat ngay với khách theo số điện thoại đã cung cấp.
* **Drawer Chi Tiết Yêu Cầu (Bottom Sheet / Full Sheet)**:
  * Xem toàn bộ thông tin lời chúc thiệp, địa chỉ giao hoa, ảnh mẫu do khách tải lên (phóng to xem nét căng).
  * Dropdown cập nhật trạng thái: *Mới $\rightarrow$ Đang xử lý $\rightarrow$ Đã liên hệ $\rightarrow$ Đã chốt đơn $\rightarrow$ Hoàn thành*.

---

### 5.3. Admin Folder Explorer Trên Mobile: Quản Lý Sản Phẩm Dạng Cây Thư Mục
Đúng chuẩn trải nghiệm duyệt thư mục (Folder Explorer):
* **Tầng 1 — Danh Mục Lớn**:
  * Hiển thị danh sách các folder loại hoa:
    * 📁 **Bó hoa** (24 mẫu hoa)
    * 📁 **Giỏ hoa** (18 mẫu hoa)
    * 📁 **Kệ hoa** (12 mẫu hoa)
    * 📁 **Lan hồ điệp** (8 mẫu hoa)
* **Tầng 2 — Thư Mục Con (Khoảng Giá)**:
  * Chạm vào `📁 Bó hoa` $\rightarrow$ Mở danh sách thư mục giá:
    * 📂 *Dưới 500k* (4 mẫu)
    * 📂 *500k – 1tr* (10 mẫu)
    * 📂 *1tr – 2tr* (8 mẫu)
    * 📂 *Trên 2tr* (2 mẫu)
* **Tầng 3 — Lưới Mẫu Hoa Trong Thư Mục (2 Cột)**:
  * Hiển thị danh sách mẫu hoa với ảnh lớn trực quan.
  * Chạm vào thẻ card mẫu hoa $\rightarrow$ Mở màn hình Sửa sản phẩm.

---

### 5.4. Admin Danh Mục 2 Tầng Trên Mobile & Tablet
* Cấu trúc danh mục phân cấp rõ ràng dạng Accordion hoặc thẻ Folder lồng nhau.
* Hiển thị số lượng mẫu hoa đang liên kết.
* **Cơ chế an toàn**: Nút `[Xóa]` tự động khóa nếu danh mục đang có mẫu hoa trực thuộc, thông báo rõ ràng cho admin cần chuyển hoặc ẩn danh mục.

---

### 5.5. Admin Full-Screen Drawer / Page Cho CRUD Sản Phẩm
* Thay vì mở modal desktop bị tràn viền, mobile sử dụng **Trang toàn màn hình hoặc Full-screen Drawer**:
  * Tên mẫu hoa & Giá tham khảo.
  * Chọn Thư mục Loại hoa & Khoảng ngân sách.
  * Công tắc gạt (Switch): *Hiển thị ngoài website*.
  * **Quản lý ảnh tiện lợi**:
    * Nút chọn ảnh từ thư viện điện thoại hoặc chụp trực tiếp.
    * Khung ảnh đại diện chính (Cover preview) lớn.
    * Lưới ảnh phụ bên dưới với nút `[★ Đặt làm chính]` và icon thùng rác để xóa ảnh thừa.
  * Nút `[ Lưu Thay Đổi ]` cố định ở đáy màn hình (Sticky Save Bar).

---

### 5.6. Admin Media Library & CMS Mobile
* **Media Library**: Lưới ảnh 2 cột (Mobile) hoặc 3-4 cột (Tablet). Chạm vào ảnh để phóng to, sao chép URL hoặc xóa.
* **CMS Mobile**: Thiết kế dạng danh sách cuộn dọc đơn cột, chia khối Accordion (Khối Banner Hero, Khối Cam Kết, Khối Giới Thiệu...).

---

## 6. QUY CHUẨN KỸ THUẬT: BREAKPOINTS, TOUCH UX, IMAGE RATIO & PERFORMANCE

### 6.1. Bảng Breakpoints & Bố Cục Thống Nhất
| Phân loại | Kích thước màn hình | Layout Lưới Sản Phẩm | Header Style | Điều Hướng / Menu |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Nhỏ** | 320px – 360px | 1 hoặc 2 cột | Cao 60px | Drawer trượt trái |
| **Mobile Chuẩn** | 375px – 430px | 2 cột (Gap 12px) | Cao 64px - 70px | Drawer trượt trái + Sticky Bottom Bar |
| **Tablet Dọc** | 600px – 768px | 2 hoặc 3 cột | Cao 70px | Drawer + Search Bar mở rộng |
| **Tablet Ngang** | 820px – 1024px | 3 hoặc 4 cột | Full Header | Menu ngang rút gọn |
| **Desktop** | 1280px+ | 4 cột (Showroom) | Desktop Editorial | Full Navigation Menu |

### 6.2. Tiêu Chuẩn Touch Target & Ergonomics
* Kích thước vùng bấm tối thiểu: $44\text{px} \times 44\text{px}$.
* Vùng thao tác chính (Nút gọi Zalo, nút gửi yêu cầu, nút chọn mẫu) ưu tiên nằm ở **nửa dưới màn hình** (Thumb Zone) để người dùng dễ thao tác bằng một tay.
* Khai báo an toàn cho hệ điều hành iOS: `padding-bottom: calc(16px + env(safe-area-inset-bottom))`.

### 6.3. Tiêu Chuẩn Tỷ Lệ Ảnh (Image Ratios)
* **Ảnh Mẫu Hoa (Product Card)**: Cố định tỷ lệ **4:5** (hoặc 3:4) cho mọi ảnh trên hệ thống. Tuyệt đối không để card lồi lõm vì ảnh lệch tỉ lệ.
* **Ảnh Hero Mobile**: Tỷ lệ **4:5** hoặc **9:16**, tập trung vào bó hoa trung tâm.
* **Ảnh Thư Mục Danh Mục**: Tỷ lệ **4:5** đồng bộ.

### 6.4. Tối Ưu Hiệu Năng (Performance Mobile)
* Tự động áp dụng `loading="lazy"` cho toàn bộ danh sách sản phẩm bên dưới màn hình đầu tiên.
* Hỗ trợ ảnh định dạng WebP hiện đại, kích thước tối ưu, không tải file ảnh gốc nặng hàng chục MB về máy người dùng.
* Luôn có fallback về Logo Nghệ Florist thông qua component `ImageWithFallback` để không bao giờ bị vỡ khung ảnh.

---

## 7. MẪU PROMPTS CHUYÊN BIỆT CHO MOBILE & TABLET

*(Dành riêng cho bạn copy-paste khi ra lệnh cho AI hoặc Designer thực hiện từng màn hình)*

### Prompt 1: Thiết Kế Toàn Diện Public Storefront Mobile (375px - 430px)
```text
Bạn là Senior UI/UX Designer chuyên về Mobile App & Web cao cấp.
Hãy thiết kế giao diện Mobile (375px - 430px) cho website "Nghệ Florist" theo đúng định vị: Premium Flower Digital Showroom (Không phải sàn thương mại điện tử, không có giỏ hàng hay thanh toán).

Yêu cầu chi tiết:
1. Triết lý: "Show first, sell later" — Nhiều hình ảnh hoa đẹp, ít text, ít nút, cuộn lướt tự nhiên như catalogue tạp chí hoa.
2. Bảng màu: Nền trắng tinh khôi #FFFFFF kết hợp Soft Pastel Blue #EAF6F9, điểm nhấn Deep Teal #5D9EAF và chữ than chì thanh lịch #26383D. Font Playfair Display (tiêu đề) và Plus Jakarta Sans (nội dung).
3. Header Mobile: Chiều cao 64px, gồm [☰ Menu] bên trái, logo Nghệ Florist ở giữa, [🔍 Tìm kiếm] bên phải. Menu mở Drawer danh mục hoa và khoảng ngân sách.
4. Lưới sản phẩm (Trang chủ & Danh sách hoa):
   - Mặc định 2 cột đều đặn, khoảng cách 12px.
   - Thẻ sản phẩm: Ảnh tỷ lệ 4:5 chiếm 80% diện tích card. Bên dưới chỉ có tên hoa thanh nhã, dòng chữ "Giá tham khảo: [Số tiền] đ" và nút bấm bo tròn nhẹ nhàng "Chọn mẫu".
   - Tuyệt đối không có: rating sao, số lượng tồn kho, chọn kích cỡ, xuất xứ.
5. Bộ lọc giá: Thiết kế dạng thanh trượt ngang các nút chọn nhanh (< 500k, 500k-1tr, 1tr-2tr, > 2tr) hoặc Bottom Sheet trượt từ đáy màn hình.
6. Trang chi tiết hoa (/product/:slug):
   - Ảnh hoa full-width cho phép vuốt ngang (swipe lookbook).
   - 4 cam kết dịch vụ: Tặng kèm biển/thiệp thiết kế; Gửi ảnh thật trước khi giao; Có hoá đơn doanh nghiệp; Có túi đựng hoa tinh tế.
   - Thanh Sticky Bar cố định ở đáy màn hình gồm "Giá tham khảo: ..." và nút to "Gửi Yêu Cầu Với Mẫu Này".
7. Modal gửi yêu cầu thành công: Hiển thị mã NFYYYYMMDDXXX, hộp cảnh báo vàng bắt buộc sao chép và liên hệ sales qua Zalo/Facebook để được phục vụ, kèm nút Zalo tự động copy thông tin.
8. Đảm bảo Touch target >= 44px và hỗ trợ safe-area-inset-bottom.
```

### Prompt 2: Thiết Kế Giao Diện Tablet Lookbook (768px - 1024px)
```text
Hãy thiết kế giao diện Tablet (iPad / Android Tablet từ 768px đến 1024px) cho Nghệ Florist — Digital Showroom hoa tươi cao cấp:
1. Định vị: Tận dụng không gian màn hình rộng, không phải mobile phóng to, không phải desktop thu nhỏ.
2. Trang danh sách hoa: Lưới 3 cột sản phẩm cân đối, hình ảnh mẫu hoa sắc nét tỷ lệ 4:5. Bộ lọc danh mục dạng thẻ ngang sang trọng.
3. Trang chi tiết hoa: Bố cục chia 2 cột đối xứng:
   - Cột trái: Gallery ảnh hoa lớn độ phân giải cao kèm dải ảnh nhỏ (thumbnails) bên dưới.
   - Cột phải: Tên hoa nghệ thuật, giá tham khảo, mô tả loại hoa, khối 4 cam kết dịch vụ (tặng thiệp, gửi ảnh trước khi giao, hóa đơn VAT, túi hoa tinh tế) và nút bấm CTA Zalo to bản.
4. Điều hướng mượt mà, hỗ trợ cả hướng xoay dọc (Portrait 768px) và xoay ngang (Landscape 1024px).
```

### Prompt 3: Thiết Kế Giao Diện Quản Trị Mobile & Tablet (Admin Panel)
```text
Hãy thiết kế giao diện Quản Trị Viên (Admin Panel) tối ưu hoàn hảo cho Mobile và Tablet của Nghệ Florist:
1. Triết lý: Quản lý cực kỳ đơn giản, trực quan như duyệt album ảnh trên smartphone. Tuyệt đối không nhồi nhét bảng dữ liệu (table) cuộn ngang phức tạp.
2. Trang đích mặc định (/admin/requests):
   - Danh sách yêu cầu khách hàng hiển thị dưới dạng Lead Card trực quan: Mã đơn, tên khách, số điện thoại, loại hoa cần, ngân sách, ngày giao.
   - Thao tác nhanh 1-chạm cho nhân viên: Nút "Gọi ngay" (tel:) và nút "Mở Zalo" để tư vấn và gửi ảnh hoa chốt đơn lập tức.
3. Trang quản lý mẫu hoa (/admin/products):
   - Thiết kế chuẩn "Folder Explorer":
     Tầng 1: Các thư mục Loại hoa (📁 Bó hoa, 📁 Giỏ hoa, 📁 Kệ hoa...)
     Tầng 2: Các thư mục Khoảng giá (📂 Dưới 500k, 📂 500k - 1tr...)
     Tầng 3: Lưới 2 cột các mẫu hoa thực tế trong thư mục đó kèm nút sửa nhanh.
4. Form thêm/sửa sản phẩm trên mobile: Thiết kế dạng Full-screen Drawer với khung chọn ảnh từ Camera/Thư viện điện thoại, chia rõ Khung xem trước ảnh chính và Album ảnh phụ.
```

---
*Tài liệu được cập nhật chuẩn xác theo 40 nguyên tắc Mobile & Tablet UX của Nghệ Florist.*
