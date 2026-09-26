/* 20-dashboard.js – Dashboard: Tổng quan, Dòng tiền theo tháng, Tiến độ các App */
'use strict';
(self.__mods=self.__mods||[]).push('20-dashboard');

/* ---------- khối hiển thị dùng chung ---------- */
const kpi=(l,v,s='',tone='')=>`<div class="kpi ${tone}"><div class="kl">${l}</div><div class="kv">${v}</div>${s?`<div class="ks">${s}</div>`:''}</div>`;
const card=(title,body,cls='')=>`<section class="card ${cls}">${title?`<h4>${title}</h4>`:''}${body}</section>`;
const miniTable=(heads,rows,empty='Không có dữ liệu.')=>rows.length?`<div class="tw"><table class="t"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`:`<div class="note">${empty}</div>`;
const pricingBd=k=>badge(...(PRICING[k]||PRICING.free).slice(0,2));
const statusBd=k=>badge(...(PSTATUS[k]||['mute',k||'—']));
const phaseBd=k=>badge(...(PHS[k]||PHS.todo));
const invBd=t=>t.invoice==='inv'?badge('info','Có HĐ'+(t.invoiceNo?' · '+t.invoiceNo:'')):badge('warn','Không HĐ');
const pgBar=pct=>`<div class="pgw"><div class="pg" style="flex:1"><i style="width:${pct}%"></i></div><small>${pct}%</small></div>`;
const prjLink=p=>p?`<a class="lnk" href="#/prj/${p.id}">${esc(p.name)}</a>`:'<span class="muted">(đã xoá)</span>';
const vnd=n=>`${fmtMoney(n)}<span class="cur"> ₫</span>`;
const sgn=n=>`<span class="${n>=0?'pos':'neg'}">${n>0?'+':''}${fmtMoney(n)}</span>`;
const byDateDesc=(a,b)=>(b.date||'').localeCompare(a.date||'')||((b.createdAt||0)-(a.createdAt||0));
const yearOpts=(all)=>{const ys=new Set([new Date().getFullYear()]);db.transactions.forEach(t=>t.date&&ys.add(+t.date.slice(0,4)));return[...(all?[['',all]]:[]),...[...ys].sort((a,b)=>b-a).map(v=>[String(v),String(v)])]};
const monthsOfYear=y=>Array.from({length:12},(_,i)=>`${y}-${pad(i+1)}`);
const curYear=()=>String(new Date().getFullYear());

function monthlyFlow(months){
  return months.map(mk=>{
    const txs=db.transactions.filter(t=>(t.date||'').slice(0,7)===mk);
    const inInv=sumAmt(txs.filter(t=>txIn(t)&&t.invoice==='inv')),inNo=sumAmt(txs.filter(t=>txIn(t)&&t.invoice!=='inv')),out=sumAmt(txs.filter(txOut));
    return{mk,inInv,inNo,inn:r2(inInv+inNo),out,net:r2(inInv+inNo-out),n:txs.length};
  });
}

