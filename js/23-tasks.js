/* 23-tasks.js – Công việc: phân chia theo người (bảng cột), tất cả công việc, trễ hạn */
'use strict';
(self.__mods=self.__mods||[]).push('23-tasks');

const taskCard=t=>`<div class="tk ${t.done?'dn':''}"><input type="checkbox" data-act="task-done" data-p="${t.projectId}" data-t="${t.id}" ${t.done?'checked':''} ${can('write')?'':'disabled'} aria-label="Đánh dấu xong"><div style="flex:1;min-width:0"><div class="tt">${esc(t.title)}</div><div class="tm">${prjLink(t.p)}${t.phase?`<span>· ${esc(t.phase.name)}</span>`:''}${t.due?` ${badge(isLate(t)?'bad':'mute',(isLate(t)?'Trễ · ':'')+fmtDate(t.due))}`:''}</div></div>${can('write')?`<button class="btn sm" data-act="task-edit" data-p="${t.projectId}" data-id="${t.id}" aria-label="Sửa">✎</button>`:''}</div>`;

PAGES['task/board']={t:'Phân chia công việc',
  head(){return `<div class="bar">${fSel('p','Dự án',prjOpts('Tất cả dự án'))}${fSel('st','Trạng thái',[['','Việc đang mở'],['all','Cả việc đã xong']])}<div class="sp"></div>${can('write')?'<button class="btn acc" data-act="task-new">＋ Giao việc</button>':''}</div>`},
  tbl(){
    const f=F();let ts=allTasks().filter(t=>(!f.p||t.projectId===f.p)&&(f.st==='all'||!t.done));
    const cols=[...members().map(m=>[m.id,m.name]),['','Chưa giao']];
    const known=new Set(members().map(m=>m.id));
    return `<div class="board">${cols.map(([id,name])=>{const list=ts.filter(t=>id?t.owner===id:!known.has(t.owner)).sort((a,b)=>(a.done-b.done)||(a.due||'9999').localeCompare(b.due||'9999'));const late=list.filter(isLate).length;
      return `<div class="col"><h4>${id?memAv(id):''}${esc(name)}<small>${list.length} việc${late?` · <span class="tag-bad">${late} trễ</span>`:''}</small></h4>${list.length?list.map(taskCard).join(''):'<div class="note">Trống</div>'}${can('write')&&db.projects.length?`<button class="btn sm add-tk" data-act="task-new" data-owner="${id}">＋ Giao việc${id?' cho '+esc(name):''}</button>`:''}</div>`}).join('')}</div>`;
  }};

function taskTable(list){
  return table([
    {h:'',noexp:1,f:t=>`<input type="checkbox" class="cb-done" data-act="task-done" data-p="${t.projectId}" data-t="${t.id}" ${t.done?'checked':''} ${can('write')?'':'disabled'} aria-label="Đánh dấu xong">`},
    {h:'Công việc',f:t=>`<span class="tt">${esc(t.title)}</span>${t.note?`<small>${esc(t.note)}</small>`:''}`,x:t=>t.title},
    {h:'Dự án',f:t=>prjLink(t.p),x:t=>t.p.name},{h:'Giai đoạn',f:t=>esc(t.phase?.name||'—')},
    {h:'Người làm',f:t=>esc(memName(t.owner))},
    {h:'Hạn',f:t=>`<span class="${isLate(t)?'tag-bad':''}">${t.due?fmtDate(t.due):'—'}</span>`,x:t=>fmtDate(t.due)},
    {h:'Trạng thái',f:t=>t.done?badge('ok','Xong'):isLate(t)?badge('bad','Trễ hạn'):badge('info','Đang mở'),x:t=>t.done?'Xong':isLate(t)?'Trễ hạn':'Đang mở'},
    actCol(t=>can('write')?`<button class="btn sm" data-act="task-edit" data-p="${t.projectId}" data-id="${t.id}">Sửa</button>`:'')
  ],list,{empty:'Không có công việc nào.'}).replace(/<tr><td class=""><input([^>]*checked)/g,'<tr class="dn"><td class=""><input$1');
}
PAGES['task/all']={t:'Tất cả công việc',
  head(){return `<div class="bar">${fSearch('Tìm công việc…')}${fSel('p','Dự án',prjOpts('Tất cả dự án'))}${fSel('o','Người làm',[['','Mọi người'],...memOpts(),['_none','Chưa giao']])}${fSel('st','Trạng thái',[['','Đang mở'],['late','Trễ hạn'],['done','Đã xong'],['all','Tất cả']])}<div class="sp"></div><button class="btn" data-act="export" data-name="cong-viec">⬇ Excel</button>${can('write')?'<button class="btn acc" data-act="task-new">＋ Giao việc</button>':''}</div>`},
  tbl(){
    const f=F(),q=norm(f.q),st=f.st||'';
    const list=allTasks().filter(t=>(!f.p||t.projectId===f.p)&&(!f.o||(f.o==='_none'?!t.owner:t.owner===f.o))&&(st==='all'||(st==='done'?t.done:st==='late'?isLate(t):!t.done))&&(!q||norm(t.title+' '+(t.note||'')).includes(q))).sort((a,b)=>(a.done-b.done)||(a.due||'9999').localeCompare(b.due||'9999'));
    return taskTable(list);
  }};
PAGES['task/late']={t:'Công việc trễ hạn',
  r(){const list=allTasks().filter(isLate).sort((a,b)=>a.due.localeCompare(b.due));
    return `<div class="kpis">${members().map(m=>kpi(esc(m.name),list.filter(t=>t.owner===m.id).length,'việc trễ',list.some(t=>t.owner===m.id)?'bad':'ok')).join('')}</div>`+taskTable(list);}};
