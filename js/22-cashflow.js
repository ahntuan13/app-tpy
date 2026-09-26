/* 22-cashflow.js – Dòng tiền: tiền về, khoản chi, sổ thu – chi; phiếu thu / phiếu chi có hoặc không hóa đơn */
'use strict';
(self.__mods=self.__mods||[]).push('22-cashflow');

/* Bảng giao dịch dùng chung (trang Dòng tiền, chi tiết dự án) */
function txTable(list,{noProject=false,empty='Chưa có giao dịch.'}={}){
  const w=can('write'),tin=sumAmt(list.filter(txIn)),tout=sumAmt(list.filter(txOut));
  const cols=[
    {h:'Số phiếu',f:t=>`<button class="lnk" data-act="tx-edit" data-id="${t.id}">${esc(t.code||'—')}</button>`,x:t=>t.code},
    {h:'Ngày',f:t=>fmtDate(t.date),x:t=>fmtDate(t.date)},
    ...(noProject?[]:[{h:'Dự án',f:t=>prjLink(prjOf(t.projectId)),x:t=>prjName(t.projectId)}]),
    {h:'Loại',f:t=>txIn(t)?badge('ok','Tiền về'):badge('bad','Khoản chi'),x:t=>txIn(t)?'Tiền về':'Khoản chi'},
    {h:'Nội dung',f:t=>`${esc(t.note||'')}${t.party?`<small>${txIn(t)?'Từ':'Cho'}: ${esc(t.party)}</small>`:''}`,x:t=>t.note||''},
    {h:'Hóa đơn',f:invBd,x:t=>t.invoice==='inv'?'Có HĐ '+(t.invoiceNo||''):'Không HĐ'},
    {h:'Người nhận / chi',f:t=>esc(memName(t.memberId))},
    {h:'Số tiền (VND)',c:'num',f:t=>txIn(t)?sgn(+t.amount):sgn(-t.amount),x:t=>txIn(t)?+t.amount:-t.amount},
    actCol(t=>w?`<button class="btn sm" data-act="tx-edit" data-id="${t.id}">Sửa</button> <button class="btn sm danger" data-act="tx-del" data-id="${t.id}">Xoá</button>`:'')
  ];
  return table(cols,list,{empty,foot:list.length?`<tr><td colspan="${cols.length-2}">Tiền về ${fmtMoney(tin)} · Chi ra ${fmtMoney(tout)}</td><td class="num">${sgn(r2(tin-tout))}</td><td></td></tr>`:''});
}

/* ---------- các trang dòng tiền ---------- */
function cashPage(kind){
  const T={in:'Tiền về',out:'Khoản chi',all:'Sổ thu – chi'}[kind];
  return{t:T,
    head(){return `<div class="bar">${fSearch('Tìm số phiếu, nội dung, đối tác, số HĐ…')}${fSel('p','Dự án',prjOpts('Tất cả dự án'))}${fSel('inv','Hóa đơn',[['','Có & không HĐ'],['inv','Có hóa đơn'],['noinv','Không hóa đơn']])}${fSel('m','Người nhận / chi',memOpts('Mọi người'))}${fDate('from','Từ')}${fDate('to','Đến')}<div class="sp"></div><button class="btn" data-act="export" data-name="${slug(T)}">⬇ Excel</button>${can('write')?(kind!=='in'?'<button class="btn" data-act="tx-new" data-kind="out">＋ Khoản chi</button>':'')+(kind!=='out'?'<button class="btn acc" data-act="tx-new" data-kind="in">＋ Ghi tiền về</button>':''):''}</div>`},
    tbl(){
      const f=F(),q=norm(f.q);
      const list=db.transactions.filter(t=>(kind==='all'||t.kind===kind)&&(!f.p||t.projectId===f.p)&&(!f.inv||(f.inv==='inv'?t.invoice==='inv':t.invoice!=='inv'))&&(!f.m||t.memberId===f.m)&&(!f.from||t.date>=f.from)&&(!f.to||t.date<=f.to)&&(!q||norm(`${t.code} ${t.note||''} ${t.party||''} ${t.invoiceNo||''} ${prjName(t.projectId)}`).includes(q))).sort(byDateDesc);
      const a=sumAmt(list.filter(t=>txIn(t)&&t.invoice==='inv')),b=sumAmt(list.filter(t=>txIn(t)&&t.invoice!=='inv')),c=sumAmt(list.filter(txOut));
      return `<div class="kpis sm">${kind!=='out'?kpi('Tiền về có HĐ',fmtMoney(a),'','info')+kpi('Tiền về không HĐ',fmtMoney(b),'','warn'):''}${kind!=='in'?kpi('Chi ra',fmtMoney(c),'','bad'):''}${kind==='all'?kpi('Chênh lệch',sgn(r2(a+b-c)),'','acc'):''}</div>`+txTable(list);
    }};
}
PAGES['cash/in']=cashPage('in');PAGES['cash/out']=cashPage('out');PAGES['cash/all']=cashPage('all');

