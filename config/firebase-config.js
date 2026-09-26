/* =====================================================================
   CẤU HÌNH FIREBASE – ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA KHI BẬT DÙNG CHUNG
   - Đang để null  → chạy chế độ cục bộ (lưu trong trình duyệt, đăng nhập admin / admin123).
   - Dán khối firebaseConfig lấy từ Firebase Console vào đây (đổi tên biến thành FIREBASE_CONFIG)
     để 3 anh em dùng chung dữ liệu, đồng bộ realtime. Xem README mục "Bật Firebase".
   - Nên tạo PROJECT FIREBASE RIÊNG cho app này, không dùng chung project kho-ttd.
   ===================================================================== */
const FIREBASE_CONFIG = null;
/* Ví dụ:
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "du-an-3ae.firebaseapp.com",
  projectId: "du-an-3ae",
  storageBucket: "du-an-3ae.firebasestorage.app",
  messagingSenderId: "...",
  appId: "1:...:web:..."
};
*/
