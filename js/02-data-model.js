/* 02-data-model.js – Mô hình dữ liệu: thành viên (3 anh em), dự án/App, giai đoạn, công việc, thu – chi; tải/lưu */
'use strict';
(self.__mods=self.__mods||[]).push('02-data-model');

/* ---------- danh mục cố định ---------- */
const ROLES={admin:'Quản trị viên',member:'Thành viên',viewer:'Chỉ xem'};
/* Loại hình dự án: [màu badge, nhãn, mô tả] */
const PRICING={
  free:['mute','Miễn phí','Không thu tiền người dùng (có thể có thu nhập quảng cáo)'],
  inv:['info','Trả phí · có hóa đơn','Khách trả tiền, có xuất hóa đơn'],
  noinv:['warn','Trả phí · không hóa đơn','Khách trả tiền, không xuất hóa đơn'],
  track:['acc','Đang theo dõi','Đang tìm hiểu / theo dõi, chưa chốt hình thức thu phí']
};
/* Nền tảng: chọn bằng nút (được chọn nhiều) */
const PLATFORMS=['iOS','Android','Web','Desktop','Chrome Extension','Zalo Mini App','Backend / API','AI Agent / Bot'];
const pfList=p=>Array.isArray(p.platforms)?p.platforms:(p.platform?String(p.platform).split(/\s*[·,\/]\s*/).filter(Boolean):[]);
const pfText=p=>pfList(p).join(' · ');
const PSTATUS={idea:['mute','Ý tưởng'],dev:['info','Đang phát triển'],live:['ok','Đang vận hành'],paused:['warn','Tạm dừng'],done:['mute','Đã kết thúc']};
const PHS={todo:['mute','Chưa làm'],doing:['info','Đang làm'],done:['ok','Xong']};
const INVOICE={inv:['info','Có HĐ'],noinv:['warn','Không HĐ']};
const MEM_COLORS=['#6c5ce7','#0e9f8b','#ec6a5e','#2f7de1','#e29a2d','#d6447a'];
const DEFAULT_PHASES=['Khảo sát & yêu cầu','Thiết kế giao diện','Lập trình','Kiểm thử','Phát hành & bàn giao'];

function defaultDB(){return{
  version:1,
  seq:{DA:0,PT:0,PC:0},
  company:{name:'3AE · AI App Studio',note:''},
  users:[{id:'u_admin',username:'admin',name:'Quản trị',role:'admin',pass:pw('admin123'),active:true}],
  members:[
    {id:'m1',name:'Tuấn',phone:'',bank:'',note:''},
    {id:'m2',name:'Phúc',phone:'',bank:'',note:''},
    {id:'m3',name:'Yến',phone:'',bank:'',note:''}
  ],
  projects:[],transactions:[]
}}
function emptyCloudDB(){const d=defaultDB();d.users=[];d.members=[];return d}
let db=null, session=null;
function migrate(){const d=defaultDB();for(const k in d){if(db[k]===undefined)db[k]=d[k]}for(const k in d.seq){if(db.seq[k]===undefined)db.seq[k]=0}
  db.projects.forEach(p=>{if(!Array.isArray(p.phases))p.phases=[];if(!Array.isArray(p.tasks))p.tasks=[];if(!p.pricing)p.pricing='free';if(!Array.isArray(p.platforms))p.platforms=pfList(p)});
  /* Đổi tên mặc định cũ (Anh Hai / Anh Ba / Út) → Tuấn / Phúc / Yến; đổi tên nhóm mặc định cũ */
  const OLD={m1:['Anh Hai','Tuấn'],m2:['Anh Ba','Phúc'],m3:['Út','Yến']};
  db.members.forEach(m=>{const o=OLD[m.id];if(o&&m.name===o[0])m.name=o[1]});
  if(db.company&&db.company.name==='3AE – Đầu tư App')db.company.name='3AE · AI App Studio'}
