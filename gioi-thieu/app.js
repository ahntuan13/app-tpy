/* Trang giới thiệu sản phẩm TPY – hiển thị danh sách PRODUCTS (san-pham.js) và vẽ hình minh họa giao diện bằng dữ liệu mẫu */
'use strict';
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=(seed=>()=>((seed=Math.imul(seed^seed>>>15,seed|1)+0x6d2b79f5|0)>>>0)/4294967296)(20260930);

/* ---------- các khối vẽ nhỏ ---------- */
const bars=(vals,c,h=70,gap=5,alt)=>{const w=100/vals.length;const mx=Math.max(...vals);return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="m-svg">${vals.map((v,i)=>`<rect x="${i*w+gap/2}" y="${h-v/mx*(h-4)}" width="${w-gap}" height="${v/mx*(h-4)}" rx="1.6" fill="${alt&&i%2?alt:c}" opacity="${alt?1:.35+.65*(v/mx)}"/>`).join('')}</svg>`};
const line=(vals,c,h=60,fill=true)=>{const mx=Math.max(...vals),mn=Math.min(...vals),n=vals.length-1;const pts=vals.map((v,i)=>[i/n*100,h-4-(v-mn)/(mx-mn||1)*(h-10)]);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="m-svg">${fill?`<path d="${d} L100 ${h} L0 ${h}Z" fill="${c}" opacity=".13"/>`:''}<path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`};
const txt=(w,o='')=>`<i class="m-t" style="width:${w}%;${o}"></i>`;
const kpi=(c,label,val)=>`<div class="m-kpi"><span class="m-kl">${label}</span><b style="color:${c}">${val}</b></div>`;
const chip=(t,c,bg)=>`<span class="m-chip" style="color:${c};background:${bg||c+'1f'}">${t}</span>`;
const frame=(p,title,body,side=true)=>`<div class="m-frame" style="--c:${p.color}"><div class="m-bar"><span></span><span></span><span></span><em>${esc(title)}</em></div><div class="m-body ${side?'has-side':''}">${side?`<div class="m-side">${Array.from({length:6},(_,i)=>`<i class="${i===1?'on':''}"></i>`).join('')}</div>`:''}<div class="m-main">${body}</div></div></div>`;

