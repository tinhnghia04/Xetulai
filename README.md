# Car4U — Demo Web Thuê Ô Tô Tự Lái (HTML/CSS/JS)
Demo giao diện end‑user theo mô tả: tìm xe → xem chi tiết → đặt xe (KYC + đặt cọc) → xác nhận.

## Cấu trúc
- `index.html` — trang chính.
- `styles.css` — giao diện mobile‑first, responsive.
- `app.js` — logic demo (không có backend).

## Chạy
Mở trực tiếp `index.html` bằng trình duyệt hiện đại (Chrome/Edge/Firefox). Không cần server.

## Tính năng nổi bật
- Tìm kiếm theo thành phố + thời gian; sắp xếp theo giá/đánh giá.
- Danh sách xe (mock data) + chi tiết xe (dialog).
- Tính tổng tạm tính theo số ngày & addons (bảo hiểm mở rộng, ghế trẻ em).
- Checkout có KYC (placeholder kiểm tra có file), chọn phương thức đặt cọc, đồng ý điều khoản.
- Chống double‑click (idempotency UI) + mô phỏng timeout/decline cổng thanh toán.
- Lưu đơn gần nhất vào `localStorage` để mô phỏng khôi phục.

> Lưu ý: Đây là demo front‑end, chưa tích hợp OCR/KYC thực, cổng thanh toán, hay quản trị xe.
