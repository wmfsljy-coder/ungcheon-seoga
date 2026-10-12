/* 월 마지막 주(2026-10-12 회장님): 다음 주가 다음 달이면, 미리 뽑아 둔 다음 달 추천도서 예정에서 다음 주 퀴즈 책을 먼저 정해 학생이 문제를 낼 수 있게 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-28T03:00:00Z"),EMAIL="s3101@x";   /* 수요일. 다음 주 월요일 = 11/2 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s3101@x","동의":"y"});
db.setConf("이달","2026-10");db.setConf("추천묶음","");db.setConf("다음주퀴즈책","");
const G=["소설","과학","역사","시·에세이","인문"];
for(let i=0;i<5;i++){T["도서"].push({"id":"o"+i,"제목":"시월책"+i,"지은이":"가"+i,"영역":G[i],"월":"2026-10","소장":"Y","출처":"자동","소개":"시월책"+i+"은 이런 이야기를 담은 책이다. 주인공이 길을 떠난다."});
  T["도서"].push({"id":"n"+i,"제목":"십일월책"+i,"지은이":"나"+i,"영역":G[i],"월":"2026-11","소장":"Y","출처":"자동","소개":"십일월책"+i+"은 저런 이야기를 담은 책이다. 바다를 건너는 사람들."});}
const as=(em,op,p)=>{EMAIL=em;try{return C().api(op,p||{});}catch(x){return {ERR:x.message};}};
try{C().ensureWeeklyQuiz();}catch(e){}
const plan=(T["설정"].find(r=>r["항목"]==="다음주퀴즈책")||{})["값"]||"";
must(/^2026-11-02\|2026-11\|십일월책/.test(plan),"다음 주(11/2) 퀴즈 책을 11월 추천도서 예정에서 정함: "+plan);
const st=as("s3101@x","state");
must(st.quiz.next&&st.quiz.next.nextMonth&&st.quiz.next.books.every(t=>/^십일월책/.test(t)),"학생 퀴즈 탭에 다음 주 책(다음 달 예정) 미리 보임");
must(st.quiz.allowed.kind==="next"&&st.quiz.allowed.books.every(t=>/^십일월책/.test(t)),"학생은 그 책으로 문제를 낼 수 있음");
const bk=st.quiz.allowed.books[0];
const r=as("s3101@x","quizSubmit",{book:bk,page:"12쪽",q:"12쪽에서 사람들이 건너는 곳은 어디인가요?",o1:"바다",o2:"사막",o3:"강",o4:"산",ans:1,why:"12쪽에 바다를 건넌다고 나옵니다"});
must(!r.ERR&&r.stamped,"다음 달 예정 책으로 낸 문제도 도장");
must(as("s3101@x","state").myQuiz[0].where==="shelf","내 문제 목록에 '이달 추천도서 아님'이 붙지 않음");
must(as("s3101@x","quizSubmit",{book:"시월책0",page:"1쪽",q:"1쪽에서 주인공이 하는 일은?",o1:"가",o2:"나",o3:"다",o4:"라",ans:1,why:"1쪽"}).ERR,"이번 달 다른 책은 막힘");
const adm=as("lib@x","state");
must(adm.nextQuiz&&adm.nextQuiz.nextMonth,"선생님 화면에도 '다음 달 추천도서 예정에서' 표시");
/* 11/2 월요일: 달이 바뀌어 11월 책이 서가에 오르면, 미리 알린 책으로 이번 주 북퀴즈 */
NOW=new Date("2026-11-02T00:30:00Z");db.setConf("이달","2026-11");
try{C().ensureWeeklyQuiz();}catch(e){}
const wk=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]==="2026-11-02").map(q=>q["책제목"]);
must(wk.length&&wk.every(t=>/^십일월책/.test(t))&&wk.includes(bk),"그 주가 오면 미리 알린 책으로 출제(학생 문제 포함): "+[...new Set(wk)].join(","));
