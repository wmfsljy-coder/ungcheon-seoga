/* 이달의 독후감 시상(2026-10-12 회장님): 별은 너무 크다 → 10월 시상부터 만능 도장 2주간 1개씩(모두 2개). 9월 시상은 별 그대로 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-20T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");
db.setConf("주간투표","2");   /* 실제 기본은 5표(2026-09-28). 이 시험은 시상 계산을 작게 보려고 2표로 — 5표는 e2e_school·vote_group 에서 잰다 */
db.setConf("투표묶음","");   /* 이 시험은 묶음 없는 평소 달(이레 창·달마다 시상). 묶음은 vote_group.js */
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이름":"사서","담당":"관리자","이메일":"lib@x"});
const kids=[["3101","가온"],["3102","두리"],["3103","세인"],["3104","네온"],["3105","다섯"]];
kids.forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","이메일":"s"+h+"@x","동의":"y"}));
let pid=0;
function post(hb,kind,day,title){T["글"].push({"id":"g"+(++pid),"시각":day+" 10:00:00","주":Core.weekKey(new Date(day+"T00:00:00Z"),0),
  "종류":kind,"학번":hb,"이름":"","반":"3-1","책제목":title||("책"+pid),"본문":"글 "+pid,"상태":"posted"});return "g"+pid;}
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};

db.setConf("시상탑독후감","10");db.setConf("시상별","1");
const vote=(id,day,n)=>{for(let i=0;i<n;i++)T["반응"].push({"시각":day+" 12:0"+i+":00","갈래":"투표","부문":"review","주":"","글id":id,"누구":"v"+i+id});};
/* 9월 독후감(3104) · 10월 독후감(3105) */
const g9=post("3104","review","2026-09-21","구월 독후감");vote(g9,"2026-09-22",3);
const g10=post("3105","review","2026-10-26","시월 독후감");vote(g10,"2026-10-27",3);
NOW=new Date("2026-11-03T03:00:00Z");   /* 11/3(화): 10월 시상(10/31) 뒤, 둘째 만능 도장(11/7) 전 */
let s9=st("3104"),s10=st("3105");
const aw9=(s9.awards||[]).find(x=>x.kind==="review"),aw10=(s10.awards||[]).find(x=>x.kind==="review");
must(aw9&&aw9.stars===1&&aw9.wild===0,"9월 독후감 1위: 예전대로 별 1개");
must(aw10&&aw10.stars===0&&aw10.wild===2,"10월 독후감 1위: 별 없이 만능 도장 2개");
/* 첫째는 시상 날(10/31) 다음 주 월요일(11/2), 둘째는 그다음 주(11/9) */
NOW=new Date("2026-10-31T15:30:00Z");   /* 11/1(일) 0시 30분 — 10/26 주 */
must(st("3105").week.stamps.filter(x=>x.k==="award").length===0,"시상 날이 든 주(10/26 주)에는 찍히지 않는다");
NOW=new Date("2026-11-03T03:00:00Z");
let w1=st("3105").week.stamps.filter(x=>x.k==="award");
must(w1.length===1&&/1\/2/.test(w1[0].t||""),"첫째 만능 도장(1/2)은 다음 주(11/2 주) 칸에");
NOW=new Date("2026-11-10T03:00:00Z");
let w2=st("3105").week.stamps.filter(x=>x.k==="award");
must(w2.length===1&&/2\/2/.test(w2[0].t||""),"둘째 만능 도장(2/2)은 그다음 주(11/9 주) 칸에");
NOW=new Date("2026-11-04T03:00:00Z");
must(st("3105").week.stamps.filter(x=>x.k==="award").length===1,"11/9 전에는 둘째가 미리 들어오지 않는다");
