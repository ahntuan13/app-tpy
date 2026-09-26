/* 31-reports.js – Báo cáo: theo dự án, theo tháng, có / không hóa đơn, chia lợi nhuận & quyết toán giữa 3 anh em */
'use strict';
(self.__mods=self.__mods||[]).push('31-reports');

const yearLabel=y=>y?'năm '+y:'toàn thời gian';

PAGES['rpt/project']={t:'Báo cáo theo dự án',
  sub(){return 'Phạm vi: '+yearLabel(F().year??curYear())},
  head(){F().year??=curYear();return `<div class="bar"><label class="fl">Năm ${fSel('year','Năm',yearOpts('Tất cả'))}</label>${fSel('pr','Loại hình',[['','Mọi loại hình'],...Object.entries(PRICING).map(([k,v])=>[k,v[1]])])}<div class="sp"></div>${rptBtns('bao-cao-theo-du-an')}</div>`},
  tbl(){
    const f=F(),y=f.year??curYear(),rows=db.projects.filter(p=>!f.pr||p.pricing===f.pr).map(p=>({p,s:prjStats(p,y)}));
    const T=k=>r2(rows.reduce((a,r)=>a+r.s[k],0));
    return `<div class="card"><h4>Tiền về và chi ra theo dự án (${yearLabel(y)})</h4><div class="ch"><canvas id="c1"></canvas></div></div>`+table([
      {h:'Mã',f:r=>esc(r.p.code),x:r=>r.p.code},{h:'Dự án / App',f:r=>prjLink(r.p),x:r=>r.p.name},{h:'Loại hình',f:r=>pricingBd(r.p.pricing),x:r=>PRICING[r.p.pricing]?.[1]},{h:'Trạng thái',f:r=>statusBd(r.p.status),x:r=>PSTATUS[r.p.status]?.[1]},
      nc('Tiền về có HĐ',r=>r.s.innInv,fmtMoney),nc('Tiền về không HĐ',r=>r.s.innNo,fmtMoney),nc('Tổng tiền về',r=>r.s.inn,fmtMoney),nc('Chi ra',r=>r.s.out,fmtMoney),
      {h:'Lợi nhuận ròng',c:'num',f:r=>sgn(r.s.net),x:r=>r.s.net},nc('Vốn dự kiến',r=>+r.p.budget||0,fmtMoney),{h:'Thu hồi vốn',c:'num',f:r=>r.p.budget?Math.round(r.s.net/r.p.budget*100)+'%':'—',x:r=>r.p.budget?Math.round(r.s.net/r.p.budget*100)+'%':''}
    ],rows,{empty:'Chưa có dự án nào.',foot:rows.length?`<tr><td colspan="4">Tổng</td><td class="num">${fmtMoney(T('innInv'))}</td><td class="num">${fmtMoney(T('innNo'))}</td><td class="num">${fmtMoney(T('inn'))}</td><td class="num">${fmtMoney(T('out'))}</td><td class="num">${sgn(T('net'))}</td><td></td><td></td></tr>`:''});
  },
  tm(){const f=F(),y=f.year??curYear(),rows=db.projects.filter(p=>!f.pr||p.pricing===f.pr).map(p=>({n:p.name,s:prjStats(p,y)}));
    chart('c1',{type:'bar',data:{labels:rows.map(r=>r.n.length>22?r.n.slice(0,21)+'…':r.n),datasets:[{label:'Tiền về có HĐ',data:rows.map(r=>r.s.innInv),backgroundColor:PAL[2],stack:'a'},{label:'Tiền về không HĐ',data:rows.map(r=>r.s.innNo),backgroundColor:PAL[4],stack:'a'},{label:'Chi ra',data:rows.map(r=>r.s.out),backgroundColor:PAL[0],stack:'b'}]},options:baseOpt({scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtNum(v/1e6)+' tr'}}}})})}};

PAGES['rpt/monthly']={t:'Báo cáo theo tháng',
  sub(){return 'Năm '+(F().year||curYear())},
  head(){F().year??=curYear();return `<div class="bar"><label class="fl">Năm ${fSel('year','Năm',yearOpts())}</label><div class="sp"></div>${rptBtns('bao-cao-theo-thang')}</div>`},
  tbl(){return monthTable(F().year||curYear())}};

