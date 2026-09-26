# Quản lý Dự án – 3AE

Web app quản lý các dự án / App 3 anh em cùng đầu tư: ghi nhận dự án, từng giai đoạn, phân chia công việc, tiền về – khoản chi (có / không hóa đơn), dashboard và chia lợi nhuận.
Chạy thuần trình duyệt, đưa lên GitHub Pages là dùng được. Cùng kiến trúc với app **Quản lý Kho – TTD**.

Có 2 chế độ: **cục bộ** (lưu trong trình duyệt) và **Firebase** (3 anh em dùng chung dữ liệu, đồng bộ realtime, phân quyền ở máy chủ).

## Cấu trúc thư mục

```
index.html                 Trang chính: chỉ nạp thư viện, cấu hình và các file js/ theo thứ tự
css/style.css              Toàn bộ giao diện
config/firebase-config.js  ⚙ Cấu hình Firebase – FILE DUY NHẤT cần sửa khi bật dùng chung
firestore.rules            Rules bảo mật dán vào Firebase Console
js/
  01-core-utils.js         Tiện ích chung (định dạng số tiền VND, ngày, tìm kiếm không dấu)
  02-data-model.js         Mô hình dữ liệu: thành viên, dự án, giai đoạn, công việc, thu – chi; tải/lưu
  10-ui-core.js            Menu, toast, modal, form, bảng, biểu đồ, xuất Excel / PDF / in
  11-router-auth.js        Thanh menu trái, điều hướng, đăng nhập
  20-dashboard.js          Dashboard: Tổng quan, Dòng tiền theo tháng, Tiến độ các App
  21-projects.js           Dự án / App: danh sách (theo loại hình), chi tiết, giai đoạn, công việc
  22-cashflow.js           Dòng tiền: Tiền về, Khoản chi, Sổ thu – chi, phiếu thu / chi
  23-tasks.js              Công việc: phân chia theo người, tất cả, trễ hạn
  31-reports.js            Báo cáo: theo dự án, theo tháng, có / không hóa đơn, chia lợi nhuận
  33-settings.js           Thành viên & góp vốn, User / Permission, Sao lưu & Hệ thống
  34-sample-data.js        Dữ liệu mẫu
  50-firebase-sync.js      Firebase: đăng nhập, đồng bộ realtime, quản lý người dùng
  51-cloud-backup.js       Sao lưu đám mây: tự sao lưu mỗi ngày lên Firestore, khôi phục / tải về
  99-main.js               Khởi động, kiểm tra đủ file
```

Các file `js/` được nạp **theo thứ tự số** (file sau dùng hàm của file trước). Muốn sửa chức năng nào chỉ cần mở đúng file của nó.

## Chức năng chính
- **Loại hình dự án**: Miễn phí · Trả phí có hóa đơn · Trả phí không hóa đơn. Menu Dự án có sẵn 3 danh sách lọc theo loại hình.
- **Giai đoạn** cho từng App (người phụ trách, ngày, số tiền thu theo đợt, trạng thái). Tạo dự án mới có thể tạo sẵn 5 giai đoạn mẫu.
- **Công việc**: giao cho từng người, gắn giai đoạn, hạn; bảng cột theo 3 anh em; cảnh báo trễ hạn trên menu.
- **Dòng tiền**: phiếu thu (PT-xxxx) / phiếu chi (PC-xxxx), có / không hóa đơn + số hóa đơn, người nhận / chi. Chọn dự án thì ô hóa đơn tự gợi ý theo loại hình.
- **Dashboard**: tiền về, chi ra, lợi nhuận ròng, tỷ lệ có HĐ, biểu đồ dòng tiền theo tháng, tiến độ các App, việc sắp tới hạn.
- **Chia lợi nhuận & quyết toán**: lợi nhuận ròng × tỷ lệ góp vốn, so với số tiền mỗi người đang giữ để biết ai cần chuyển cho ai.
- Xuất **Excel**, **PDF**, **In** ở mọi báo cáo; **sao lưu / khôi phục JSON**.

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub (ví dụ `quanlyduan3ae`).
2. Giải nén file zip, mở thư mục `quanlyduan-3ae`, chọn **toàn bộ** nội dung bên trong (Ctrl+A).
3. Vào repository → **Add file → Upload files** → kéo tất cả vào (kéo cả các thư mục `css`, `js`, `config`) → **Commit changes**.
4. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
5. Sau ~1 phút mở `https://<tên>.github.io/quanlyduan3ae/` và bấm Ctrl+Shift+R.