/* ---------- Tổng quan ---------- */
PAGES['dash/overview']={t:'Tổng quan',
  head(){F().year??=curYear();return `<div class="bar"><label class="fl">Năm ${fSel('year','Năm',yearOpts())}</label><div class="sp"></div>${can('write')?'<button class="btn" data-act="tx-new" data-kind="out">＋ Khoản chi</button><button class="btn acc" data-act="tx-new" data-kind="in">＋ Ghi tiền về</button>':''}</div>`},
  tbl(){
    const y=F().year||curYear(),txs=db.transactions.filter(t=>inYear(t,y));
    const inn=sumAmt(txs.filter(txIn)),out=sumAmt(txs.filter(txOut)),net=r2(inn-out),inInv=sumAmt(txs.filter(t=>txIn(t)&&t.invoice==='inv')),inNo=r2(inn-inInv);
    const act=db.projects.filter(p=>p.status==='dev'||p.status==='live').length,late=allTasks().filter(isLate).length;
    const cnt={free:0,inv:0,noinv:0};db.projects.forEach(p=>cnt[p.pricing||'free']++);const tot=db.projects.length||1;
    const recent=[...txs].sort(byDateDesc).slice(0,7);
    const soon=allTasks().filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).slice(0,7);
    return `<div class="kpis">${kpi('Dự án / App',fmtNum(db.projects.length),`${act} đang phát triển / vận hành`)}${kpi(`Tiền về ${y}`,vnd(inn),`${txs.filter(txIn).length} khoản thu`,'ok')}${kpi(`Chi ra ${y}`,vnd(out),`${txs.filter(txOut).length} khoản chi`,'warn')}${kpi('Lợi nhuận ròng',`<span class="${net>=0?'':'neg'}">${vnd(net)}</span>`,inn?`biên lợi nhuận ${Math.round(net/inn*100)}%`:'chưa có tiền về','acc')}${kpi('Tiền về có hóa đơn',vnd(inInv),inn?Math.round(inInv/inn*100)+'% tổng tiền về':'','info')}${kpi('Tiền về không hóa đơn',vnd(inNo),inn?Math.round(inNo/inn*100)+'% tổng tiền về':'')}${kpi('Việc trễ hạn',late,late?'<a href="#/task/late">Xem danh sách</a>':'không có việc trễ',late?'bad':'ok')}</div>
    <div class="grid g2">${card(`Dòng tiền theo tháng – ${y}`,'<div class="ch"><canvas id="c1"></canvas></div>')}${card('Tiền về theo hóa đơn','<div class="ch"><canvas id="c2"></canvas></div>')}</div>
    <div class="grid g3">
      ${card('Loại hình dự án',`<div class="split">${['inv','noinv','free'].map(k=>`<i style="width:${cnt[k]/tot*100}%;background:var(--${k==='inv'?'info':k==='noinv'?'warn':'muted'})"></i>`).join('')}</div><div class="lst" style="margin-top:10px">${['inv','noinv','free'].map(k=>`<div><a href="#/prj/${k}" style="text-decoration:none">${pricingBd(k)}</a><b>${cnt[k]} dự án</b></div>`).join('')}</div>`)}
      ${card(`Chia lợi nhuận ${y}`,`<div class="lst">${members().map(m=>`<div><span class="mem">${memAv(m.id)}<span><b>${esc(m.name)}</b><small>${+m.share||0}% vốn góp</small></span></span><b class="${net>=0?'':'neg'}">${vnd(r2(net*(+m.share||0)/100))}</b></div>`).join('')}</div><p class="note"><a href="#/rpt/share">Xem quyết toán giữa 3 anh em →</a></p>`)}
      ${card('Tiến độ các App',db.projects.length?`<div class="lst">${db.projects.slice(0,6).map(p=>{const s=prjStats(p);return `<div style="display:block"><div style="display:flex;justify-content:space-between;gap:8px">${prjLink(p)}<small class="muted">${s.cur?esc(s.cur.name):(s.phases?'Hoàn tất':'Chưa chia giai đoạn')}</small></div>${pgBar(s.pct)}</div>`}).join('')}</div>`:'<div class="note">Chưa có dự án nào.</div>')}
    </div>
    <div class="grid g2">
      ${card('Giao dịch gần đây',miniTable(['Số phiếu','Ngày','Dự án / nội dung','Hóa đơn','Số tiền'],recent.map(t=>`<tr><td><button class="lnk" data-act="tx-edit" data-id="${t.id}">${esc(t.code||'—')}</button></td><td>${fmtDate(t.date)}</td><td>${prjLink(prjOf(t.projectId))}<small>${esc(t.note||'')}</small></td><td>${invBd(t)}</td><td class="num">${txIn(t)?sgn(+t.amount):sgn(-t.amount)}</td></tr>`),'Chưa có giao dịch trong năm.'))}
      ${card('Việc sắp tới hạn',miniTable(['','Công việc','Dự án','Người làm','Hạn'],soon.map(t=>`<tr><td><input type="checkbox" class="cb-done" data-act="task-done" data-p="${t.projectId}" data-t="${t.id}" ${can('write')?'':'disabled'} aria-label="Đánh dấu xong"></td><td>${esc(t.title)}</td><td>${prjLink(t.p)}</td><td>${esc(memName(t.owner))}</td><td class="${isLate(t)?'tag-bad':''}">${t.due?fmtDate(t.due)+(isLate(t)?' (trễ)':''):'—'}</td></tr>`),'Không còn việc nào đang mở.'))}
    </div>`;
  },
  tm(){
    const y=F().year||curYear(),fl=monthlyFlow(monthsOfYear(y));let run=0;const cum=fl.map(x=>(run=r2(run+x.net)));
    const lastM=y===curYear()?new Date().getMonth()+1:12;
    chart('c1',{data:{labels:fl.map(x=>'T'+(+x.mk.slice(5))),datasets:[
      {type:'line',label:'Lũy kế ròng',data:cum.map((v,i)=>i<lastM?v:null),borderColor:PAL[2],backgroundColor:PAL[2],tension:.3,pointRadius:2,order:0},
      {type:'bar',label:'Tiền về có HĐ',data:fl.map(x=>x.inInv),backgroundColor:PAL[2],stack:'in',order:1},
      {type:'bar',label:'Tiền về không HĐ',data:fl.map(x=>x.inNo),backgroundColor:PAL[4],stack:'in',order:1},
      {type:'bar',label:'Chi ra',data:fl.map(x=>x.out),backgroundColor:PAL[0],stack:'out',order:1}]},
      options:baseOpt({scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtNum(v/1e6)+' tr'}}},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmtMoney(c.raw)} ₫`}}}})});
    const txs=db.transactions.filter(t=>txIn(t)&&inYear(t,y)),a=sumAmt(txs.filter(t=>t.invoice==='inv')),b=sumAmt(txs.filter(t=>t.invoice!=='inv'));
    chart('c2',{type:'doughnut',data:{labels:['Có hóa đơn','Không hóa đơn'],datasets:[{data:[a,b],backgroundColor:[PAL[2],PAL[4]]}]},options:baseOpt({cutout:'62%',plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>` ${c.label}: ${fmtMoney(c.raw)} ₫`}}}})});
  }};

/* ---------- Dòng tiền theo tháng ---------- */
function monthTable(y){
  const fl=monthlyFlow(monthsOfYear(y));let run=0;fl.forEach(x=>x.cum=(run=r2(run+x.net)));
  const t=k=>r2(fl.reduce((a,x)=>a+x[k],0));
  const cols=[{h:'Tháng',f:r=>`${r.mk.slice(5)}/${r.mk.slice(0,4)}`},nc('Số giao dịch',r=>r.n),nc('Tiền về có HĐ',r=>r.inInv,fmtMoney),nc('Tiền về không HĐ',r=>r.inNo,fmtMoney),nc('Tổng tiền về',r=>r.inn,fmtMoney),nc('Chi ra',r=>r.out,fmtMoney),{h:'Ròng',c:'num',f:r=>sgn(r.net),x:r=>r.net},{h:'Lũy kế',c:'num',f:r=>sgn(r.cum),x:r=>r.cum}];
  return table(cols,fl,{foot:`<tr><td>Tổng</td><td class="num">${fl.reduce((a,x)=>a+x.n,0)}</td><td class="num">${fmtMoney(t('inInv'))}</td><td class="num">${fmtMoney(t('inNo'))}</td><td class="num">${fmtMoney(t('inn'))}</td><td class="num">${fmtMoney(t('out'))}</td><td class="num">${sgn(t('net'))}</td><td></td></tr>`});
}
PAGES['dash/cash']={t:'Dòng tiền theo tháng',
  head(){F().year??=curYear();return `<div class="bar"><label class="fl">Năm ${fSel('year','Năm',yearOpts())}</label><div class="sp"></div><button class="btn" data-act="export" data-name="dong-tien-theo-thang">⬇ Excel</button></div>`},
  tbl(){const y=F().year||curYear();return `<div class="card"><h4>Tiền về và chi ra năm ${y} (VND)</h4><div class="ch"><canvas id="c1"></canvas></div></div>${monthTable(y)}`},
  tm(){const y=F().year||curYear(),fl=monthlyFlow(monthsOfYear(y));
    chart('c1',{type:'bar',data:{labels:fl.map(x=>'T'+(+x.mk.slice(5))),datasets:[{label:'Tiền về',data:fl.map(x=>x.inn),backgroundColor:PAL[3]},{label:'Chi ra',data:fl.map(x=>x.out),backgroundColor:PAL[0]}]},options:baseOpt({scales:{y:{beginAtZero:true,ticks:{callback:v=>fmtNum(v/1e6)+' tr'}}}})})}};

/* ---------- Tiến độ các App ---------- */
PAGES['dash/progress']={t:'Tiến độ các App',
  head(){return `<div class="bar">${fSel('status','Trạng thái',[['','Mọi trạng thái'],...Object.entries(PSTATUS).map(([k,v])=>[k,v[1]])])}${fSel('lead','Trưởng dự án',memOpts('Mọi trưởng dự án'))}<div class="sp"></div><button class="btn" data-act="export" data-name="tien-do-app">⬇ Excel</button></div>`},
  tbl(){
    const f=F(),rows=db.projects.filter(p=>(!f.status||p.status===f.status)&&(!f.lead||p.lead===f.lead)).map(p=>({p,s:prjStats(p)}));
    return table([{h:'Mã',f:r=>esc(r.p.code),x:r=>r.p.code},{h:'Dự án / App',f:r=>prjLink(r.p),x:r=>r.p.name},{h:'Trạng thái',f:r=>statusBd(r.p.status),x:r=>PSTATUS[r.p.status]?.[1]},{h:'Trưởng dự án',f:r=>esc(memName(r.p.lead))},{h:'Tiến độ',f:r=>pgBar(r.s.pct),x:r=>r.s.pct+'%'},{h:'Giai đoạn hiện tại',f:r=>r.s.cur?`${esc(r.s.cur.name)}<small>${esc(memName(r.s.cur.owner))}${r.s.cur.end?' · hạn '+fmtDate(r.s.cur.end):''}</small>`:(r.s.phases?badge('ok','Hoàn tất'):'—'),x:r=>r.s.cur?.name||''},nc('Việc mở',r=>r.s.open),{h:'Trễ hạn',c:'num',f:r=>r.s.late?`<span class="tag-bad">${r.s.late}</span>`:'0',x:r=>r.s.late}],rows,{empty:'Chưa có dự án nào.'});
  }};