const MOCKS={
  dashboard:p=>frame(p,'OT Monitoring · Tháng 9',`
    <div class="m-row4">${kpi(p.color,'Tổng OT','1.284h')}${kpi('#e4570e','Vượt 45h','12')}${kpi('#dc4f47','Vượt 70h','3')}${kpi('#0e9f8b','WLB','0,82')}</div>
    <div class="m-grid2"><div class="m-card"><div class="m-ct">OT theo phòng ban</div>${bars([62,48,80,35,57,42,70],p.color)}</div>
    <div class="m-card"><div class="m-ct">Đi trễ theo tuần</div>${line([12,18,9,14,7,10,5,8],'#e4570e')}</div></div>
    <div class="m-card m-tbl">${[['Phòng A',72,'#dc4f47'],['Phòng B',51,'#e4570e'],['Phòng C',38,'#0e9f8b']].map(([n,h,c],i)=>`<div class="m-tr ${i===0?'blink':''}">${txt(26)}<span class="m-num">${h}h</span><span class="m-prog"><i style="width:${h/80*100}%;background:${c}"></i></span></div>`).join('')}</div>`),
  inventory:p=>frame(p,'Quản lý Kho · Tồn kho',`
    <div class="m-tabs"><b style="background:${p.color};color:#fff">Kho nội bộ</b><b>Kho hóa đơn</b><span class="m-btn" style="background:${p.color}">＋ Phiếu nhập</span></div>
    <div class="m-card m-tbl">${[['Laptop 14"',18,'ok'],['Màn hình 24"',6,'warn'],['Switch 24 port',0,'bad'],['UPS 1500VA',9,'ok'],['Chuột không dây',42,'ok']].map(([n,q,s])=>`<div class="m-tr"><span class="m-ico" style="background:${p.color}22;color:${p.color}">▣</span><span class="m-name">${n}</span><span class="m-num">${q}</span>${s==='ok'?chip('Còn hàng','#0e9f8b'):s==='warn'?chip('Sắp hết','#c27a12'):chip('Hết hàng','#dc4f47')}</div>`).join('')}</div>
    <div class="m-grid2"><div class="m-card"><div class="m-ct">Nhập / xuất 6 tháng</div>${bars([30,44,28,52,38,47,26,41,35,55,31,49],p.color,56,4,'#1f2544')}</div>
    <div class="m-card m-slip"><div class="m-ct">PHIẾU XUẤT KHO</div>${txt(90)}${txt(70)}${txt(80)}<div class="m-sign"><i></i><i></i><i></i></div></div></div>`),
  assets:p=>frame(p,'FA Manager · Tài sản cố định',`
    <div class="m-search"><span>⌕</span>${txt(40,'background:#cfd6e4')}</div>
    <div class="m-assets">${[['💻','Đang dùng','#0e9f8b'],['🖨','Hỏng','#dc4f47'],['📽','Đang dùng','#0e9f8b'],['🖥','Thất lạc','#c27a12'],['📷','Trong kho','#2f7de1'],['💻','Đang dùng','#0e9f8b']].map(([ic,s,c])=>`<div class="m-asset"><span class="m-aic" style="background:${p.color}18">${ic}</span>${txt(80)}${txt(55,'opacity:.6')}${chip(s,c)}</div>`).join('')}</div>
    <div class="m-card m-tbl">${['Cấp phát cho công trường','Biên bản hỏng · PDF','Thu hồi về kho'].map((t,i)=>`<div class="m-tr"><span class="m-dot" style="background:${[p.color,'#dc4f47','#2f7de1'][i]}"></span><span class="m-name">${t}</span>${i===1?chip('PDF','#dc4f47'):txt(18)}</div>`).join('')}</div>`),
  crm:p=>frame(p,'CRM · Hồ sơ khách hàng',`
    <div class="m-grid2 m-crm"><div class="m-card m-prof"><span class="m-av" style="background:linear-gradient(135deg,${p.color},#f7a8c4)">N</span><b>Khách hàng thân thiết</b>${txt(60)}<div class="m-tags">${chip('🎂 Sinh nhật 05/10',p.color)}${chip('VIP','#8a5bd1')}</div></div>
    <div class="m-card"><div class="m-ct">Liệu trình · 6/10 buổi</div><div class="m-sess">${Array.from({length:10},(_,i)=>`<i style="${i<6?`background:${p.color};border-color:${p.color}`:''}">${i<6?'✓':i+1}</i>`).join('')}</div><div class="m-ct" style="margin-top:8px">Chăm sóc sau điều trị</div>${txt(85)}${txt(65)}</div></div>
    <div class="m-grid2"><div class="m-voucher" style="--c:${p.color}"><b>GIẢM 20%</b><span>Voucher sinh nhật</span></div>
    <div class="m-card"><div class="m-ct">Khách quay lại theo tháng</div>${line([22,26,24,31,35,33,40],p.color,50)}</div></div>`),
  cashflow:p=>frame(p,'Dòng tiền · Công trình',`
    <div class="m-row4">${kpi('#0e9f6e','Thu','2,4 tỷ')}${kpi('#dc4f47','Chi','1,7 tỷ')}${kpi(p.color,'Lãi gộp','29%')}${kpi('#2f7de1','Lệnh chi chờ duyệt','4')}</div>
    <div class="m-card"><div class="m-ct">Dòng tiền 12 tháng</div><div class="m-stack">${line([20,26,24,33,30,38,42,39,47,52,50,58],p.color,62)}<div class="m-over">${line([15,19,22,21,27,25,30,33,31,36,38,40],'#dc4f47',62,false)}</div></div></div>
    <div class="m-grid2"><div class="m-card m-tbl">${[['Tạm ứng đợt 2','+450tr','#0e9f6e',chip('Có HĐ','#2f7de1')],['Vật tư ống','−120tr','#dc4f47',chip('Đã duyệt','#0e9f6e')],['Nhân công T9','−210tr','#dc4f47',chip('Chờ duyệt','#c27a12')]].map(([n,a,c,b])=>`<div class="m-tr"><span class="m-name">${n}</span>${b}<span class="m-num" style="color:${c}">${a}</span></div>`).join('')}</div>
    <div class="m-phone"><div class="m-notch"></div><div class="m-ct">Chấm công</div><div class="m-cal">${Array.from({length:28},(_,i)=>`<i style="${[5,6,12,13,19,20,26,27].includes(i)?'opacity:.25':''}${i===17?`;background:${p.color}`:''}"></i>`).join('')}</div>${chip('OCR hóa đơn ✓',p.color)}</div></div>`),
  exam:p=>frame(p,'Recruitment Test · MEP',`
    <div class="m-examhead"><div>${chip('Exercise 2 / 5',p.color)}<b>Duct size selection</b><span>Chọn kích thước ống gió</span></div><div class="m-timer" style="border-color:${p.color};color:${p.color}">24:59</div></div>
    <div class="m-grid2"><div class="m-card m-dwg"><svg viewBox="0 0 120 70" class="m-svg"><g fill="none" stroke="${p.color}" stroke-width="1.6"><path d="M8 35h40v-20h40M48 35v22h56M88 15v12"/><rect x="84" y="27" width="8" height="8"/></g><g fill="#1f2544" font-size="6" font-family="sans-serif"><text x="22" y="31">①</text><text x="64" y="12">②</text><text x="72" y="54">③</text></g></svg></div>
    <div class="m-card">${['① Lưu lượng','② Kích thước','③ Vận tốc'].map((l,i)=>`<div class="m-field"><span>${l}</span><i class="m-inp">${i===0?'1.200 m³/h':i===1?'400 × 250':''}</i></div>`).join('')}</div></div>
    <div class="m-card m-score"><span>Tự chấm điểm</span><div class="m-prog big"><i style="width:78%;background:${p.color}"></i></div><b style="color:${p.color}">78 / 100</b></div>`),
  kanban:p=>frame(p,'Quản lý Dự án · Công việc',`
    <div class="m-kan">${[['Tuấn','#6c5ce7',3],['Phúc','#0e9f8b',2],['Yến','#ec6a5e',3]].map(([n,c,k])=>`<div class="m-col"><div class="m-colh"><span style="background:${c}">${n[0]}</span>${n}</div>${Array.from({length:k},(_,i)=>`<div class="m-task">${txt(70+i*8%25)}${txt(45,'opacity:.55')}${i===0&&n==='Tuấn'?chip('Trễ hạn','#dc4f47'):chip(['App A','App B','App C'][i%3],c)}</div>`).join('')}</div>`).join('')}</div>
    <div class="m-grid2"><div class="m-card"><div class="m-ct">Tiền về có / không hóa đơn</div>${bars([30,18,42,22,36,26,48,20],p.color,50,5,'#f0a940')}</div>
    <div class="m-card"><div class="m-ct">Tiến độ các App</div>${[80,45,62].map(v=>`<div class="m-prog" style="margin:6px 0"><i style="width:${v}%;background:linear-gradient(90deg,#6c5ce7,#16b3a2)"></i></div>`).join('')}</div></div>`)
};
const shotFrame=(p,i=0,lazy=true)=>{const s=p.shots[i];return `<div class="m-frame shotf" style="--c:${p.color}"><div class="m-bar"><span></span><span></span><span></span><em>${esc(s[1])}</em></div><img class="m-img" src="${esc(s[0])}" alt="${esc(p.name)} – ${esc(s[1])}" ${lazy?'loading="lazy"':''} decoding="async"></div>`};
const mockOf=(p,i=0,lazy)=>p.shots&&p.shots.length?shotFrame(p,i,lazy):(MOCKS[p.mock]||MOCKS.dashboard)(p);

