/* 21-projects.js – Dự án / App: danh sách, chi tiết, giai đoạn, công việc (thêm / sửa / xoá) */
'use strict';
(self.__mods=self.__mods||[]).push('21-projects');

/* ---------- danh sách dự án ---------- */
function prjListPage(pricing){
  const title=pricing?PRICING[pricing][1]:'Tất cả dự án';
  return{t:pricing?`Dự án ${title.toLowerCase()}`:title,
    head(){return `<div class="bar">${fSearch('Tìm tên, mã, khách hàng…')}${fSel('status','Trạng thái',[['','Mọi trạng thái'],...Object.entries(PSTATUS).map(([k,v])=>[k,v[1]])])}${fSel('pf','Nền tảng',[['','Mọi nền tảng'],...PLATFORMS.map(x=>[x,x])])}<label class="fl">Năm ${fSel('year','Năm',yearOpts('Tất cả'))}</label><div class="sp"></div><button class="btn" data-act="export" data-name="du-an">⬇ Excel</button>${can('write')?`<button class="btn acc" data-act="prj-new" data-pricing="${pricing||''}">＋ Thêm dự án</button>`:''}</div>${pricing?`<p class="note" style="margin-top:-6px">${esc(PRICING[pricing][2])}.</p>`:''}`},
    tbl(){
      const f=F(),q=norm(f.q),y=f.year||'';
      const rows=db.projects.filter(p=>(!pricing||p.pricing===pricing)&&(!f.status||p.status===f.status)&&(!f.pf||pfList(p).includes(f.pf))&&(!q||norm(`${p.code} ${p.name} ${p.customer||''} ${pfText(p)} ${p.link||''}`).includes(q))).map(p=>({p,s:prjStats(p,y)}));
      const T=k=>r2(rows.reduce((a,r)=>a+r.s[k],0));
      return table([
        {h:'Mã',f:r=>`<span style="white-space:nowrap">${esc(r.p.code)}</span>`,x:r=>r.p.code},
        {h:'Dự án / App',f:r=>`${prjLink(r.p)}${r.p.customer?`<small>${esc(r.p.customer)}</small>`:''}`,x:r=>r.p.name},
        {h:'Nền tảng',f:r=>pfTags(r.p),x:r=>pfText(r.p)},
        {h:'Link',f:r=>linkHTML(r.p.link),x:r=>r.p.link?normUrl(r.p.link):''},
        {h:'Loại hình',f:r=>pricingBd(r.p.pricing),x:r=>PRICING[r.p.pricing]?.[1]},
        {h:'Trạng thái',f:r=>statusBd(r.p.status),x:r=>PSTATUS[r.p.status]?.[1]},
        {h:'Tiến độ',f:r=>pgBar(r.s.pct),x:r=>r.s.pct+'%'},
        nc('Tiền về',r=>r.s.inn,fmtMoney),nc('Chi ra',r=>r.s.out,fmtMoney),
        {h:'Ròng',c:'num',f:r=>sgn(r.s.net),x:r=>r.s.net},
        actCol(r=>`<a class="btn sm" href="#/prj/${r.p.id}">Mở</a>${can('write')?` <button class="btn sm" data-act="prj-edit" data-id="${r.p.id}">Sửa</button>`:''}`)
      ],rows,{empty:'Chưa có dự án nào. Bấm “＋ Thêm dự án” để bắt đầu.',foot:rows.length?`<tr><td colspan="7">Tổng ${rows.length} dự án${y?' · năm '+y:''}</td><td class="num">${fmtMoney(T('inn'))}</td><td class="num">${fmtMoney(T('out'))}</td><td class="num">${sgn(T('net'))}</td><td></td></tr>`:''});
    }};
}
PAGES['prj/list']=prjListPage('');
PAGES['prj/inv']=prjListPage('inv');
PAGES['prj/noinv']=prjListPage('noinv');
PAGES['prj/free']=prjListPage('free');
PAGES['prj/track']=prjListPage('track');