function migrateAll(){return false}
/* Có cần ghi lại sau khi migrate không (dùng ở chế độ Firebase) */
function needsMigrate(){const OLD={m1:'Anh Hai',m2:'Anh Ba',m3:'Út'};return db.members.some(m=>OLD[m.id]===m.name)||db.company?.name==='3AE – Đầu tư App'||db.projects.some(p=>!Array.isArray(p.platforms))}
function load(){if(CLOUD){db=emptyCloudDB();migrate();return}try{const raw=localStorage.getItem(LS_KEY);db=raw?JSON.parse(raw):defaultDB()}catch(e){db=defaultDB()}migrate()}
function save(){if(CLOUD){cloudPush();return}try{localStorage.setItem(LS_KEY,JSON.stringify(db))}catch(e){toast('Không lưu được dữ liệu (bộ nhớ trình duyệt đầy?). Hãy xuất sao lưu ngay.','error')}}
/* Thực hiện thay đổi an toàn: lỗi thì trả lại dữ liệu cũ */
function transact(fn){const snap=JSON.stringify(db);try{fn();save();return true}catch(e){db=JSON.parse(snap);toast(e.message,'error');return false}}
const nextCode=(k,len=3)=>{db.seq[k]=(db.seq[k]||0)+1;return `${k}-${String(db.seq[k]).padStart(len,'0')}`};

/* ---------- truy vấn nhanh ---------- */
const by=(a,id)=>a.find(x=>x.id===id);
const nm=(arr,id,f='name')=>{const o=by(arr,id);return o?(o[f]??''):'—'};
const members=()=>db.members.length?db.members:defaultDB().members;
const memName=id=>{const m=by(members(),id);return m?m.name:'Chưa giao'};
const memColor=id=>{const i=members().findIndex(m=>m.id===id);return i>=0?MEM_COLORS[i%MEM_COLORS.length]:'#8494a8'};
const memAv=(id,cls='av')=>`<span class="${cls}" style="background:${memColor(id)}">${esc((memName(id).trim().split(/\s+/).pop()||'?').charAt(0).toUpperCase())}</span>`;
const memOpts=(blank)=>[...(blank!==undefined?[['',blank]]:[]),...members().map(m=>[m.id,m.name])];
const prjOf=id=>by(db.projects,id);
const prjName=id=>{const p=prjOf(id);return p?p.name:'(đã xoá)'};
const prjOpts=(blank)=>[...(blank!==undefined?[['',blank]]:[]),...db.projects.map(p=>[p.id,`${p.code} · ${p.name}`])];
const sumAmt=list=>r2(list.reduce((a,t)=>a+(+t.amount||0),0));
const txIn=t=>t.kind==='in', txOut=t=>t.kind==='out';
const inYear=(t,y)=>!y||(t.date||'').startsWith(String(y));

function prjStats(p,y){
  const txs=db.transactions.filter(t=>t.projectId===p.id&&inYear(t,y));
  const inn=sumAmt(txs.filter(txIn)),out=sumAmt(txs.filter(txOut));
  const innInv=sumAmt(txs.filter(t=>txIn(t)&&t.invoice==='inv'));
  const ph=p.phases||[],dn=ph.filter(x=>x.status==='done').length;
  const cur=ph.find(x=>x.status==='doing')||ph.find(x=>x.status!=='done');
  const tasks=p.tasks||[],open=tasks.filter(t=>!t.done);
  return{txs,inn,out,net:r2(inn-out),innInv,innNo:r2(inn-innInv),phases:ph.length,done:dn,pct:ph.length?Math.round(dn/ph.length*100):0,cur,
    tasks:tasks.length,open:open.length,late:open.filter(isLate).length};
}
function allTasks(){
  const o=[];db.projects.forEach(p=>(p.tasks||[]).forEach(t=>o.push({...t,projectId:p.id,p,phase:by(p.phases||[],t.phaseId)})));return o;
}
const isLate=t=>!t.done&&t.due&&t.due<todayStr();
/* Tiền đang giữ của một người = tiền về người đó nhận − khoản chi người đó bỏ ra */
function memberHeld(id,y){
  const txs=db.transactions.filter(t=>t.memberId===id&&inYear(t,y));
  return r2(sumAmt(txs.filter(txIn))-sumAmt(txs.filter(txOut)));
}
const can=a=>{const r=session?.role;return a==='admin'?r==='admin':(r==='admin'||r==='member')};
