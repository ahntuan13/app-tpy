/* 33-settings.js – Thành viên & tỷ lệ góp vốn, User / Permission, Sao lưu & Hệ thống */
'use strict';
(self.__mods=self.__mods||[]).push('33-settings');

/* ---------- thành viên (3 anh em) ---------- */
PAGES['set/members']={t:'Thành viên & góp vốn',
  r(){
    const adm=can('admin'),tot=members().reduce((a,m)=>a+(+m.share||0),0),y=curYear();
    return `<div class="bar"><div class="sp"></div>${adm?'<button class="btn acc" data-act="mem-new">＋ Thêm thành viên</button>':''}</div>`+
    (tot!==100?`<p class="note tag-bad">Tổng tỷ lệ góp vốn đang là ${tot}%, nên điều chỉnh về 100%.</p>`:'')+
    table([{h:'Thành viên',f:m=>`<span class="mem">${memAv(m.id)}<span><b>${esc(m.name)}</b>${m.note?`<small>${esc(m.note)}</small>`:''}</span></span>`,x:m=>m.name},nc('Tỷ lệ góp vốn (%)',m=>+m.share||0),{h:'Điện thoại',f:m=>esc(m.phone||'—')},{h:'Tài khoản nhận tiền',f:m=>esc(m.bank||'—')},nc('Trưởng dự án',m=>db.projects.filter(p=>p.lead===m.id).length),nc('Việc đang mở',m=>allTasks().filter(t=>t.owner===m.id&&!t.done).length),nc(`Đang giữ (${y})`,m=>memberHeld(m.id,y),fmtMoney),actCol(m=>adm?`<button class="btn sm" data-act="mem-edit" data-id="${m.id}">Sửa</button>${db.members.length>1?` <button class="btn sm danger" data-act="mem-del" data-id="${m.id}">Xoá</button>`:''}`:'')],members(),{foot:`<tr><td>Tổng</td><td class="num">${tot}</td><td colspan="6"></td></tr>`})+
    `<p class="note">Tỷ lệ góp vốn dùng để chia lợi nhuận ở Tổng quan và Báo cáo → Chia lợi nhuận. Chỉ quản trị viên được sửa.</p>`;
  }};
function memForm(id){
  const m=id?by(db.members,id):{name:'',share:0,phone:'',bank:'',note:''};
  modal(id?'Sửa thành viên':'Thêm thành viên',`<form id="mf" data-submit="mem-save" data-id="${id||''}"><div class="fg">${inp('name','Tên',m.name,{req:1})}${inp('share','Tỷ lệ góp vốn (%)',fmtPrice(m.share||0),{req:1,attrs:'inputmode="decimal" data-num="money"'})}${inp('phone','Điện thoại',m.phone)}${inp('bank','Tài khoản nhận tiền',m.bank,{ph:'VD: VCB 0123456789'})}${txa('note','Ghi chú',m.note,{full:1})}</div></form>`,{footer:cancelBtn+'<button class="btn primary" form="mf">Lưu</button>'});
}
ACT['mem-new']=()=>memForm();ACT['mem-edit']=el=>memForm(el.dataset.id);
SUB['mem-save']=form=>{
  if(!can('admin'))return toast('Chỉ quản trị viên được sửa.','error');
  const d=fd(form),id=form.dataset.id;
  if(transact(()=>{if(!db.members.length)db.members=defaultDB().members;let m=id?by(db.members,id):null;if(!m){m={id:uid('m')};db.members.push(m)}Object.assign(m,{name:d.name.trim(),share:r2(numVN(d.share)),phone:d.phone.trim(),bank:d.bank.trim(),note:d.note.trim()})}))done();
};
ACT['mem-del']=el=>{
  const id=el.dataset.id,used=db.transactions.some(t=>t.memberId===id)||db.projects.some(p=>p.lead===id||(p.tasks||[]).some(t=>t.owner===id)||(p.phases||[]).some(x=>x.owner===id));
  if(used)return toast('Thành viên đã có giao dịch / công việc, không thể xoá. Có thể đổi tên thay vì xoá.','error');
  if(confirm('Xoá thành viên này?'))transact(()=>{db.members=db.members.filter(m=>m.id!==id)})&&done('Đã xoá');
};