PAGES['rpt/invoice']={t:'Báo cáo có / không hóa đơn',
  sub(){const f=F();return `${f.from?'Từ '+fmtDate(f.from):''} ${f.to?'đến '+fmtDate(f.to):''}`.trim()||'Toàn thời gian'},
  head(){return `<div class="bar">${fDate('from','Từ',curYear()+'-01-01')}${fDate('to','Đến',todayStr())}${fSel('k','Loại',[['','Thu & chi'],['in','Chỉ tiền về'],['out','Chỉ khoản chi']])}<div class="sp"></div>${rptBtns('bao-cao-hoa-don')}</div>`},
  tbl(){
    const f=F(),from=f.from??(curYear()+'-01-01'),to=f.to??todayStr();
    const list=db.transactions.filter(t=>(!from||t.date>=from)&&(!to||t.date<=to)&&(!f.k||t.kind===f.k));
    const g=(kind,inv)=>sumAmt(list.filter(t=>t.kind===kind&&(inv?t.invoice==='inv':t.invoice!=='inv')));
    const inv=list.filter(t=>t.invoice==='inv').sort(byDateDesc);
    return `<div class="kpis sm">${kpi('Tiền về có HĐ',fmtMoney(g('in',1)),'','info')}${kpi('Tiền về không HĐ',fmtMoney(g('in',0)),'','warn')}${kpi('Chi ra có HĐ',fmtMoney(g('out',1)),'đầu vào có chứng từ','info')}${kpi('Chi ra không HĐ',fmtMoney(g('out',0)),'','warn')}</div>`+
    card('Tổng hợp theo dự án',miniTable(['Dự án','Loại hình','Thu có HĐ','Thu không HĐ','Chi có HĐ','Chi không HĐ'],db.projects.map(p=>{const L=list.filter(t=>t.projectId===p.id);if(!L.length)return'';const s=(k,i)=>fmtMoney(sumAmt(L.filter(t=>t.kind===k&&(i?t.invoice==='inv':t.invoice!=='inv'))));return `<tr><td>${prjLink(p)}</td><td>${pricingBd(p.pricing)}</td><td class="num">${s('in',1)}</td><td class="num">${s('in',0)}</td><td class="num">${s('out',1)}</td><td class="num">${s('out',0)}</td></tr>`}).filter(Boolean),'Không có giao dịch trong khoảng này.'))+
    `<h4 style="margin:6px 2px 8px;font-size:14.5px">Danh sách giao dịch có hóa đơn (dùng đối chiếu kế toán)</h4>`+txTable(inv,{empty:'Không có giao dịch có hóa đơn.'});
  }};

PAGES['rpt/share']={t:'Chia lợi nhuận & quyết toán',
  sub(){return 'Phạm vi: '+yearLabel(F().year??curYear())},
  head(){F().year??=curYear();return `<div class="bar"><label class="fl">Năm ${fSel('year','Năm',yearOpts('Tất cả'))}</label>${fSel('p','Dự án',prjOpts('Tất cả dự án'))}<div class="sp"></div>${rptBtns('chia-loi-nhuan')}</div>`},
  tbl(){
    const f=F(),y=f.year??curYear();
    const txs=db.transactions.filter(t=>inYear(t,y)&&(!f.p||t.projectId===f.p));
    const inn=sumAmt(txs.filter(txIn)),out=sumAmt(txs.filter(txOut)),net=r2(inn-out),tot=members().reduce((a,m)=>a+(+m.share||0),0);
    const rows=members().map(m=>{const mt=txs.filter(t=>t.memberId===m.id);const held=r2(sumAmt(mt.filter(txIn))-sumAmt(mt.filter(txOut)));const ent=r2(net*(+m.share||0)/100);return{m,rin:sumAmt(mt.filter(txIn)),rout:sumAmt(mt.filter(txOut)),held,ent,diff:r2(held-ent)}});
    return `<div class="kpis">${kpi('Tổng tiền về',vnd(inn),'','ok')}${kpi('Tổng chi ra',vnd(out),'','warn')}${kpi('Lợi nhuận ròng để chia',vnd(net),tot!==100?`<span class="tag-bad">Tổng tỷ lệ góp vốn đang là ${tot}%</span>`:'theo tỷ lệ góp vốn','acc')}</div>`+
    table([{h:'Thành viên',f:r=>`<span class="mem">${memAv(r.m.id)}<b>${esc(r.m.name)}</b></span>`,x:r=>r.m.name},nc('Tỷ lệ góp (%)',r=>+r.m.share||0),nc('Tiền về đã nhận',r=>r.rin,fmtMoney),nc('Đã chi ra',r=>r.rout,fmtMoney),nc('Đang giữ',r=>r.held,fmtMoney),nc('Được chia',r=>r.ent,fmtMoney),{h:'Cần quyết toán',c:'num',f:r=>Math.abs(r.diff)<1?badge('ok','Đã cân'):r.diff>0?`<span class="neg">Chuyển ra ${fmtMoney(r.diff)}</span>`:`<span class="pos">Nhận thêm ${fmtMoney(-r.diff)}</span>`,x:r=>-r.diff}],rows)+
    `<p class="note"><b>Đang giữ</b> = tiền về người đó trực tiếp nhận − khoản chi người đó tự bỏ ra. <b>Được chia</b> = lợi nhuận ròng × tỷ lệ góp vốn. Người đang giữ nhiều hơn phần được chia sẽ chuyển phần chênh cho người giữ ít hơn.</p>`;
  }};