Khi cập nhật sau này, chỉ cần upload lại **file thay đổi** (kèm `index.html` vì số phiên bản `?v=` trong đó giúp trình duyệt tải bản mới).

Chế độ cục bộ đăng nhập bằng `admin` / `admin123` → Settings → Sao lưu & Hệ thống → **Nạp dữ liệu mẫu** để xem thử.

## Bật Firebase (3 anh em dùng chung dữ liệu)
Nên tạo **project Firebase riêng** cho app này, không dùng chung project `kho-ttd`.
1. https://console.firebase.google.com → Create a project (ví dụ `du-an-3ae`).
2. Trang chủ project → biểu tượng `</>` (Web) → Register app (không tick Hosting) → copy `firebaseConfig`.
3. **Security → Authentication** → Get started → Sign-in method → **Email/Password** → Enable.
4. Authentication → Settings → **Authorized domains** → thêm `<tên>.github.io`.
5. **Firestore Database** → Create database → **Standard edition** → vị trí `asia-southeast1` → **Production mode**.
6. Tab **Rules** → dán nội dung `firestore.rules` → **Publish**.
7. Dán `firebaseConfig` vào `config/firebase-config.js` (đổi tên biến thành `FIREBASE_CONFIG`), commit.
8. Mở app → **Thiết lập lần đầu** → tạo quản trị viên → Settings → User / Permission để tạo tài khoản cho 2 anh em (vai trò **Thành viên**).

## Phân quyền
| Chức năng | Quản trị viên | Thành viên | Chỉ xem |
|---|---|---|---|
| Xem dashboard, dự án, dòng tiền, báo cáo | ✔ | ✔ | ✔ |
| Thêm / sửa dự án, giai đoạn, công việc, thu – chi | ✔ | ✔ | — |
| Tỷ lệ góp vốn, người dùng, sao lưu / khôi phục | ✔ | — | — |

Với Firebase, quyền được kiểm tra ở máy chủ bằng `firestore.rules` (người chưa đăng nhập hoặc chưa được cấp quyền không đọc được dữ liệu). `apiKey` trong `firebase-config.js` là khóa công khai theo thiết kế của Firebase, bảo mật nằm ở Rules.

## Khi có lỗi
- Thanh đỏ dưới màn hình cho biết **tên file và số dòng** gây lỗi.
- Màn hình "Thiếu file chương trình" nghĩa là quên upload một file trong `js/`.
- F12 → Console để xem chi tiết.

## Sao lưu đám mây
Khi bật Firebase, app **tự động sao lưu mỗi ngày** (lần đầu một người có quyền ghi mở app trong ngày) vào Firestore, collection `backups`.
- Settings → Sao lưu & Hệ thống → **Sao lưu đám mây**: sao lưu ngay, xem danh sách, **khôi phục**, tải về JSON, xoá.
- Bản sao lưu không sửa được sau khi tạo (Rules chặn), chỉ quản trị viên xem / khôi phục / xoá. Giữ 60 bản gần nhất.
- Trước khi khôi phục, app tự tạo bản “Trước khôi phục” để có thể quay lại.
- Nhớ dán lại `firestore.rules` mới vào Firebase mỗi khi file này thay đổi.
- Nên thỉnh thoảng bấm **⬇ JSON** để giữ thêm một bản trên máy / Google Drive, phòng khi mất quyền vào project Firebase.

## Lưu ý
- Dữ liệu chế độ cục bộ nằm trong trình duyệt từng máy; hãy xuất **sao lưu JSON** định kỳ.
- Với Firebase: hai người sửa cùng một dự án cùng lúc thì người lưu sau thắng.
- Tiền tệ là VND; ô số tiền gõ được kiểu `15.000.000` hoặc phép tính (`500000/1.08`).
