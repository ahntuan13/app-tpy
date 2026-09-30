/* =====================================================================
   DANH SÁCH SẢN PHẨM – TRANG GIỚI THIỆU 3AE
   - Muốn thêm / sửa sản phẩm: chỉ cần sửa mảng PRODUCTS bên dưới.
   - KHÔNG ghi tên khách hàng, logo, link app hay dữ liệu thật (bảo mật khách hàng).
   - mock: kiểu hình minh họa (dashboard | inventory | assets | crm | exam | cashflow | kanban)
   - img (tuỳ chọn): đường dẫn ảnh chụp màn hình đã che dữ liệu, ví dụ 'img/kho.png' → thay cho hình minh họa.
   ===================================================================== */
const STUDIO={
  name:'3AE',
  tagline:'AI App Studio',
  headline:'Biến quy trình giấy tờ, Excel thành web app chạy thật',
  intro:'3AE là nhóm 3 người làm phần mềm bằng AI. Mỗi sản phẩm dưới đây là một bài toán thật của doanh nghiệp: từ file Excel, sổ sách rời rạc, chuyển thành web app có đăng nhập, phân quyền, đồng bộ nhiều người dùng và báo cáo tự động.',
  cta:'Doanh nghiệp bạn đang quản lý bằng Excel, Zalo hay giấy tờ? Liên hệ 3AE để được xem demo trực tiếp và tư vấn một app phù hợp.',
  credit:'🔧 Developed by 3AE (chỉ dùng trong nội bộ)'
};

