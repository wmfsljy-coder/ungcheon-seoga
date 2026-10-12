/* 문제 출제 반려(2026-10-12 회장님): 반려하면 그 문제로 받은 문제 출제 도장은 회수,
   학생에게는 '문제 출제 도장이 반려되었다'는 안내가 확인을 누를 때까지 뜬다. 도장을 안 받은 문제는 안내 없음 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-20T03:00:00Z"),EMAIL="s3101@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"},{"이메일":"t31@x","이름":"담임","담당":"3-1"});
[["3101","가"],["3102","나"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","이메일":"s"+h+"@x","동의":"y"}));
T["도서"].push({"id":"b1","제목":"침묵의 봄","지은이":"레이첼 카슨","영역":"과학","월":"2026-10","소장":"Y","출처":"자동"});
const as=(em,op,p)=>{EMAIL=em;try{return C().api(op,p||{});}catch(x){return {ERR:x.message};}};
const qs=hb=>as("s"+hb+"@x","state").week.stamps.filter(x=>x.slot==="quiz"||x.k==="quizmk").length;

/* 3101: 성의껏 낸 문제 → 그 자리에서 도장 */
const good=as("s3101@x","quizSubmit",{book:"침묵의 봄",page:"88쪽",q:"88쪽에서 저자가 경고한 것은 무엇인가요?",o1:"살충제가 생태계에 남긴 자취",o2:"도시의 소음",o3:"바다의 수온",o4:"철새의 이동",ans:1,why:"88쪽에 나옵니다"});
must(good.stamped,"성의껏 낸 문제는 도장");
must(qs("3101")===1,"반려 전: 문제 출제 도장 1개");
/* 3102: 품질 미달(도장 없음) */
const poor=as("s3102@x","quizSubmit",{book:"완득이",page:"",q:"완득이는 누구인가요?",o1:"학생",o2:"교사",o3:"의사",o4:"군인",ans:1,why:""});
must(!poor.stamped&&qs("3102")===0,"품질 미달 문제는 도장 없음");

const list=as("lib@x","state").quiz;
const gq=list.find(q=>q.q.startsWith("88쪽")),pq=list.find(q=>q.q.startsWith("완득이는"));
must(gq.stamped===true&&pq.stamped===false,"선생님 화면: 도장 받은 문제인지 표시");
must(/관리자/.test((as("t31@x","quizDrop",{id:gq.id}).ERR)||""),"담임은 반려할 수 없다(관리자만)");

const r=as("lib@x","quizDrop",{id:gq.id});
must(r.stampTaken===true,"반려 → 도장 회수");
must(qs("3101")===0,"학생 도장판에서 문제 출제 도장이 빠짐");
const row=T["퀴즈"].find(q=>q["id"]===gq.id);
must(row["상태"]==="반려"&&row["반려시각"]&&!row["반려확인"],"시트에 반려시각이 남고 확인은 빈칸");
let st=as("s3101@x","state");
must(st.quizRejected.length===1&&st.quizRejected[0].book==="침묵의 봄","학생 화면: 문제 출제 도장 반려 안내");
must(as("s3102@x","state").quizRejected.length===0,"다른 학생에게는 안 뜸");

as("lib@x","quizDrop",{id:pq.id});
must(as("s3102@x","state").quizRejected.length===0&&!T["퀴즈"].find(q=>q["id"]===pq.id)["반려시각"],"도장을 안 받은 문제 반려는 안내 없음");

const ack=as("s3101@x","quizRejectAck",{});
must(ack.n===1&&row["반려확인"],"확인을 누르면 시트에 확인 시각");
must(as("s3101@x","state").quizRejected.length===0,"확인 뒤에는 안내가 다시 안 뜸");
must(/학생/.test((as("lib@x","quizRejectAck",{}).ERR)||""),"확인은 학생만");

/* 북퀴즈에 뽑혀서 받은 도장(품질 미달)도 출제 취소하면 회수 */
NOW=new Date("2026-10-26T03:00:00Z");
const p2=as("s3102@x","quizSubmit",{book:"침묵의 봄",page:"",q:"침묵의 봄을 쓴 사람은?",o1:"레이첼 카슨",o2:"제인 구달",o3:"다윈",o4:"파브르",ans:1,why:""});
const id2=as("lib@x","state").quiz.find(q=>q.q.startsWith("침묵의 봄을")).id;
as("lib@x","quizPick",{id:id2});
must(qs("3102")===1,"북퀴즈에 뽑히면 도장");
must(as("lib@x","quizDrop",{id:id2}).stampTaken===true&&qs("3102")===0,"출제 취소도 도장 회수");
must(as("s3102@x","state").quizRejected.length===1,"출제 취소된 학생에게도 반려 안내");
