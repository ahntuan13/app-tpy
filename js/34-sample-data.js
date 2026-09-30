/* 34-sample-data.js – Nạp dữ liệu mẫu (4 App, 14 giao dịch) để xem thử */
'use strict';
(self.__mods=self.__mods||[]).push('34-sample-data');

function loadSample(){
  const u=db.users,c=db.company;db=defaultDB();db.users=u;db.company=c;
  const PH=list=>list.map(([name,status,owner,s,e,amount=0],i)=>({id:uid('ph')+i,name,status,start:s?dAgo(s):'',end:e!==null&&e!==undefined?(e<0?addDays(todayStr(),-e):dAgo(e)):'',amount,note:''}));
  const TK=list=>list.map(([title,owner,due,done=false])=>({id:uid('t'),title,owner,due:due===null?'':(due<0?addDays(todayStr(),-due):dAgo(due)),done,phaseId:'',note:''}));
  const P=(o)=>{const p={id:uid('p'),code:nextCode('DA'),createdAt:Date.now()-db.projects.length*1000,...o};db.projects.push(p);return p};
  const spa=P({name:'App Đặt Lịch Spa',platforms:['iOS','Android'],customer:'Chuỗi spa Hoa Sen',pricing:'inv',status:'live',start:dAgo(230),end:dAgo(50),budget:120000000,description:'Ứng dụng đặt lịch, nhắc hẹn và tích điểm cho chuỗi spa. Khách lấy hóa đơn VAT theo từng đợt thanh toán.',
    phases:PH([['Khảo sát & yêu cầu','done','m1',230,210,36000000],['Thiết kế giao diện','done','m3',209,180],['Lập trình','done','m2',179,90,48000000],['Kiểm thử','done','m3',89,60],['Bàn giao & bảo trì năm đầu','doing','m2',55,-310,36000000]]),
    link:'https://spa-hoasen.vn',tasks:TK([['Cập nhật màn hình tích điểm','m2',-9],['Gửi báo cáo lượt đặt lịch tháng này','m1',-4],['Xuất hóa đơn đợt bảo trì quý','m1',6]])});
  const ns=P({name:'Web Bán Nông Sản',platforms:['Web'],customer:'HTX Đồng Tháp Xanh',pricing:'noinv',status:'dev',start:dAgo(115),end:'',budget:60000000,description:'Trang bán hàng cho hợp tác xã, thanh toán chuyển khoản, khách không lấy hóa đơn.',
    phases:PH([['Khảo sát & yêu cầu','done','m2',115,100],['Thiết kế giao diện','done','m3',99,78],['Lập trình','doing','m2',77,-20],['Kiểm thử','todo','m3',null,-35],['Phát hành & bàn giao','todo','m1',null,-45]]),
    link:'nongsandongthap.com',tasks:TK([['Tích hợp giỏ hàng & mã giảm giá','m2',-14],['Chụp ảnh sản phẩm mẫu','m3',-6],['Chốt giao diện trang chủ','m3',78,true],['Viết nội dung trang giới thiệu','',null]])});
  const tv=P({name:'App Học Từ Vựng',platforms:['Android'],customer:'',pricing:'free',status:'live',start:dAgo(265),end:'',budget:25000000,description:'App miễn phí cho người dùng, có thu nhập nhỏ từ quảng cáo.',
    phases:PH([['Thiết kế giao diện','done','m3',265,240],['Lập trình','done','m2',239,180],['Phát hành','done','m1',179,170],['Tăng người dùng','doing','m3',169,-95]]),
    tasks:TK([['Thêm bộ từ vựng IELTS','m3',-24],['Trả lời đánh giá trên cửa hàng','',null]])});
  const kho=P({name:'Quản Lý Kho Mini',platforms:['Web','Desktop'],customer:'Cửa hàng vật tư Minh Phát',pricing:'inv',status:'idea',start:dAgo(11),end:'',budget:80000000,description:'Phần mềm nhập – xuất kho cho cửa hàng vật tư, đang báo giá.',
    phases:PH([['Khảo sát & yêu cầu','doing','m1',11,-9],['Báo giá & ký hợp đồng','todo','m1',null,-19]]),
    tasks:TK([['Gửi báo giá cho khách','m1',2]])});
  const bot=P({name:'Chatbot CSKH bằng AI',platforms:['AI Agent / Bot','Zalo Mini App'],customer:'Nha khoa Nụ Cười',pricing:'track',status:'idea',start:dAgo(6),end:'',budget:0,description:'Chatbot trả lời khách và đặt lịch qua Zalo, đang demo cho khách xem thử, chưa chốt giá.',
    phases:PH([['Làm demo với dữ liệu mẫu','doing',null,6,-4],['Khách dùng thử 2 tuần','todo',null,null,-18]]),
    tasks:TK([['Huấn luyện bot với bảng giá dịch vụ','m3',-3],['Hẹn lịch demo với khách','m2',-1]])});
  const T=(p,kind,amount,ago,invoice,memberId,note,invoiceNo='')=>db.transactions.push({id:uid('tx'),code:nextCode(kind==='in'?'PT':'PC',4),kind,projectId:p.id,amount,date:dAgo(ago),invoice,invoiceNo,memberId,party:kind==='in'?p.customer:'',note,createdAt:Date.now(),createdBy:'Dữ liệu mẫu'});
  T(spa,'in',36000000,218,'inv','m1','Tạm ứng 30% hợp đồng','0000125');
  T(spa,'out',4800000,195,'noinv','m3','Mua bộ icon & font');
  T(spa,'in',48000000,140,'inv','m1','Thanh toán đợt 2','0000161');
  T(spa,'out',2500000,116,'inv','m2','Tài khoản Apple Developer','AP-2026');
  T(spa,'in',36000000,52,'inv','m1','Nghiệm thu & bàn giao','0000207');
  T(spa,'out',1200000,25,'inv','m2','Máy chủ tháng này','VN-0921');
  T(ns,'in',20000000,113,'noinv','m2','Tạm ứng khởi động');
  T(ns,'in',15000000,45,'noinv','m2','Thanh toán sau thiết kế');
  T(ns,'out',3000000,37,'noinv','m3','Thuê chụp ảnh sản phẩm');
  T(tv,'out',650000,180,'noinv','m1','Phí Google Play');
  T(tv,'in',1850000,88,'noinv','m3','Doanh thu quảng cáo quý trước');
  T(tv,'out',2000000,73,'noinv','m3','Chạy quảng cáo tăng lượt tải');
  T(tv,'in',2400000,1,'noinv','m3','Doanh thu quảng cáo quý này');
  T(kho,'out',500000,8,'noinv','m1','Gặp khách khảo sát');
  const fund={id:FUND,customer:''},other={id:OTHER,customer:''};
  T(fund,'in',10000000,240,'noinv','m1','Tuấn đóng quỹ đầu kỳ');T(fund,'in',10000000,240,'noinv','m2','Phúc đóng quỹ đầu kỳ');T(fund,'in',10000000,240,'noinv','m3','Yến đóng quỹ đầu kỳ');
  T(other,'out',5400000,200,'noinv','m1','Gói Claude / ChatGPT / Cursor dùng chung (năm)');T(other,'out',1200000,30,'inv','m2','Tên miền & hosting chung','HD-2231');
  save();toast('Đã nạp dữ liệu mẫu');
}