/* ---------- giai đoạn của mọi App ---------- */
PAGES['prj/phases']={t:'Giai đoạn các App',
  head(){return `<div class="bar">${fSel('p','Dự án',prjOpts('Tất cả dự án'))}${fSel('st','Trạng thái',[['','Mọi trạng thái'],...Object.entries(PHS).map(([k,v])=>[k,v[1]])])}<div class="sp"></div><button class="btn" data-act="export" data-name="giai-doan">⬇ Excel</button></div>`},
  tbl(){
    const f=F(),rows=[];db.projects.forEach(p=>(p.phases||[]).forEach((ph,i)=>rows.push({p,ph,i})));
    const list=rows.filter(r=>(!f.p||r.p.id===f.p)&&(!f.st||r.ph.status===f.st));
    return table([{h:'Dự án',f:r=>prjLink(r.p),x:r=>r.p.name},{h:'#',c:'num',f:r=>r.i+1,x:r=>r.i+1},{h:'Giai đoạn',f:r=>`<b>${esc(r.ph.name)}</b>${r.ph.note?`<small>${esc(r.ph.note)}</small>`:''}`,x:r=>r.ph.name},{h:'Bắt đầu',f:r=>fmtDate(r.ph.start)||'—'},{h:'Kết thúc',f:r=>`<span class="${r.ph.status!=='done'&&r.ph.end&&r.ph.end<todayStr()?'tag-bad':''}">${fmtDate(r.ph.end)||'—'}</span>`,x:r=>r.ph.end},nc('Thu theo đợt',r=>+r.ph.amount||0,fmtMoney),{h:'Trạng thái',f:r=>phaseBd(r.ph.status),x:r=>PHS[r.ph.status]?.[1]},actCol(r=>can('write')?`<button class="btn sm" data-act="phase-edit" data-p="${r.p.id}" data-id="${r.ph.id}">Sửa</button>`:'')],list,{empty:'Chưa có giai đoạn nào.'});
  }};

/* ---------- trang chi tiết một dự án ---------- */
function prjPage(p){return{t:p.name,
  r(){
    p=prjOf(p.id)||p;const s=prjStats(p),w=can('write'),ph=p.phases||[],tk=p.tasks||[];
    const recov=p.budget?Math.round(s.net/p.budget*100):null;
    return `<p class="note" style="padding-top:0"><a href="#/prj/list">← Tất cả dự án</a></p>
    <section class="card"><div class="hdr"><div><div class="tags">${pricingBd(p.pricing)}${statusBd(p.status)}${pfTags(p)}</div><h2>${esc(p.name)}</h2>
      <p>${esc(p.code)}${p.link?' · '+linkHTML(p.link):''}${p.customer?' · Khách hàng: '+esc(p.customer):''}${p.start?' · '+fmtDate(p.start)+(p.end?' → '+fmtDate(p.end):''):''}</p>
      ${p.description?`<p class="desc">${esc(p.description)}</p>`:''}</div>
      ${w?`<div class="acts"><button class="btn danger" data-act="prj-del" data-id="${p.id}">Xoá</button><button class="btn" data-act="prj-edit" data-id="${p.id}">Sửa thông tin</button><button class="btn" data-act="tx-new" data-kind="out" data-project="${p.id}">＋ Khoản chi</button><button class="btn acc" data-act="tx-new" data-kind="in" data-project="${p.id}">＋ Tiền về</button></div>`:''}</div></section>
    <div class="kpis">${kpi('Tiền về',vnd(s.inn),`có HĐ ${fmtMoney(s.innInv)} · không HĐ ${fmtMoney(s.innNo)}`,'ok')}${kpi('Chi ra',vnd(s.out),`${s.txs.filter(txOut).length} khoản chi`,'warn')}${kpi('Lợi nhuận ròng',`<span class="${s.net>=0?'':'neg'}">${vnd(s.net)}</span>`,recov!==null?`thu hồi ${recov}% vốn dự kiến`:'','acc')}${kpi('Vốn dự kiến',p.budget?vnd(p.budget):'—','','info')}${kpi('Tiến độ',s.pct+'%',`${s.done}/${s.phases} giai đoạn · ${s.open} việc mở`,s.late?'bad':'ok')}</div>
    <div class="grid g2">
      ${card(`Giai đoạn (${ph.length})`,(ph.length?`<div class="steps">${ph.map((x,i)=>`<div class="step ${esc(x.status)}"><span class="n">${x.status==='done'?'✓':i+1}</span><div><b>${esc(x.name)}</b><small>${x.start||x.end?(fmtDate(x.start)||'?')+' → '+(fmtDate(x.end)||'?'):'Chưa đặt ngày'}${+x.amount?' · thu '+fmtMoney(x.amount):''}${x.note?' · '+esc(x.note):''}</small></div><div class="sa"><select class="in" data-phase-st="${x.id}" data-p="${p.id}" ${w?'':'disabled'} aria-label="Trạng thái giai đoạn">${Object.entries(PHS).map(([k,v])=>`<option value="${k}" ${x.status===k?'selected':''}>${v[1]}</option>`).join('')}</select>${w?`<button class="btn sm" data-act="phase-edit" data-p="${p.id}" data-id="${x.id}">Sửa</button>`:''}</div></div>`).join('')}</div>`:'<div class="note">Chưa chia giai đoạn.</div>')+(w?`<div class="bar" style="margin:10px 0 0"><button class="btn sm" data-act="phase-new" data-p="${p.id}">＋ Thêm giai đoạn</button>${ph.length?'':`<button class="btn sm" data-act="phase-default" data-p="${p.id}">Dùng 5 giai đoạn mẫu</button>`}</div>`:''))}
      ${card(`Phân chia công việc (${s.open} mở / ${tk.length})`,miniTable(['','Công việc','Người làm','Giai đoạn','Hạn',''],[...tk].sort((a,b)=>(a.done-b.done)||(a.due||'9999').localeCompare(b.due||'9999')).map(t=>`<tr class="${t.done?'dn':''}"><td><input type="checkbox" class="cb-done" data-act="task-done" data-p="${p.id}" data-t="${t.id}" ${t.done?'checked':''} ${w?'':'disabled'} aria-label="Đánh dấu xong"></td><td><span class="tt">${esc(t.title)}</span>${t.note?`<small>${esc(t.note)}</small>`:''}</td><td>${esc(memName(t.owner))}</td><td>${esc(by(ph,t.phaseId)?.name||'—')}</td><td class="${isLate(t)?'tag-bad':''}">${t.due?fmtDate(t.due):'—'}</td><td class="act">${w?`<button class="btn sm" data-act="task-edit" data-p="${p.id}" data-id="${t.id}">Sửa</button>`:''}</td></tr>`),'Chưa có công việc.')+(w?`<div class="bar" style="margin:10px 0 0"><button class="btn sm" data-act="task-new" data-p="${p.id}">＋ Giao việc</button></div>`:''))}
    </div>
    ${card(`Dòng tiền của dự án (${s.txs.length} giao dịch)`,txTable([...s.txs].sort(byDateDesc),{noProject:1}))}`;
  }}}

