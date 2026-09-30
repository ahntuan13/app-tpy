/* 24-intro.js – Mục "Giới thiệu sản phẩm": link trang công khai gioi-thieu/ để gửi khách (không cần đăng nhập) */
'use strict';
(self.__mods=self.__mods||[]).push('24-intro');

const introUrl=()=>new URL('gioi-thieu/',location.href.split('#')[0]).href;
PAGES['intro/share']={t:'Trang giới thiệu sản phẩm',
  r(){
    const u=introUrl();
    return `${card('Link chia sẻ cho khách hàng',`<p class="note" style="margin-top:-6px">Trang này <b>công khai</b>: khách mở link là xem được, <b>không cần đăng nhập</b> và <b>không thấy</b> dữ liệu dự án, dòng tiền hay công việc trong app. Tên khách hàng, dữ liệu thật và link các app đã được ẩn; hình minh họa dùng dữ liệu mẫu.</p>
      <div class="bar" style="margin:10px 0 0"><input class="in" id="intro-url" value="${esc(u)}" readonly style="flex:1 1 320px" aria-label="Link trang giới thiệu"><button class="btn acc" data-act="intro-copy">⧉ Sao chép link</button><a class="btn" href="${esc(u)}" target="_blank" rel="noopener">↗ Mở trang</a></div>
      <p class="note">Muốn thêm / sửa sản phẩm: sửa file <b>gioi-thieu/san-pham.js</b> trên GitHub. Muốn thay hình minh họa bằng ảnh chụp thật (đã che dữ liệu): đặt ảnh vào thư mục <b>gioi-thieu/img/</b> và điền trường <b>img</b> của sản phẩm.</p>`)}
    ${card('Xem trước',`<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden;height:70vh;min-height:420px"><iframe src="${esc(u)}" title="Trang giới thiệu 3AE" style="width:100%;height:100%;border:0;display:block" loading="lazy"></iframe></div>`)}`;
  }};
ACT['intro-copy']=async()=>{
  const el=$('#intro-url');
  try{await navigator.clipboard.writeText(el.value);toast('Đã sao chép link – dán vào Zalo / email gửi khách')}
  catch(e){el.select();toast('Nhấn Ctrl+C để sao chép link','warn')}
};