/* ---------- người dùng / phân quyền ---------- */
PAGES['set/users']={t:'User / Permission',
  r(){
    const adm=can('admin');
    return `<div class="bar"><div class="sp"></div>${adm?'<button class="btn acc" data-act="user-new">＋ Thêm người dùng</button>':''}</div>`+
    table([{h:CLOUD?'Email':'Tên đăng nhập',f:u=>`<b>${esc(u.username)}</b>`},{h:'Họ tên',f:u=>esc(u.name)},{h:'Vai trò',f:u=>badge(u.role==='admin'?'bad':u.role==='member'?'info':'mute',ROLES[u.role]||u.role)},{h:'Trạng thái',f:u=>u.active?badge('ok','Đang hoạt động'):badge('mute','Đã khoá')},actCol(u=>adm?`<button class="btn sm" data-act="user-edit" data-id="${u.id}">Sửa</button>${CLOUD?` <button class="btn sm" data-act="user-reset" data-id="${u.id}" title="Gửi email đặt lại mật khẩu">Đặt lại MK</button>`:(u.id!==session.id?` <button class="btn sm danger" data-act="user-del" data-id="${u.id}">Xoá</button>`:'')}`:'')],db.users)+
    card('Phân quyền theo vai trò',miniTable(['Chức năng','Quản trị viên','Thành viên','Chỉ xem'],[['Xem dashboard, dự án, dòng tiền, báo cáo','✔','✔','✔'],['Thêm / sửa dự án, giai đoạn, công việc','✔','✔','—'],['Ghi tiền về, khoản chi','✔','✔','—'],['Tỷ lệ góp vốn, người dùng, sao lưu / khôi phục','✔','—','—']].map(r=>`<tr><td>${r[0]}</td><td class="c">${r[1]}</td><td class="c">${r[2]}</td><td class="c">${r[3]}</td></tr>`))+(CLOUD?'<p class="note">Chế độ Firebase: quyền được kiểm tra ở máy chủ bằng Firestore Security Rules (file firestore.rules).</p>':'<p class="note">Chế độ cục bộ: phân quyền chỉ giúp hạn chế thao tác nhầm trên máy này. Muốn bảo mật thật sự và dùng chung cho 3 anh em, hãy bật Firebase.</p>'));
  }};
function userForm(id){
  const u=id?by(db.users,id):{username:'',name:'',role:'member',active:true};
  modal(id?'Sửa người dùng':'Thêm người dùng',`<form id="mf" data-submit="user-save" data-id="${id||''}"><div class="fg">${CLOUD?inp('username','Email đăng nhập',u.username,{req:1,type:'email',attrs:id?'readonly':''}):inp('username','Tên đăng nhập',u.username,{req:1})}${inp('name','Họ tên',u.name,{req:1})}${sel('role','Vai trò',Object.entries(ROLES),u.role)}${CLOUD?(id?'':inp('password','Mật khẩu ban đầu (tối thiểu 6 ký tự)','',{type:'password',req:1,attrs:'minlength="6" autocomplete="new-password"'})):inp('password',id?'Mật khẩu mới (để trống nếu không đổi)':'Mật khẩu (tối thiểu 6 ký tự)','',{type:'password',req:!id,attrs:'minlength="6" autocomplete="new-password"'})}${chk('active','Cho phép đăng nhập',u.active)}</div></form>`,{footer:cancelBtn+`<button class="btn primary" form="mf">Lưu</button>`});
}
ACT['user-new']=()=>userForm();ACT['user-edit']=el=>userForm(el.dataset.id);
SUB['user-save']=form=>{
  if(CLOUD)return cloudUserSave(form);
  const d=fd(form),id=form.dataset.id,un=d.username.trim();
  if(db.users.some(x=>x.id!==id&&x.username.toLowerCase()===un.toLowerCase()))return toast('Tên đăng nhập đã tồn tại.','error');
  const ok=transact(()=>{
    let u=id?by(db.users,id):null;if(!u){u={id:uid('u')};db.users.push(u)}
    Object.assign(u,{username:un,name:d.name.trim(),role:d.role,active:!!d.active});if(d.password)u.pass=pw(d.password);
    if(!db.users.some(x=>x.role==='admin'&&x.active))throw new Error('Phải còn ít nhất một quản trị viên đang hoạt động.');
    if(u.id===session.id){if(!u.active)throw new Error('Không thể tự khoá tài khoản đang đăng nhập.');session.role=u.role;session.name=u.name}
  });
  if(ok){closeModal();shell();render(true);toast('Đã lưu')}
};
ACT['user-del']=el=>{const id=el.dataset.id;if(id===session.id)return;if(confirm('Xoá người dùng này?'))transact(()=>{db.users=db.users.filter(u=>u.id!==id);if(!db.users.some(x=>x.role==='admin'&&x.active))throw new Error('Phải còn ít nhất một quản trị viên đang hoạt động.')})&&done('Đã xoá')};