/* ---------- nút chọn: nền tảng (nhiều), người làm (một) ---------- */
const pfTags=p=>pfList(p).map(x=>`<span class="pf">${esc(x)}</span>`).join('');
const pfPicker=sel=>`<div class="f full"><span>Nền tảng <small class="muted">(chọn một hoặc nhiều)</small></span><div class="pick">${PLATFORMS.map(x=>`<label class="pk"><input type="checkbox" name="pf" value="${esc(x)}" ${sel.includes(x)?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div></div>`;
const memPicker=v=>`<div class="f full"><span>Giao cho</span><div class="pick">${members().map(m=>`<label class="pk mem-pk"><input type="radio" name="owner" value="${m.id}" ${v===m.id?'checked':''}><span>${memAv(m.id)}${esc(m.name)}</span></label>`).join('')}<label class="pk"><input type="radio" name="owner" value="" ${!v?'checked':''}><span>Chưa giao</span></label></div></div>`;

/* ---------- form dự án ---------- */
function modesHTML(v){return `<div class="f full"><span>Loại hình <i>*</i></span><div class="modes">${Object.entries(PRICING).map(([k,x])=>`<label class="mode ${v===k?'on':''}"><span><input type="radio" name="pricing" value="${k}" ${v===k?'checked':''}> <b>${x[1]}</b></span><small>${x[2]}</small></label>`).join('')}</div></div>`}
document.addEventListener('change',e=>{if(e.target.name==='pricing'){$$('.mode',e.target.closest('.modes')).forEach(m=>m.classList.toggle('on',m.contains(e.target)))}});
function prjForm(id,preset){
  const p=id?prjOf(id):{name:'',link:'',platforms:[],customer:'',pricing:preset||'inv',status:'dev',start:todayStr(),end:'',budget:0,description:''};
  modal(id?'Sửa dự án':'Thêm dự án mới',`<form id="mf" data-submit="prj-save" data-id="${id||''}"><div class="fg">
    ${inp('name','Tên App / dự án',p.name,{req:1,full:1,ph:'VD: App đặt lịch spa'})}
    ${modesHTML(p.pricing)}
    ${pfPicker(pfList(p))}
    ${inp('link','Link website / app (nếu có)',p.link||'',{full:1,ph:'https://… – có thể để trống, dán vào sau',attrs:'inputmode="url" autocomplete="url"'})}
    ${inp('customer','Khách hàng / đối tác',p.customer)}${sel('status','Trạng thái',Object.entries(PSTATUS).map(([k,v])=>[k,v[1]]),p.status)}
    ${inp('start','Ngày bắt đầu',p.start,{type:'date'})}${inp('end','Dự kiến kết thúc',p.end,{type:'date'})}
    ${inp('budget','Vốn dự kiến (VND)',p.budget?fmtPrice(p.budget):'',{attrs:'inputmode="decimal" data-num="money"'})}
    ${txa('description','Mô tả ngắn',p.description,{full:1,rows:3})}
    ${id?'':chk('phases','Tạo sẵn 5 giai đoạn mẫu (Khảo sát → Thiết kế → Lập trình → Kiểm thử → Phát hành)',true)}
  </div></form>`,{footer:cancelBtn+`<button class="btn primary" form="mf">${id?'Lưu':'Tạo dự án'}</button>`,size:'mid'});
}
ACT['prj-new']=el=>prjForm('',el.dataset.pricing||'');
ACT['prj-edit']=el=>prjForm(el.dataset.id);
SUB['prj-save']=form=>{
  const d=fd(form),id=form.dataset.id;let pid=id;
  if(!d.name.trim())return toast('Nhập tên dự án.','error');
  const ok=transact(()=>{
    let p=id?prjOf(id):null;
    if(!p){p={id:uid('p'),code:nextCode('DA'),createdAt:Date.now(),phases:d.phases?DEFAULT_PHASES.map((n,i)=>({id:uid('ph')+i,name:n,status:i?'todo':'doing',start:'',end:'',amount:0,note:''})):[],tasks:[]};db.projects.unshift(p);pid=p.id}
    const pfs=new FormData(form).getAll('pf');
    Object.assign(p,{link:normUrl(d.link),name:d.name.trim(),pricing:d.pricing||'free',platforms:pfs,platform:pfs.join(' · '),customer:d.customer.trim(),status:d.status,start:d.start,end:d.end,budget:r2(evalMoney(d.budget)),description:d.description.trim(),updatedAt:Date.now()});
  });
  if(!ok)return;
  closeModal();toast(id?'Đã lưu':'Đã tạo dự án');
  if(!id)location.hash='#/prj/'+pid;else rerender();
};
ACT['prj-del']=el=>{
  const p=prjOf(el.dataset.id);if(!p)return;const n=db.transactions.filter(t=>t.projectId===p.id).length;
  if(!confirm(`Xoá dự án “${p.name}”${n?` cùng ${n} giao dịch thu – chi của nó`:''}? Không thể hoàn tác.`))return;
  if(transact(()=>{db.projects=db.projects.filter(x=>x.id!==p.id);db.transactions=db.transactions.filter(t=>t.projectId!==p.id)})){toast('Đã xoá dự án');location.hash='#/prj/list'}
};

/* ---------- form giai đoạn ---------- */
function phaseForm(pid,id){
  const p=prjOf(pid),x=id?by(p.phases,id):{name:'',status:'todo',start:'',end:'',amount:0,note:''};
  modal(id?'Sửa giai đoạn':'Thêm giai đoạn – '+p.name,`<form id="mf" data-submit="phase-save" data-p="${pid}" data-id="${id||''}"><div class="fg">
    ${inp('name','Tên giai đoạn',x.name,{req:1})}${sel('status','Trạng thái',Object.entries(PHS).map(([k,v])=>[k,v[1]]),x.status)}
    ${inp('start','Bắt đầu',x.start,{type:'date'})}${inp('end','Kết thúc',x.end,{type:'date'})}
    ${inp('amount','Số tiền thu theo đợt này (VND, nếu có)',+x.amount?fmtPrice(x.amount):'',{full:1,attrs:'inputmode="decimal" data-num="money"'})}
    ${txa('note','Ghi chú',x.note,{full:1})}</div></form>`,{footer:(id?`<button class="btn danger" data-act="phase-del" data-p="${pid}" data-id="${id}">Xoá giai đoạn</button><div class="sp"></div>`:'')+cancelBtn+`<button class="btn primary" form="mf">Lưu</button>`});
}
ACT['phase-new']=el=>phaseForm(el.dataset.p);
ACT['phase-edit']=el=>phaseForm(el.dataset.p,el.dataset.id);
ACT['phase-default']=el=>{const p=prjOf(el.dataset.p);if(transact(()=>{p.phases=DEFAULT_PHASES.map((n,i)=>({id:uid('ph')+i,name:n,status:'todo',start:'',end:'',amount:0,note:''}))}))done('Đã tạo 5 giai đoạn')};
SUB['phase-save']=form=>{
  const d=fd(form),p=prjOf(form.dataset.p),id=form.dataset.id;
  if(transact(()=>{const v={name:d.name.trim(),status:d.status,start:d.start,end:d.end,amount:r2(evalMoney(d.amount)),note:d.note.trim()};
    if(id)Object.assign(by(p.phases,id),v);else p.phases.push({id:uid('ph'),...v})}))done();
};
ACT['phase-del']=el=>{const p=prjOf(el.dataset.p),id=el.dataset.id;if(!confirm('Xoá giai đoạn này? Các công việc gắn với nó sẽ chuyển thành “không gắn giai đoạn”.'))return;
  if(transact(()=>{p.phases=p.phases.filter(x=>x.id!==id);p.tasks.forEach(t=>{if(t.phaseId===id)t.phaseId=''})}))done('Đã xoá giai đoạn')};
document.addEventListener('change',e=>{
  const el=e.target;if(!el.dataset||!el.dataset.phaseSt)return;
  const p=prjOf(el.dataset.p),x=p&&by(p.phases,el.dataset.phaseSt);if(!x)return;
  if(transact(()=>{x.status=el.value}))done('Đã cập nhật giai đoạn');
});

/* ---------- form công việc ---------- */
function taskForm(pid,id,owner){
  const p=pid?prjOf(pid):null,t=id?by(p.tasks,id):{title:'',owner:owner||'',phaseId:'',due:'',note:'',done:false};
  modal(id?'Sửa công việc':'Giao việc mới',`<form id="mf" data-submit="task-save" data-p="${pid||''}" data-id="${id||''}"><div class="fg">
    ${inp('title','Công việc',t.title,{req:1,full:1})}
    ${p?'':sel('projectId','Dự án',prjOpts(),db.projects[0]?.id,{full:1,req:1})}
    ${memPicker(t.owner)}${inp('due','Hạn hoàn thành',t.due,{type:'date'})}
    ${p?sel('phaseId','Giai đoạn',[['','Không gắn giai đoạn'],...(p.phases||[]).map(x=>[x.id,x.name])],t.phaseId,{full:1}):''}
    ${txa('note','Ghi chú',t.note,{full:1})}${id?chk('done','Đã hoàn thành',t.done):''}</div></form>`,{footer:(id?`<button class="btn danger" data-act="task-del" data-p="${pid}" data-id="${id}">Xoá việc</button><div class="sp"></div>`:'')+cancelBtn+`<button class="btn primary" form="mf">Lưu</button>`});
}
ACT['task-new']=el=>{if(!db.projects.length)return toast('Hãy tạo dự án trước.','warn');taskForm(el.dataset.p||'','',el.dataset.owner)};
ACT['task-edit']=el=>taskForm(el.dataset.p,el.dataset.id);
SUB['task-save']=form=>{
  const d=fd(form),id=form.dataset.id,p=prjOf(form.dataset.p||d.projectId);if(!p)return toast('Chọn dự án.','error');
  if(transact(()=>{const v={title:d.title.trim(),owner:d.owner,due:d.due,note:d.note.trim()};if(d.phaseId!==undefined)v.phaseId=d.phaseId;
    if(id)Object.assign(by(p.tasks,id),v,{done:!!d.done});else p.tasks.push({id:uid('t'),phaseId:'',done:false,createdAt:Date.now(),...v})}))done(id?'Đã lưu':'Đã giao việc');
};
ACT['task-del']=el=>{const p=prjOf(el.dataset.p);if(!confirm('Xoá công việc này?'))return;if(transact(()=>{p.tasks=p.tasks.filter(t=>t.id!==el.dataset.id)}))done('Đã xoá việc')};
ACT['task-done']=el=>{
  if(!can('write')){el.checked=!el.checked;return}
  const p=prjOf(el.dataset.p),t=p&&by(p.tasks,el.dataset.t);if(!t)return;
  if(transact(()=>{t.done=el.checked;t.doneAt=el.checked?Date.now():null})){rerender();toast(el.checked?'Đã hoàn thành việc':'Đã mở lại việc')}
};
