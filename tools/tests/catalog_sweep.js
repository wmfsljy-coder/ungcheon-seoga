/* 장서 보충(2026-10-10): 독서로에서 분류가 비어 있는 책은 분류별 받기에 안 잡혀 장서목록에서 빠졌다(실제 약 3천 종).
   자주 쓰는 음절로 검색해 분류 없는 책을 찾아 더하고, 매달 새로 받을 때도 남긴다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-10T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
let kwCalls=0;
/* 분류 있는 책 2종(대분류 001), 분류 없는 책 3종: 코스모스(‘지’·‘김’ 둘 다에 걸림, 2권), 정의란(‘지’), 이미 있는 책(ISBN 같음) */
const UNC=[{speciesKey:"u1",title:"(청소년을 위한)코스모스",author:"칼 세이건 지음;김명남 옮김",isbn:"9788900000001",callNo:"443.1 보26ㅋ",categoryInfo:{lcode:""}},
  {speciesKey:"u1",title:"(청소년을 위한)코스모스",author:"칼 세이건 지음;김명남 옮김",isbn:"9788900000001",callNo:"443.1 보26ㅋ c.2",categoryInfo:{lcode:""}},
  {speciesKey:"u2",title:"정의란 무엇인가",author:"마이클 샌델 지음",isbn:"9788900000002",callNo:"340 샌29ㅈ",categoryInfo:{lcode:""}},
  {speciesKey:"u3",title:"이미 있는 책",author:"누구 지음",isbn:"9791100000001",callNo:"813 누",categoryInfo:{lcode:""}}];
const CATB=[{speciesKey:"c1",title:"분류 있는 책",author:"가 지음",isbn:"9791100000001",callNo:"813 가",categoryInfo:{lcode:"001",ldesc:"문학"}},
  {speciesKey:"c2",title:"분류 있는 책2",author:"나 지음",isbn:"9791100000002",callNo:"813 나",categoryInfo:{lcode:"001",ldesc:"문학"}}];
const http=reqs=>reqs.map(q=>{
  if(/category\/list/.test(q.url))return ok({categoryList:[{lCategoryCode:"001000000"}]});
  if(q.body&&q.body.categoryCode)return ok({totalCount:2,bookList:q.body.page===1?CATB:[]});
  if(q.body&&q.body.searchKeyword!=null){kwCalls++;const k=q.body.searchKeyword,pg=q.body.page;
    if(k==="지")return ok({totalCount:60,bookList:pg===1?[UNC[0],UNC[2],CATB[0]].concat(Array(47).fill(CATB[1])):[UNC[1],UNC[3]]});   /* 2쪽 */
    if(k==="김")return ok({totalCount:1,bookList:[UNC[0]]});
    return ok({totalCount:0,bookList:[]});}
  return ok({});});
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,8),hmac:s=>s,http,mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:()=>{},setMany:()=>{},setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
const C=()=>Core.make(db,env);C().maintain();
C().crawlCatalog();
must(T["장서목록"].length===2,"분류별 받기: 분류 있는 책 2종");
const r1=C().sweepCatalog(300);
const U=T["장서목록"].filter(r=>r["분야"]==="분류 없음");
must(r1.added===2&&U.length===2,"보충: 분류 없는 책 2종 더함(이미 있는 ISBN·분류 있는 책은 뺌)");
const cos=U.find(r=>/코스모스/.test(r["제목"]));
must(cos&&cos["권수"]==="2"&&cos["청구기호"]==="443.1 보26ㅋ","여러 음절에 걸려도 한 줄, 권수 2(c.2 까지)");
must(cf("장서보충").split("|")[0]==="300","다음 차례는 300번째 음절부터");
C().sweepCatalog(300);
must(T["장서목록"].filter(r=>r["분야"]==="분류 없음").length===2,"다시 돌아도 같은 책을 또 더하지 않는다");
const r3=C().sweepCatalog(300);
must(cf("장서보충").split("|")[1]==="2026-10","한 바퀴 다 돌면 이번 달은 끝(장서보충에 달 기록)");
kwCalls=0;const r4=C().sweepCatalog(300);
must(r4.done&&kwCalls===0,"이번 달에는 더 검색하지 않는다");
/* 매달 새로 받을 때 '분류 없음' 책은 남긴다 */
C().crawlCatalog();
must(T["장서목록"].length===4&&T["장서목록"].filter(r=>r["분야"]==="분류 없음").length===2,"매달 새로 받아도 분류 없는 책은 남는다(4종)");
/* 다음 달에는 처음부터 다시 */
NOW=new Date("2026-11-03T03:00:00Z");kwCalls=0;
const r5=C().sweepCatalog(100);
must(!r5.done&&kwCalls>0&&cf("장서보충").split("|")[0]==="100","다음 달에는 처음 음절부터 다시");
/* 하루 세 번 도는 일에 붙어 있다 */
db.setConf("장서목록일","2026-11-03");db.setConf("장서보충","100|2026-10");kwCalls=0;
try{C().tick();}catch(e){}
must(cf("장서보충").split("|")[0]==="220","tick 한 번에 120음절씩");
