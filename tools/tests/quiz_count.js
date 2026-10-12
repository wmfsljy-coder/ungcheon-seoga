/* 북퀴즈 문항 수(2026-10-12 회장님): 최소 5문제, 좋은 학생 문제는 상한 없이 모두. 학생 문제가 적으면 은행으로 5문제까지 */
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
for(let i=1;i<=8;i++)T["명단"].push({"학번":"31"+String(i).padStart(2,"0"),"이름":"학생"+i,"반":"3-1","이메일":"s31"+String(i).padStart(2,"0")+"@x","동의":"y"});
db.setConf("이달","2026-11");db.setConf("추천묶음","");db.setConf("다음주퀴즈책","");
const G=["소설","과학","역사","시·에세이","인문"];
for(let i=0;i<5;i++)T["도서"].push({"id":"n"+i,"제목":"십일월책"+i,"지은이":"나"+i,"영역":G[i],"월":"2026-11","소장":"Y","출처":"자동","소개":"십일월책"+i+"은 저런 이야기를 담은 책이다. 바다를 건너는 사람들의 이야기."});
const as=(em,op,p)=>{EMAIL=em;try{return C().api(op,p||{});}catch(x){return {ERR:x.message};}};
NOW=new Date("2026-11-04T03:00:00Z");try{C().ensureWeeklyQuiz();}catch(e){}
const books=as("s3101@x","state").quiz.allowed.books;
must(books.length>=1,"다음 주 퀴즈 책: "+books.join(","));
/* 학생 7명이 좋은 문제를 냄 */
for(let i=1;i<=7;i++){const r=as("s31"+String(i).padStart(2,"0")+"@x","quizSubmit",{book:books[i%books.length],page:(10+i)+"쪽",q:(10+i)+"쪽에서 사람들이 건넌 곳은 어디인가요?("+i+")",o1:"바다",o2:"사막",o3:"강",o4:"산",ans:1,why:(10+i)+"쪽에 바다를 건넌다고 나옵니다"});
  if(r.ERR)console.log("  제출 실패",i,r.ERR);}
NOW=new Date("2026-11-09T00:30:00Z");try{C().ensureWeeklyQuiz();}catch(e){}
const live=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]==="2026-11-09");
must(live.filter(q=>q["출처"]==="학생").length===7&&live.length===7,"좋은 학생 문제 7개는 5개를 넘어도 모두 출제 ("+live.length+"문제)");
/* 다음 주: 학생 문제 1개뿐 → 은행으로 5문제까지 */
const b2=as("s3101@x","state").quiz.allowed.books;
as("s3108@x","quizSubmit",{book:b2[0],page:"21쪽",q:"21쪽에서 사람들이 건넌 곳은 어디인가요?",o1:"바다",o2:"사막",o3:"강",o4:"산",ans:1,why:"21쪽에 바다를 건넌다고 나옵니다"});
NOW=new Date("2026-11-16T00:30:00Z");try{C().ensureWeeklyQuiz();}catch(e){}
const live2=T["퀴즈"].filter(q=>q["상태"]==="출제"&&q["주"]==="2026-11-16");
must(live2.filter(q=>q["출처"]==="학생").length===1&&live2.length>1&&live2.length<=5,"학생 문제가 적으면 은행 문제로 채운다(최대 5문제까지, 은행이 모자라면 있는 만큼) ("+live2.length+"문제)");
