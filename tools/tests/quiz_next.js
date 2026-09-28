/* 다음 주 퀴즈 책 미리 알림 · 이번 주 2권으로 줄이기 · 재시험(2026-09-28 회장님 지시)
   - 다음 주 퀴즈 책은 한 주 앞서 정해 두고(설정 다음주퀴즈책), 그 주 월요일에 그 책으로 낸다
   - 퀴즈책수보다 많은 책으로 이미 나와 있으면 줄이고, 이미 푼 학생은 한 번 더(더 좋은 점수만) */
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
let EMAIL="lib@x";const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"});
T["명단"].push({"학번":"30201","이름":"김","반":"3-2","이메일":"s@x","동의":"y"});
const C=()=>Core.make(db,env);
const conf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];

const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
C().tick();
const plan=()=>String(conf("다음주퀴즈책")||"").split("|");
must(plan()[0]==="2026-09-28"&&plan()[2].split(";").length<=2&&plan()[2].split(";").length>=1,"다음 주(9/28) 퀴즈 책을 미리 정해 둔다: "+plan()[2]);
EMAIL="s@x";let st=C().api("state");EMAIL="lib@x";
must(st.quiz.next&&st.quiz.next.week==="2026-09-28"&&st.quiz.next.books.join(";")===plan()[2],"학생 북퀴즈 화면에 다음 주 퀴즈 책");
must(st.quiz.books.every(t=>st.quiz.next.books.indexOf(t)<0),"이번 주 책과 다음 주 책은 겹치지 않는다");
const tst=C().api("state");must(tst.nextQuiz&&tst.nextQuiz.books.length>=1,"교사 화면에도 다음 주 퀴즈 책");
const planned=plan()[2].split(";");
/* 한 주 뒤 월요일: 미리 알린 책으로 */
NOW=new Date("2026-09-28T01:00:00Z");C().tick();
const wb=wk=>[...new Set(T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]===wk).map(q=>q["책제목"]))];
must(wb("2026-09-28").sort().join(";")===planned.slice().sort().join(";"),"9/28 주 퀴즈는 미리 알린 책으로: "+wb("2026-09-28").join(", "));
must(T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]==="2026-09-28").length===5,"5문제 그대로");
must(plan()[0]==="2026-10-05","그다음 주(10/5) 책도 바로 미리 정한다");

/* 3권으로 나와 있던 주를 2권으로 줄이고, 이미 푼 학생은 재시험 */
NOW=new Date("2026-10-05T01:00:00Z");db.setConf("퀴즈책수","3");db.setConf("다음주퀴즈책","");C().tick();
must(wb("2026-10-05").length===3,"(준비) 3권으로 나온 주: "+wb("2026-10-05").length+"권");
NOW=new Date("2026-10-05T03:00:00Z");EMAIL="s@x";
let q=C().api("state").quiz;const ans={};q.items.forEach(x=>ans[x.id]=9);   /* 다 틀림 */
must(C().api("quizAnswer",{answers:ans}).score===0,"(준비) 먼저 푼 학생 0점");
let err="";try{C().api("quizAnswer",{answers:ans});}catch(e){err=e.message;}
must(/이미 풀었습니다/.test(err),"퀴즈가 그대로면 다시 못 푼다");
EMAIL="lib@x";db.setConf("퀴즈책수","2");NOW=new Date("2026-10-05T06:00:00Z");C().tick();
must(wb("2026-10-05").length===2&&T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]==="2026-10-05").length===5,"퀴즈책수를 2로 줄이면 이번 주 퀴즈도 2권 · 5문제로 다시 채운다");
must(String(conf("퀴즈재시험")).indexOf("2026-10-05|")===0,"재시험을 연다");
EMAIL="s@x";q=C().api("state").quiz;
must(q.done===null&&q.retake&&q.retake.prev===0,"먼저 푼 학생 화면: 다시 풀 수 있음(지난 점수 0)");
must(q.items.every(x=>wb("2026-10-05").some(t=>x.book===""||t===x.book)),"다시 푸는 문제는 새 2권에서");
const right={};q.items.forEach(x=>{const r=T["퀴즈"].find(z=>z.id===x.id);right[x.id]=Number(r["정답"])-1;});
must(C().api("quizAnswer",{answers:right}).score===5,"재시험 5점");
err="";try{C().api("quizAnswer",{answers:right});}catch(e){err=e.message;}
must(/이미 풀었습니다/.test(err),"재시험은 한 번만");
q=C().api("state").quiz;must(q.done===5&&!q.retake,"더 좋은 점수(5점)가 남는다");
const log=(C().api("state").quizLog||[]).filter(x=>x.week==="2026-10-05");
must(log.length<=1,"퀴즈 기록은 한 주 한 줄: "+log.length);
