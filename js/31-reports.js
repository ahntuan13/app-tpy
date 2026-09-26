/* 31-reports.js – Báo cáo: theo dự án, theo tháng, có / không hóa đơn */
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
      {h:'Mã',f:r=>`<span style="white-space:nowrap">${esc(r.p.code)}</span>`,x:r=>r.p.code},{h:'Dự án / App',f:r=>prjLink(r.p),x:r=>r.p.name},{h:'Loại hình',f:r=>pricingBd(r.p.pricing),x:r=>PRICING[r.p.pricing]?.[1]},{h:'Trạng thái',f:r=>statusBd(r.p.status),x:r=>PSTATUS[r.p.status]?.[1]},
      nc('Tiền về có HĐ',r=>r.s.innInv,fmtMoney),nc('Tiền về không HĐ',r=>r.s.innNo,fmtMoney),nc('Tổng tiền về',r=>r.s.inn,fmtMoney),nc('Chi ra',r=>r.s.out,fmtMoney),
      {h:'Lợi nhuận ròng',c:'num',f:r=>sgn(r.s.net),x:r=>r.s.net},nc('Vốn dự kiến',r=>+r.p.budget||0,fmtMoney),{h:'Thu hồi vốn',c:'num',f:r=>r.p.budget?Math.round(r.s.net/r.p.budget*100)+'%':'—',x:r=>r.p.budget?Math.round(r.s.net/r.p.budget*100)+'%':''}
    ],rows,{empty:'Chưa có dự án nào.',foot:rows.length?`<tr><td colspan="4">Tổng</td><td class="num">${fmtMoney(T('innInv'))}</td><td class="num">${fmtMoney(T('innNo'))}</td><td class="num">${fmtMoney(T('inn'))}</td><td class="num">${fmtMoney(T('out'))}</td><td class="num">${sgn(T('net'))}</td><td></td><td></td></tr>`:''});
  },
  tm(){const f=F(),y=f.year??curYear(),rows=db.projects.filter(p=>!f.pr||p.pricing===f.pr).map(p=>({n:p.name,s:prjStats(p,y)}));
    chart('c1',{type:'bar',data:{labels:rows.map(r=>r.n.length>22?r.n.slice(0,21)+'…':r.n),datasets:[{label:'Tiền về có HĐ',data:rows.map(r=>r.s.innInv),backgroundColor:CC.inInv,stack:'a'},{label:'Tiền về không HĐ',data:rows.map(r=>r.s.innNo),backgroundColor:CC.inNo,stack:'a'},{label:'Chi ra',data:rows.map(r=>r.s.out),backgroundColor:CC.out,stack:'b'}]},options:baseOpt({scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtNum(v/1e6)+' tr'}}}})})}};

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