const PRODUCTS=[
  {
    id:'kho',
    name:'Quản lý Kho & Tài sản IT',
    field:'Kho & tài sản',
    client:'Công ty phân phối và bảo trì thiết bị IT',
    color:'#e4570e',
    mock:'inventory',
    summary:'Quản lý nhập – xuất – tồn kho vật tư và thiết bị IT theo từng số Serial, tách riêng tồn thực tế và tồn theo hóa đơn.',
    problem:'Trước đây kho được theo dõi bằng nhiều file Excel, số tồn thực tế và số trên hóa đơn thường lệch nhau, khó biết thiết bị nào đang giao cho khách nào.',
    features:[
      'Hai kho song song: Kho nội bộ (hàng thực tế) và Kho hóa đơn (theo hóa đơn đầu vào / đầu ra), xem ngay chênh lệch',
      'Lập phiếu nhập, phiếu xuất; in hoặc xuất PDF có logo, đọc số tiền bằng chữ',
      'Theo dõi thiết bị IT theo Serial: đang ở kho, đã cấp cho khách / dự án, đang sửa chữa, thanh lý',
      'Cảnh báo hết hàng, sắp hết và thiết bị sắp hết bảo hành',
      'Kiểm kê định kỳ, tự tính giá trị tồn theo giá vốn bình quân',
      'Báo cáo theo tháng, theo khách hàng / dự án, theo loại thiết bị; xuất Excel, PDF',
      'Nhập nhanh nhà cung cấp, khách hàng, tồn đầu kỳ từ file Excel',
      'Nhiều người dùng cùng lúc, phân quyền Quản trị / Thủ kho / Chỉ xem'
    ],
    tech:['Firebase realtime','Phân quyền 3 vai trò','Xuất Excel / PDF','Import Excel'],
    stats:[['2','kho song song'],['Serial','theo dõi từng thiết bị'],['PDF','phiếu in có chữ ký']]
  },
  {
    id:'fa',
    name:'Quản lý Tài sản cố định',
    field:'Kho & tài sản',
    client:'Doanh nghiệp kỹ thuật cơ điện',
    color:'#0f7b8a',
    mock:'assets',
    summary:'Sổ tài sản cố định trên web, chuyển từ một file Excel có macro, kèm ghi nhận thiết bị hỏng, thất lạc và lịch sử cấp phát.',
    problem:'Danh sách tài sản nằm trong file Excel macro nặng, chỉ một người mở được; biên bản hỏng / mất lưu rời rạc trong email.',
    features:[
      'Danh mục tài sản đầy đủ, tìm kiếm và lọc tức thì',
      'Ghi nhận thiết bị hỏng và tài sản thất lạc, đính kèm biên bản PDF',
      'Lịch sử cấp phát: ai đang giữ thiết bị nào, từ ngày nào',
      'Tra cứu tài sản theo người quản lý công trường',
      'Thư viện biểu mẫu ISO và tài liệu PDF đã tải lên',
      'Chạy dạng web tĩnh: không cần máy chủ, mở là dùng được'
    ],
    tech:['Web tĩnh, không cần server','Lưu trên trình duyệt','Đính kèm PDF'],
    stats:[['Excel → Web','chuyển đổi 1 lần'],['PDF','biên bản đính kèm'],['ISO','thư viện biểu mẫu']]
  },
  {
    id:'ot',
    name:'Theo dõi Tăng ca & Chuyên cần',
    field:'Nhân sự',
    client:'Phòng nhân sự của công ty kỹ thuật (7 phòng ban)',
    color:'#6d54e0',
    mock:'dashboard',
    summary:'Dashboard theo dõi giờ tăng ca (OT), đi trễ và chỉ số cân bằng công việc – cuộc sống của toàn công ty theo tuần, tháng, quý.',
    problem:'Tổng hợp OT và đi trễ mỗi tháng mất nhiều giờ làm tay từ file chấm công; khó phát hiện sớm nhân viên làm thêm quá mức.',
    features:[
      'Tổng hợp OT theo nhân viên, phòng ban, tuần / tháng / quý',
      'Cảnh báo nhấp nháy khi vượt ngưỡng 45 giờ và 70 giờ / tháng, OT sau 22h',
      'Tự tính đi trễ theo mốc (dưới 15 phút, từ 30 phút) từ file chấm công tải lên',
      'Chỉ số cân bằng công việc – cuộc sống (WLB = ngày nghỉ / giờ OT)',
      'So sánh giữa các phòng ban và giữa các kỳ',
      'Xuất báo cáo PDF, Excel, HTML để gửi ban giám đốc',
      'Đồng bộ dữ liệu qua Google Sheets; vẫn chạy khi mạng công ty chặn CDN'
    ],
    tech:['Google Sheets sync','Biểu đồ Chart.js','Xuất PDF / Excel','Chạy offline thư viện'],
    stats:[['45h / 70h','ngưỡng cảnh báo OT'],['WLB','chỉ số cân bằng'],['3 kỳ','tuần · tháng · quý']]
  },
  {
    id:'crm',
    name:'CRM Chăm sóc khách hàng Thẩm mỹ viện',
    field:'Khách hàng & bán hàng',
    client:'Thẩm mỹ viện',
    color:'#d6447a',
    mock:'crm',
    summary:'Quản lý hồ sơ khách hàng, liệu trình điều trị, lịch chăm sóc, sinh nhật và voucher cho thẩm mỹ viện.',
    problem:'Thông tin khách, số buổi liệu trình còn lại và lịch nhắc chăm sóc nằm trong sổ tay và tin nhắn, dễ sót khách cũ.',
    features:[
      'Hồ sơ khách hàng: lịch sử dịch vụ, liệu trình và tiến độ từng buổi',
      'Ghi nhận chăm sóc sau điều trị, nhắc lịch gọi lại',
      'Nhắc sinh nhật kèm lời chúc mẫu, phát hành và theo dõi voucher',
      'Danh mục dịch vụ, thuốc và vật tư theo nhóm, đơn vị tính',
      'Quản lý nhân sự: bác sĩ, y tá, bộ phận, mã nhân viên tự sinh',
      'Tra cứu khách nhanh bằng tên hoặc số điện thoại, bỏ dấu tiếng Việt',
      'Xuất Excel, sao lưu đám mây, nhiều người dùng đồng bộ realtime'
    ],
    tech:['Vite + JavaScript','Firebase realtime','Xuất Excel','Sao lưu đám mây'],
    stats:[['Liệu trình','theo dõi từng buổi'],['Sinh nhật','nhắc tự động'],['Voucher','phát hành & đối soát']]
  },
  {
    id:'cash',
    name:'Dòng tiền, Hóa đơn & Bảng lương',
    field:'Tài chính & kế toán',
    client:'Doanh nghiệp thi công công trình',
    color:'#0e9f6e',
    mock:'cashflow',
    summary:'Quản lý thu chi theo từng công trình, hóa đơn, lệnh chi có duyệt, chấm công và bảng lương trên một app.',
    problem:'Thu chi của nhiều công trình ghi chung một file Excel; khó biết công trình nào lãi, lỗ; lệnh chi duyệt qua tin nhắn.',
    features:[
      'Nhập thu – chi theo từng dự án / công trình, gắn hóa đơn và thông tin chuyển khoản',
      'Đọc thông tin hóa đơn bằng nhận dạng chữ (OCR), giảm gõ tay',
      'Báo cáo dòng tiền theo ngày, tháng, năm có biểu đồ',
      'Báo cáo lãi lỗ theo quý / năm, toàn công ty hoặc từng công trình',
      'Lệnh chi: tạo, duyệt theo trạng thái, in lệnh chi có chữ ký',
      'Chấm công theo ngày, tự tổng hợp bảng lương tháng; chi phí cố định hằng tháng',
      'Nhật ký hoạt động, thông báo, lưu chứng từ lên OneDrive',
      'Cài lên điện thoại như một app (PWA)'
    ],
    tech:['Firebase realtime','OCR hóa đơn','PWA cài trên điện thoại','OneDrive'],
    stats:[['P&L','lãi lỗ từng công trình'],['OCR','đọc hóa đơn'],['PWA','dùng trên điện thoại']]
  },
  {
    id:'exam',
    name:'Cổng Thi tuyển dụng Kỹ sư',
    field:'Tuyển dụng',
    client:'Công ty kỹ thuật cơ điện (MEP)',
    color:'#2f7de1',
    mock:'exam',
    summary:'Bài thi chuyên môn trực tuyến cho ứng viên kỹ sư thiết kế cơ điện, có đếm giờ, tự chấm điểm và song ngữ Việt – Anh.',
    problem:'Bài test in giấy, chấm tay, mất thời gian so đáp án và khó lưu kết quả để so sánh ứng viên.',
    features:[
      'Tài khoản ứng viên do quản trị viên cấp, mỗi người một phiên thi',
      'Đồng hồ đếm ngược, hết giờ tự động nộp bài',
      '5 phần thi chuyên môn: chọn kích thước ống, ống gió, ký hiệu bản vẽ, kỹ năng AutoCAD, kiến thức tải nhiệt',
      'Chấm tự động theo đáp án chuẩn cho các phần trắc nghiệm / điền số',
      'Trang quản trị: danh sách ứng viên, xem bài làm, chấm điểm phần tự luận',
      'Giao diện song ngữ Việt – Anh, xuất kết quả PDF'
    ],
    tech:['Song ngữ Việt – Anh','Tự chấm điểm','Đếm giờ tự nộp','Xuất PDF'],
    stats:[['5 phần','thi chuyên môn'],['Tự chấm','theo đáp án chuẩn'],['2 ngôn ngữ','Việt – Anh']]
  },
  {
    id:'pm',
    name:'Quản lý Dự án & Dòng tiền nhóm',
    field:'Quản lý dự án',
    client:'Nhóm phát triển phần mềm (sản phẩm nội bộ 3AE)',
    color:'#4f8df5',
    mock:'kanban',
    summary:'Theo dõi các App đang làm: giai đoạn, phân chia công việc cho từng thành viên, tiền về, khoản chi có / không hóa đơn và quỹ nhóm.',
    problem:'Nhiều dự án chạy song song, việc giao qua tin nhắn, tiền về và chi phí ghi rải rác nên khó biết dự án nào đang lời.',
    features:[
      'Danh sách dự án theo loại hình: có hóa đơn, không hóa đơn, miễn phí, đang theo dõi',
      'Chia giai đoạn cho từng App, theo dõi tiến độ phần trăm',
      'Bảng phân chia công việc theo từng thành viên, cảnh báo trễ hạn',
      'Phiếu thu / phiếu chi, tách tiền về có và không hóa đơn, quỹ thành viên',
      'Dashboard dòng tiền theo tháng, lợi nhuận, tồn quỹ',
      'Tự sao lưu đám mây mỗi ngày, khôi phục khi cần',
      'Phân quyền Quản trị / Thành viên / Chỉ xem, đồng bộ realtime'
    ],
    tech:['Firebase realtime','Sao lưu tự động','Phân quyền','Xuất Excel / PDF'],
    stats:[['Kanban','giao việc theo người'],['Có / không HĐ','tách dòng tiền'],['Tự sao lưu','mỗi ngày']]
  }
];
