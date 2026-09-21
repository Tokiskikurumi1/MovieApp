# BÁO CÁO TỔNG QUAN VÀ PHÂN TÍCH KIẾN TRÚC HỆ THỐNG
## DỰ ÁN: CINESTREAM - MOVIE STREAMING PLATFORM

---

## MỤC LỤC
1. [Mô hình kiến trúc dự án sử dụng](#1-mô-hình-kiến-trúc-dự-án-sử-dụng)
2. [Lý do lựa chọn mô hình](#2-lý-do-lựa-chọn-mô-hình)
3. [Đặc trưng nổi bật của đề tài](#3-đặc-trưng-nổi-bật-của-đề-tài)
4. [Độ chính xác và độ tin cậy của hệ thống](#4-độ-chính-xác-và-độ-tin-cậy-của-hệ-thống)
5. [Điểm vượt trội so với các ứng dụng khác](#5-điểm-vượt-trội-so-với-các-ứng-dụng-khác)
6. [Chiến lược kinh doanh và mô hình kiếm tiền](#6-chiến-lược-kinh-doanh-và-mô-hình-kiếm-tiền)

---

## 1. MÔ HÌNH KIẾN TRÚC DỰ ÁN SỬ DỤNG

Hệ thống được thiết kế theo các tiêu chuẩn kiến trúc hiện đại, phân tách rõ ràng giữa giao diện, nghiệp vụ và dữ liệu:

### 1.1. Kiến trúc tổng thể: Client - Server (3-Tier Architecture)
Hệ thống được chia thành 3 tầng độc lập:
* **Tầng hiển thị (Presentation Tier - Client):**
  * **Mobile App (`FrontEnd/`):** Xây dựng bằng **React Native (Expo)**, hỗ trợ đa nền tảng (Android & iOS).
  * **Admin Web Dashboard (`Admin/`):** Xây dựng bằng **React + Vite + TypeScript**, vận hành dưới dạng Single Page Application (SPA).
* **Tầng xử lý nghiệp vụ (Application / Logic Tier - Server):**
  * **Backend API (`Backend/`):** Xây dựng bằng **Node.js + Express + TypeScript**, cung cấp chuẩn giao tiếp **RESTful API** và quản lý các worker xử lý nền.
* **Tầng dữ liệu (Data Tier):**
  * Hệ quản trị cơ sở dữ liệu quan hệ **MySQL 8.x / 9.x (`movie_db`)** xử lý thông qua cơ chế Connection Pool.

```
+-------------------------------------------------------------+
|                  TẦNG HIỂN THỊ (CLIENT TIER)                 |
|  [Mobile App: React Native / Expo]  [Admin Web: React Vite] |
+------------------------------+------------------------------+
                               | (RESTful API / JSON)
+------------------------------v------------------------------+
|                TẦNG NGHIỆP VỤ (APPLICATION TIER)            |
|       [Node.js + Express + TypeScript API Server]           |
|  - Router & Middlewares (JWT Auth, Error Handling)          |
|  - Controllers (Nghiệp vụ, điều phối)                       |
|  - Worker / Crawler (Tự động thu thập phim từ KKPhim)       |
+------------------------------+------------------------------+
                               | (SQL Connection Pool)
+------------------------------v------------------------------+
|                  TẦNG DỮ LIỆU (DATA TIER)                    |
|             [MySQL Database: movie_db]                      |
|  - movies, episodes, categories, users, transactions,...    |
+-------------------------------------------------------------+
```

### 1.2. Kiến trúc phân tầng Backend (Layered Architecture)
* **Routing Layer (`src/routes`):** Định tuyến URL và ánh xạ HTTP Methods (`GET`, `POST`, `PUT`, `DELETE`).
* **Middleware Layer (`src/middlewares`):** Chịu trách nhiệm bảo mật, kiểm tra quyền hạn và giải mã JWT Token.
* **Controller Layer (`src/controllers`):** Đóng gói logic nghiệp vụ, tiếp nhận tham số, kiểm tra dữ liệu đầu vào và trả về phản hồi JSON chuẩn.
* **Worker & Service Layer (`scripts/crawl.ts`, `src/services`):** Tác vụ ngầm cào phim tự động, phân tích cú pháp dữ liệu từ API bên ngoài.
* **Database Access (`src/config/database.ts`):** Quản lý kết nối pooling tới MySQL (`mysql2/promise`).

### 1.3. Kiến trúc Mobile App (Component-Driven & File-based Routing)
* **File-based Routing (Expo Router):** Định tuyến màn hình tự động thông qua cấu trúc thư mục `app/`, hỗ trợ Stack và Bottom Tabs mượt mà.
* **Component-Driven Development (CDD):** Chia nhỏ giao diện thành các module tái sử dụng cao trong `src/components/` (MovieCard, EpisodeSelector, VideoPlayer,...).
* **Service Layer (`src/services/API.ts`):** Trừu tượng hóa các lời gọi API từ giao diện, tự động đính kèm Token và xử lý lỗi mạng tập trung.

---

## 2. LÝ DO LỰA CHỌN MÔ HÌNH

1. **Tách biệt hoàn toàn Client - Server:**
   * Backend REST API duy nhất phục vụ song song cho cả ứng dụng Mobile của người dùng và Web Dashboard của quản trị viên.
   * Cho phép mở rộng thêm ứng dụng Smart TV hoặc Website xem phim trong tương lai mà không cần can thiệp vào máy chủ hay cơ sở dữ liệu.
2. **Đồng nhất hệ sinh thái công nghệ (Full-stack TypeScript):**
   * Sử dụng xuyên suốt TypeScript từ Mobile, Web Admin đến Backend giúp tối ưu hóa việc chia sẻ định nghĩa kiểu dữ liệu (Types/Interfaces).
   * Giảm thiểu lỗi cú pháp thời gian chạy (runtime errors) và chi phí học tập của đội ngũ phát triển.
3. **Node.js tối ưu cho I/O-bound & Crawler bất đồng bộ:**
   * Ứng dụng xem phim có đặc thù đọc/ghi dữ liệu liên tục (streaming link, lưu lịch sử, tìm kiếm).
   * Cơ chế Non-blocking I/O và Event Loop của Node.js xử lý xuất sắc các luồng cào dữ liệu song song hàng trăm tập phim mà không làm tắc nghẽn server.
4. **Cơ sở dữ liệu quan hệ (MySQL) phù hợp nghiệp vụ:**
   * Mối quan hệ giữa Phim, Thể loại, Tập phim, Bình luận và Người dùng mang tính liên kết chặt chẽ.
   * Ràng buộc khóa ngoại (`FOREIGN KEY`) và tính toàn vẹn giao dịch (ACID) là bắt buộc cho tính năng nạp VIP, thanh toán (`transactions`).
5. **Tiết kiệm chi phí với React Native & Expo:**
   * Phát triển một lần dùng chung mã nguồn cho cả 2 hệ điều hành lớn nhất thế giới: **Android** và **iOS**, tiết kiệm 50% thời gian so với viết ứng dụng gốc (Native).

---

## 3. ĐẶC TRƯNG NỔI BẬT CỦA ĐỀ TÀI

* **Hệ sinh thái khép kín đầy đủ:** Tích hợp đầy đủ từ ứng dụng người dùng, trang quản trị chuyên sâu đến máy chủ cơ sở dữ liệu.
* **Công cụ Cào phim tự động (Automated KKPhim Crawler):** Tự động phân tích, đồng bộ thông tin phim, năm phát hành, thể loại, quốc gia và toàn bộ danh sách tập phát sóng (kèm link direct HLS m3u8) chỉ trong vài phút.
* **Đồng bộ hóa tiến trình thời gian thực (Continue Watching):** Ghi nhận chính xác mốc thời gian người dùng đang xem dở trên server, cho phép chuyển đổi giữa điện thoại và các thiết bị khác mà không mất tiến trình.
* **Tương tác cộng đồng đa cấp (Nested Comments):** Hỗ trợ người dùng bình luận, trả lời (reply) theo từng luồng cha-con và thả tim tương tự trải nghiệm mạng xã hội hiện đại.
* **Cơ chế phân hạng VIP nhiều tầng (Role & VIP Tiering):** Hỗ trợ linh hoạt các gói dịch vụ (Free, VIP Standard, VIP 4K), khóa tập phim độc quyền theo tài khoản.

---

## 4. ĐỘ CHÍNH XÁC VÀ ĐỘ TIN CẬY CỦA HỆ THỐNG

* **Độ chính xác về thời gian và tiến trình phát video:**
  * Thuộc tính `progress` trong bảng `watch_history` lưu dưới dạng thập phân độ chính xác cao `DECIMAL(5, 4)` (chính xác đến 0.01%).
  * Đảm bảo video tua chính xác đến từng giây khi người dùng tiếp tục xem lại bộ phim.
* **Độ toàn vẹn và nhất quán của dữ liệu (Data Integrity):**
  * Khóa ngoại với cơ chế `ON DELETE CASCADE` đảm bảo khi một bộ phim hoặc tài khoản bị xóa, các dữ liệu phụ thuộc (tập phim, bình luận, lịch sử) tự động được giải phóng sạch sẽ.
  * Khóa ràng buộc `UNIQUE` ngăn ngừa lỗi trùng lặp mã phim (`slug`), mã đơn hàng thanh toán (`order_code`) hoặc tập phim trên cùng một server.
* **Độ chính xác khi thu thập dữ liệu (Crawler Precision):**
  * Kiểm tra tính duy nhất qua `external_id` và `slug`, tự động cập nhật số tập mới cho các phim đang chiếu mà không gây ghi đè hay mất dữ liệu cũ.
* **Bảo mật và phân quyền chuẩn mực (Authentication Accuracy):**
  * Xác thực Stateless bằng JWT Token, băm mật khẩu một chiều với thuật toán `bcryptjs`.
  * Phân tách quyền hạn rõ ràng giữa người dùng thông thường (`user`) và quản trị viên (`admin`), ngăn chặn triệt để hành vi can thiệp trái phép vào hệ thống API.

---

## 5. ĐIỂM VƯỢT TRỘI SO VỚI CÁC ỨNG DỤNG KHÁC

| Tiêu chí | Ứng dụng xem phim thông thường | **CineStream (Đề tài của bạn)** |
| :--- | :--- | :--- |
| **Nguồn cấp dữ liệu** | Phải nhập tay từng phim (dữ liệu nghèo nàn, chỉ có vài phim demo). | **Tích hợp Crawler tự động**, cập nhật hàng nghìn phim và tập phim phong phú trong vài phút. |
| **Trình phát Video** | Dùng WebView nhúng trang web bên ngoài (nhiều quảng cáo bẩn, dễ lỗi giao diện). | **Native Video Player (`expo-video`)** phát trực tiếp luồng stream **HLS (.m3u8)** mượt mà, tải nhanh. |
| **Điều hướng & Trải nghiệm** | Điều hướng truyền thống dễ lag, khó cấu trúc sâu. | **Expo Router (File-based Routing)** mượt mà, hỗ trợ Deep-linking trực tiếp vào chi tiết phim. |
| **Quản lý thiết bị** | Không kiểm soát số lượng máy đăng nhập. | Có bảng quản lý thiết bị (`user_devices`), ghi nhận loại máy (Mobile/TV), IP, hạn chế việc dùng chung tài khoản lậu. |
| **Hệ thống Quản trị (Admin)** | Không có hoặc làm sơ sài. | Trang Admin hoàn chỉnh: Thống kê số liệu, quản lý phim, duyệt bình luận, quản lý tài khoản và nút kích hoạt cào phim. |

---

## 6. CHIẾN LƯỢC KINH DOANH VÀ MÔ HÌNH KIẾM TIỀN

Hệ thống đã có sẵn cấu trúc cơ sở dữ liệu (`transactions`, `vip_tier`, `is_vip`) sẵn sàng triển khai các mô hình tạo doanh thu sau:

### 6.1. Mô hình Thuê bao định kỳ (Subscription Video on Demand - SVOD / Freemium)
* **Tài khoản Miễn phí (Free):** Xem phim ở độ phân giải tiêu chuẩn (HD 720p), có thể kèm quảng cáo.
* **Tài khoản VIP (VIP Standard / VIP 4K):** 
  * Mở khóa các phim chiếu sớm, phim độc quyền (`is_vip = TRUE`).
  * Trải nghiệm chất lượng hình ảnh cao nhất (Full HD, 4K HDR), âm thanh vòm, không quảng cáo.
  * Cho phép đăng nhập và xem đồng thời trên nhiều thiết bị.
* **Cung cấp đa dạng gói nạp:** Gói 1 tháng (`1m`), 6 tháng (`6m`), 1 năm (`1y`) với các mức chiết khấu hấp dẫn.

### 6.2. Tích hợp Cổng thanh toán tự động (Automated Payment Gateways)
* Kết nối thanh toán tự động qua **VietQR (quét mã chuyển khoản ngân hàng)**, ví điện tử **MoMo**, **ZaloPay** hoặc thẻ thanh toán quốc tế **Visa/Mastercard**.
* Xử lý webhook xác nhận tự động để nâng cấp hạng VIP ngay lập tức mà không cần can thiệp thủ công.

### 6.3. Mô hình Quảng cáo trong ứng dụng (Ad-supported - AVOD)
* Áp dụng cho tập khách hàng sử dụng miễn phí:
  * **Quảng cáo biểu ngữ (Banner Ads):** Hiển thị tại chân trang hoặc mục Khám phá.
  * **Quảng cáo Video ngắn (Pre-roll / Mid-roll):** Tích hợp Google AdMob hoặc Unity Ads phát video 5-15 giây trước khi vào phim hoặc khi bấm tạm dừng.

### 6.4. Thu phí xem phim theo lượt (Pay-per-view - TVOD)
* Dành cho các bộ phim chiếu rạp mới nhất hoặc các sự kiện đặc biệt: Người dùng có thể chi trả mức phí nhỏ (15.000đ - 25.000đ) để thuê xem phim trong vòng 48 giờ.

### 6.5. Tiếp thị liên kết & Tài trợ (Affiliate & Sponsorship)
* Đặt banner giới thiệu vé xem phim tại các cụm rạp lớn (CGV, Lotte Cinema).
* Tiếp thị các sản phẩm phụ kiện xem phim tại nhà, mô hình nhân vật, đồ chơi anime để nhận hoa hồng trên từng đơn hàng.