/* ---------- form phiếu thu / chi ---------- */
function txForm(id,{kind='in',projectId=''}={}){
  if(!db.projects.length)return toast('Hãy tạo dự án trước khi ghi tiền.','warn');
  const t=id?by(db.transactions,id):null;
  const k=t?t.kind:kind,pid=t?t.projectId:(projectId||db.projects[0].id),p=prjOf(pid);
  const v=t||{date:todayStr(),amount:'',invoice:p&&p.pricing==='inv'?'inv':'noinv',invoiceNo:'',memberId:members()[0].id,party:p?.customer||'',note:''};
  modal(t?`Sửa ${k==='in'?'phiếu thu':'phiếu chi'} ${t.code||''}`:(k==='in'?'Ghi tiền về':'Ghi khoản chi'),`<form id="mf" data-submit="tx-save" data-id="${id||''}"><div class="fg">
    ${sel('kind','Loại',[['in','Tiền về (phiếu thu)'],['out','Khoản chi (phiếu chi)']],k)}${sel('projectId','Dự án',prjOpts(),pid,{req:1})}
    ${inp('amount','Số tiền (VND)',v.amount?fmtPrice(v.amount):'',{req:1,attrs:'inputmode="decimal" data-num="money" placeholder="VD: 15.000.000"'})}${inp('date','Ngày',v.date,{type:'date',req:1})}
    ${sel('invoice','Hóa đơn',[['inv','Có hóa đơn'],['noinv','Không hóa đơn']],v.invoice)}${inp('invoiceNo','Số hóa đơn',v.invoiceNo,{ph:'VD: 0000125'})}
    ${sel('memberId',k==='in'?'Người nhận tiền':'Người chi tiền',memOpts(),v.memberId)}${inp('party',k==='in'?'Khách hàng / nguồn tiền':'Chi cho (nhà cung cấp…)',v.party)}
    ${inp('note','Nội dung',v.note,{full:1,ph:k==='in'?'VD: Khách thanh toán đợt 2':'VD: Thuê máy chủ tháng 9'})}
  </div><p class="note">Khi chọn dự án, ô Hóa đơn tự gợi ý theo loại hình của dự án (có HĐ / không HĐ).</p></form>`,{footer:cancelBtn+`<button class="btn primary" form="mf">Lưu</button>`});
  const ps=$('#mf [name=projectId]');if(ps&&!t)ps.addEventListener('change',()=>{const q=prjOf(ps.value);if(!q)return;$('#mf [name=invoice]').value=q.pricing==='inv'?'inv':'noinv';const pa=$('#mf [name=party]');if(!pa.value&&q.customer)pa.value=q.customer});
}
ACT['tx-new']=el=>txForm('',{kind:el.dataset.kind||'in',projectId:el.dataset.project||''});
ACT['tx-edit']=el=>{if(!can('write'))return;txForm(el.dataset.id)};
SUB['tx-save']=form=>{
  const d=fd(form),id=form.dataset.id,amount=r2(evalMoney(d.amount));
  if(!(amount>0))return toast('Số tiền phải lớn hơn 0.','error');
  if(transact(()=>{
    let t=id?by(db.transactions,id):null;
    if(!t){t={id:uid('tx'),createdAt:Date.now(),createdBy:session.name};db.transactions.push(t)}
    if(!t.code||t.kind!==d.kind)t.code=nextCode(d.kind==='in'?'PT':'PC',4);
    Object.assign(t,{kind:d.kind,projectId:d.projectId,amount,date:d.date,invoice:d.invoice,invoiceNo:d.invoice==='inv'?d.invoiceNo.trim():'',memberId:d.memberId,party:d.party.trim(),note:d.note.trim(),updatedAt:Date.now(),updatedBy:session.name});
  }))done(id?'Đã lưu':(d.kind==='in'?'Đã ghi tiền về':'Đã ghi khoản chi'));
};
ACT['tx-del']=el=>{const t=by(db.transactions,el.dataset.id);if(!t)return;if(!confirm(`Xoá ${t.kind==='in'?'phiếu thu':'phiếu chi'} ${t.code||''} – ${fmtMoney(t.amount)} VND?`))return;
  if(transact(()=>{db.transactions=db.transactions.filter(x=>x.id!==t.id)}))done('Đã xoá giao dịch')};