/* ---------- hệ thống / sao lưu ---------- */
PAGES['set/system']={t:'Sao lưu & Hệ thống',
  r(){
    const adm=can('admin'),kb=Math.round(JSON.stringify(db).length/1024);
    const mode=CLOUD?card('Dữ liệu dùng chung (Firebase)',`<p class="note">Đang đồng bộ theo thời gian thực với dự án <b>${esc(FBCFG.projectId)}</b>. Đăng nhập bằng: <b>${esc(session.username)}</b>. Mọi thay đổi được lưu lên Firestore và hiện ngay cho những người đang mở app.</p>${FIREBASE_CONFIG?'':'<div class="bar"><button class="btn" data-act="fb-disconnect">Ngắt kết nối Firebase (về chế độ cục bộ)</button></div>'}`):card('Dữ liệu dùng chung',`<p class="note">Hiện dữ liệu chỉ lưu trong trình duyệt này. Kết nối Firebase để 3 anh em cùng dùng một dữ liệu.</p><div class="bar"><button class="btn acc" data-act="fb-config">Kết nối Firebase</button></div>`);
    return mode+`<div class="grid g2">
    ${card('Thông tin chung',`<form data-submit="company"><div class="fg">${inp('name','Tên nhóm / công ty',db.company.name,{full:1,req:1})}${inp('note','Ghi chú (hiện trên báo cáo in)',db.company.note||'',{full:1})}<div class="f full" style="justify-content:flex-end"><button class="btn primary" ${adm?'':'disabled'}>Lưu thông tin</button></div></div></form>`)}
    ${card('Sao lưu ra file (JSON)',`<p class="note">${CLOUD?`Dữ liệu nằm trên Firebase (~${kb} KB đang tải về máy). Vẫn nên <b>xuất file sao lưu định kỳ</b>. Khôi phục từ file sẽ thay thế dữ liệu của <b>tất cả mọi người</b>.`:`Dữ liệu được lưu trong trình duyệt này (~${kb} KB). Mỗi trình duyệt / máy có dữ liệu riêng, nên hãy <b>xuất file sao lưu định kỳ</b>.`}</p><div class="bar"><button class="btn primary" data-act="backup">⬇ Xuất sao lưu (JSON)</button><button class="btn" data-act="restore" ${adm?'':'disabled'}>⬆ Khôi phục từ file</button></div>`)}
    </div>
    ${typeof cloudBackupCard==='function'?cloudBackupCard():''}
    ${card('Dữ liệu mẫu & làm mới',`<p class="note">“Nạp dữ liệu mẫu” thay toàn bộ dự án, giao dịch và thành viên bằng bộ dữ liệu demo (giữ nguyên tài khoản người dùng). “Xoá toàn bộ” đưa hệ thống về trạng thái trống.</p><div class="bar"><button class="btn" data-act="sample" ${adm?'':'disabled'}>Nạp dữ liệu mẫu</button><button class="btn danger" data-act="wipe" ${adm?'':'disabled'}>Xoá toàn bộ dữ liệu</button></div>`)}
    ${card('Tổng số bản ghi',miniTable(['Nhóm','Số lượng'],[['Dự án / App',db.projects.length],['Giai đoạn',db.projects.reduce((a,p)=>a+(p.phases||[]).length,0)],['Công việc',allTasks().length],['Giao dịch thu – chi',db.transactions.length],['Thành viên',db.members.length],['Người dùng',db.users.length]].map(([a,b])=>`<tr><td>${a}</td><td class="num">${b}</td></tr>`)))}`;
  }};
SUB.company=form=>{if(!can('admin'))return toast('Chỉ quản trị viên được sửa.','error');const d=fd(form);db.company={name:d.name.trim(),note:(d.note||'').trim()};save();shell();render(true);toast('Đã lưu')};
ACT.backup=()=>{const b=new Blob([JSON.stringify(db,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`sao-luu-du-an-3ae_${todayStr()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
ACT.restore=()=>{
  const i=document.createElement('input');i.type='file';i.accept='.json,application/json';
  i.onchange=()=>{const f=i.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{
    const p=JSON.parse(rd.result);if(!Array.isArray(p.projects)||!Array.isArray(p.transactions)||!Array.isArray(p.users))throw new Error('File không đúng định dạng sao lưu của ứng dụng.');
    if(!confirm('Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại. Tiếp tục?'))return;
    if(CLOUD)p.users=db.users;db=p;migrate();save();if(!db.users.some(u=>u.id===session.id&&u.active)){ACT.logout();toast('Đã khôi phục. Vui lòng đăng nhập lại.');return}
    shell();render(false);toast('Đã khôi phục dữ liệu');
  }catch(e){toast(e.message,'error')}};rd.readAsText(f)};i.click();
};
ACT.wipe=()=>{if(!confirm('Xoá TOÀN BỘ dự án, giai đoạn, công việc và giao dịch?'+(CLOUD?' Việc này ảnh hưởng tới TẤT CẢ người dùng.':'')+' Không thể hoàn tác. Hãy xuất sao lưu trước.'))return;const u=db.users,c=db.company,m=db.members;db=defaultDB();db.users=u;db.company=c;db.members=m.length?m:db.members;save();render(true);toast('Đã xoá dữ liệu')};
ACT.sample=()=>{if((db.projects.length||db.transactions.length)&&!confirm('Dữ liệu hiện tại sẽ bị thay thế bằng dữ liệu mẫu'+(CLOUD?' (cho TẤT CẢ người dùng)':'')+'. Tiếp tục?'))return;loadSample();render(true)};
