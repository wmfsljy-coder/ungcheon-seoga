const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]===\"로그인방식\")r[1]=\"구글\";});");
let NOW=new Date("2026-09-21T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
T["문장"]=Core.QUOTES.slice(0,52).map(q=>({"문장":q[0],"출처":q[1],"종류":q[2],"숨김":""}));
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const TOP=["우정","기억","바다","용기","도시","시간","가족","숲","별","편지","전쟁","음악","요리","로봇","우주","식물","고양이","철도","섬","시장"];
const http=reqs=>reqs.map(q=>{
  if(/category\/list/.test(q.url))return ok({categoryList:Core.GENRES.map(g=>({lCategoryCode:g[0]}))});
  if(/detail\/info\/isbn/.test(q.url)){const n=Number(/isbn=(\d+)/.exec(q.url)[1].slice(-6));const t=TOP[n%20],u=TOP[(n*7+3)%20];
    return ok({description:"예시 책 소개입니다. 주인공은 "+t+"에 얽힌 오래된 비밀을 따라가며 한 해 동안 조금씩 달라진다. 끝에서 밝혀지는 진실은 "+u+"에 대한 생각을 바꾸게 만든다.",keywordList:[t,u,"예시"+n]});}
  if(q.body&&q.body.categoryCode){const g=q.body.categoryCode.slice(0,3),pg=q.body.page;
    return ok({totalCount:q.body.display===1?700:300,bookList:Array.from({length:50},(_,k)=>({bookKey:"k"+g+pg+k,title:"책"+g+"-"+pg+"-"+String.fromCharCode(44032+k),author:"지은이"+g+pg+k+" 지음",pubFormCode:"MA",appendixYn:"N",pubYear:"2020",
      isbn:"979"+String(1e9+Number(g)*10000+pg*100+k),callNo:(100+(Number(g)*37+k*11)%800)+".6 가"+k+" c.2",categoryInfo:{mcode:g+"00"+(k%3)+"000",mdesc:"중분류"+(k%3)}}))});}
  if(q.body){const t=q.body.searchKeyword;return ok({totalCount:/^책/.test(t)?1:0,bookList:/^책/.test(t)?[{bookKey:"z"+t,title:t,author:"지은이 지음",callNo:"813.6 가1",isbn:""}]:[]});}
  return ok({status:"대출가능"});});
const env={now:()=>NOW,email:()=>"lib@x",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"});
T["명단"].push({"학번":"30201","이름":"김","반":"3-2","이메일":"s@x","동의":"y"});
const C=()=>Core.make(db,env);
/* 장서목록 시트(2026-09-20): 독서로 대분류 모든 쪽 → 같은 책(speciesKey)끼리 묶어 권수 */
db.replace=(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
let calls=0;const http0=env.http;env.http=reqs=>{calls+=reqs.length;return reqs.map(q=>{
  if(q.body&&q.body.categoryCode){const g=q.body.categoryCode.slice(0,3),pg=q.body.page;if(q.body.display===1)return http0([q])[0];
    return ok({totalCount:120,bookList:Array.from({length:pg<3?50:20},(_,k)=>({speciesKey:"s"+g+"-"+(k%25),title:"책"+g+"-"+(k%25),author:"지은이"+k%25,publisher:"출판",pubYear:"2021",
      isbn:"9791100000"+String(k%25).padStart(3,"0"),callNo:"813.6 가"+(k%25)+" c."+(pg*100+k),locationName:"자료실",categoryInfo:{ldesc:"분류"+g,mdesc:"중"+g}}))});}
  return http0([q])[0];});};
C().tick();
const S=T["장서목록"],cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
must(S.length===Core.GENRES.length*25,"장서목록 "+S.length+"종(대분류 "+Core.GENRES.length+" × 25)");
const tot=S.reduce((a,r)=>a+Number(r["권수"]),0);must(tot===120*Core.GENRES.length&&S[0]["권수"]==="5","권수 합 "+tot+"권 = 모든 쪽을 받음(첫 종 "+S[0]["권수"]+"권)");
must(!/c\./.test(S[0]["청구기호"])&&S[0]["분야"]&&S[0]["자료실"]==="자료실","청구기호에서 복본 번호 뗌: "+S[0]["청구기호"]+" · 분야 "+S[0]["분야"]);
must(cf("장서목록일")==="2026-09-21"&&cf("장서종")===String(S.length)&&cf("장서")===String(120*Core.GENRES.length),"설정: 장서목록일 "+cf("장서목록일")+" · 장서 "+cf("장서")+"권");
calls=0;NOW=new Date("2026-09-22T01:00:00Z");C().tick();must(calls<60,"같은 달 다음 날에는 다시 받지 않음(요청 "+calls+")");
/* 한 쪽이라도 못 받으면 덮어쓰지 않는다 */
T["설정"].find(r=>r["항목"]==="장서목록일")["값"]="2026-08-01";
const keep=S.length;env.http=reqs=>reqs.map(q=>q.body&&q.body.categoryCode&&q.body.page===3?null:http0([q])[0]);
C().tick();must(T["장서목록"].length===keep&&cf("장서목록일")==="2026-08-01","일부 실패하면 옛 목록 유지");
/* 퀴즈판 3: 이미 푼 학생이 있어도 이번 주 자동 문제를 한 번 새로 */
env.http=http0;NOW=new Date("2026-09-23T01:00:00Z");
T["설정"].find(r=>r["항목"]==="퀴즈판")["값"]="2";
const wk=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["출처"]==="자동").map(q=>q["주"]).pop();
const before=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]===wk).map(q=>q.id).join();
T["퀴즈응답"].push({"주":wk,"학번":"30201","점수":"3"});
C().tick();
const after=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]===wk).map(q=>q.id).join();
must(before&&after&&before!==after&&cf("퀴즈판")==="4","이번 주 문제 새로 냄("+after.split(",").length+"문제)");
C().tick();must(T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]===wk).map(q=>q.id).join()===after,"한 번만(다음 확인 때는 그대로)");