/* ---------- render ---------- */
const fields=[...new Set(PRODUCTS.map(p=>p.field))];
let filter='';
function render(){
  document.title=`${STUDIO.name} · ${STUDIO.tagline} – Sản phẩm đã triển khai`;
  $('#hero-title').textContent=STUDIO.headline;
  $('#hero-intro').textContent=STUDIO.intro;
  $('#stat-products').textContent=PRODUCTS.length;
  $('#stat-fields').textContent=fields.length;
  $('#hero-fields').innerHTML=fields.map(f=>`<span>${esc(f)}</span>`).join('');
  $('#collage').innerHTML=['ot','crm','cash'].map((id,i)=>{const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[i];return `<div class="cl cl${i}">${mockOf(p,0,false)}</div>`}).join('');
  $('#filters').innerHTML=[['','Tất cả'],...fields.map(f=>[f,f])].map(([v,l])=>`<button class="fchip" data-f="${esc(v)}" aria-pressed="${filter===v}">${esc(l)}<small>${v?PRODUCTS.filter(p=>p.field===v).length:PRODUCTS.length}</small></button>`).join('');
  const list=PRODUCTS.filter(p=>!filter||p.field===filter);
  $('#grid').innerHTML=list.map(p=>`<article class="card" style="--c:${p.color}">
    <button class="shot" data-open="${p.id}" aria-label="Xem chi tiết ${esc(p.name)}">${mockOf(p)}${p.shots&&p.shots.length>1?`<span class="nshots">🖼 ${p.shots.length} ảnh</span>`:''}</button>
    <div class="cbody">
      <div class="cmeta"><span class="field">${esc(p.field)}</span><span class="client">${esc(p.client)}</span></div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.summary)}</p>
      <div class="cstats">${p.stats.map(([a,b])=>`<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
      <div class="ctech">${p.tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <button class="more" data-open="${p.id}">Xem tính năng <span aria-hidden="true">→</span></button>
    </div></article>`).join('');
  $('#cta-text').textContent=STUDIO.cta;
  $$('.credit-text').forEach(e=>e.textContent=STUDIO.credit);
}
let curId='';
function openDetail(id){
  const p=PRODUCTS.find(x=>x.id===id);if(!p)return;curId=id;
  $('#modal').innerHTML=`<div class="ov" data-close><div class="md" role="dialog" aria-modal="true" aria-labelledby="md-title" style="--c:${p.color}">
    <button class="x" data-close aria-label="Đóng">✕</button>
    <div class="md-shot"><div id="md-main">${mockOf(p,0,false)}</div>${p.shots&&p.shots.length>1?`<div class="thumbs" role="tablist" aria-label="Ảnh giao diện">${p.shots.map((s,i)=>`<button class="th" data-shot="${i}" aria-selected="${i===0}" title="${esc(s[1])}"><img src="${esc(s[0])}" alt="" loading="lazy"><span>${esc(s[1])}</span></button>`).join('')}</div>`:''}</div>
    <div class="md-body">
      <div class="cmeta"><span class="field">${esc(p.field)}</span><span class="client">${esc(p.client)}</span></div>
      <h2 id="md-title">${esc(p.name)}</h2>
      <p class="lead">${esc(p.summary)}</p>
      <div class="prob"><b>Bài toán của khách hàng</b><p>${esc(p.problem)}</p></div>
      <h4>Tính năng chính</h4>
      <ul class="feat">${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
      <div class="ctech">${p.tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <p class="note">Ảnh chụp giao diện thật của app, chạy với <b>dữ liệu mẫu</b>: tên người, số điện thoại, số tiền đều là giả; logo và tên khách hàng đã được thay.</p>
    </div></div></div>`;
  document.body.classList.add('noscroll');
  setTimeout(()=>$('#modal .x')?.focus(),30);
}
function closeDetail(){$('#modal').innerHTML='';document.body.classList.remove('noscroll')}
document.addEventListener('click',e=>{
  const th=e.target.closest('[data-shot]');if(th){const p=PRODUCTS.find(x=>x.id===curId);if(p){$('#md-main').innerHTML=mockOf(p,+th.dataset.shot,false);$$('.th').forEach(b=>b.setAttribute('aria-selected',b===th))}return}
  const o=e.target.closest('[data-open]');if(o){openDetail(o.dataset.open);return}
  const c=e.target.closest('[data-close]');if(c&&(e.target===c||c.classList.contains('x'))){closeDetail();return}
  const f=e.target.closest('[data-f]');if(f){filter=f.dataset.f;render();$('#san-pham').scrollIntoView({behavior:'smooth',block:'start'})}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail()});
render();
const h=location.hash.slice(1);if(PRODUCTS.some(p=>p.id===h))openDetail(h);
})();
