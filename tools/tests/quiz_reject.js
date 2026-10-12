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
T["도서"].push({"id":"b2","제목":"완득이","지은이":"김려령","영역":"청소년","월":"2026-10","소장":"Y","출처":"자동"});
db.setConf("이달","2026-10");
const plan=(wk,books)=>db.setConf("다음주퀴즈책",wk+"|2026-10|"+books);   /* 문제는 다음 주 퀴즈 책으로만 */
plan("2026-10-26","침묵의 봄;완득이");
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
NOW=new Date("2026-10-26T03:00:00Z");plan("2026-11-02","침묵의 봄");
const p2=as("s3102@x","quizSubmit",{book:"침묵의 봄",page:"",q:"침묵의 봄을 쓴 사람은?",o1:"레이첼 카슨",o2:"제인 구달",o3:"다윈",o4:"파브르",ans:1,why:""});
const id2=as("lib@x","state").quiz.find(q=>q.q.startsWith("침묵의 봄을")).id;
must(/다음 주 출제/.test((as("lib@x","quizPick",{id:id2}).ERR)||""),"학생 문제는 '이번 주 출제' 안 됨");
as("lib@x","quizPick",{id:id2,next:1});
must(T["퀴즈"].find(q=>q["id"]===id2)["주"]==="2026-11-02","학생 문제는 다음 주로 출제");
NOW=new Date("2026-11-02T03:00:00Z");
must(qs("3102")===1,"북퀴즈에 뽑혀 그 주가 오면 도장");
must(as("lib@x","quizDrop",{id:id2}).stampTaken===true&&qs("3102")===0,"출제 취소도 도장 회수");
must(as("s3102@x","state").quizRejected.length===1,"출제 취소된 학생에게도 반려 안내");
/* 문제 낸 책 위치 표시(2026-10-12): 옛 문제(제한 전)는 이달 추천도서 아님 / 교내 소장 도서 아님 으로 구분 */
T["장서목록"]=[{"제목":"(청소년을 위한)코스모스","지은이":"칼 세이건","권수":"1"},{"제목":"완득이","지은이":"김려령","권수":"2"}];
NOW=new Date("2026-10-27T03:00:00Z");
[["ox1","코스모스",""],["ox2","우주에 없는 책",""]].forEach(([id,b])=>db.add("퀴즈",{"id":id,"시각":"2026-10-01 10:00:00","상태":"대기","책제목":b,"문제":b+" 문제","보기1":"가","보기2":"나","보기3":"다","보기4":"라","정답":1,"학번":"3101","반":"3-1","출처":"학생","품질":"7"}));
let lw=as("lib@x","state").quiz;
must(lw.find(q=>q.id==="ox1").where==="lib"&&lw.find(q=>q.id==="ox2").where==="none","선생님 화면: 교내엔 있음(이달 추천도서 아님) / 교내 소장 아님(괄호 앞말 빼고 찾음)");
try{C().tick();}catch(e){}
must(T["퀴즈"].find(q=>q["id"]==="ox1")["교내소장"]==="Y"&&T["퀴즈"].find(q=>q["id"]==="ox2")["교내소장"]==="N","tick 이 옛 문제의 교내소장 칸을 채운다");
const mq=as("s3101@x","state").myQuiz;
must(mq.find(q=>q.book==="코스모스").where==="lib"&&mq.find(q=>q.book==="우주에 없는 책").where==="none","학생 내 문제 목록에도 같은 표시");

/* 출제는 다음 주 퀴즈 책으로만(2026-10-12 회장님) */
NOW=new Date("2026-10-28T03:00:00Z");
db.setConf("다음주퀴즈책","");
must(as("s3101@x","state").quiz.allowed.kind==="none","다음 주 책이 아직 없으면 낼 수 있는 책 없음");
must(/아직 정해지지 않았어요/.test((as("s3101@x","quizSubmit",{book:"침묵의 봄",page:"1쪽",q:"1쪽에서 나오는 것은 무엇?",o1:"가",o2:"나",o3:"다",o4:"라",ans:1,why:"1쪽"}).ERR)||""),"그때는 이달 추천도서여도 제출이 막힌다");
plan("2026-11-02","침묵의 봄");
let al=as("s3101@x","state").quiz.allowed;
must(al.kind==="next"&&al.books.join()==="침묵의 봄","낼 수 있는 책 = 다음 주 퀴즈 책");
const no=as("s3101@x","quizSubmit",{book:"완득이",page:"10쪽",q:"10쪽에서 완득이가 한 일은?",o1:"가",o2:"나다",o3:"라마",o4:"바사아",ans:1,why:"10쪽에 나옵니다"});
must(/다음 주 퀴즈 책\(『침묵의 봄』\)에서만/.test(no.ERR||""),"다른 책은 막힌다(이달 추천도서여도)");
const yes=as("s3101@x","quizSubmit",{book:"(청소년을 위한) 침묵의 봄",page:"",q:"침묵의 봄에서 경고한 것은 무엇인가요?",o1:"농약",o2:"소음",o3:"수온",o4:"철새",ans:1,why:"책 전체의 주제입니다"});
must(!yes.ERR&&T["퀴즈"].some(q=>q["문제"].startsWith("침묵의 봄에서")&&q["책제목"]==="침묵의 봄"),"다음 주 책은 낼 수 있다(서명은 퀴즈 책 이름으로 맞춤)");
/* 새 점수표: 쪽수 3 · 보기 3 · 정답 안 튐 1 · 해설 2 · 문제 길이 1 (추천 도서 점수 없음) */
must(yes.score===7&&!/추천/.test(yes.why.join()),"쪽수 없이 보기3+정답1+해설2+길이1 = 7점 ("+yes.score+")");
/* 확인만(출제 안 함, 2026-10-12): 도장은 그대로, 북퀴즈 자동 출제에서 빠짐, 되돌리기 가능 */
const ck=T["퀴즈"].find(q=>q["문제"].startsWith("침묵의 봄에서"));
const before=qs("3101");
must(/관리자/.test((as("t31@x","quizCheck",{id:ck["id"]}).ERR)||""),"확인만은 관리자만");
as("lib@x","quizCheck",{id:ck["id"]});
must(ck["상태"]==="확인"&&qs("3101")===before,"확인만: 상태 '확인', 도장은 그대로");
must(as("s3101@x","state").quizRejected.every(x=>x.id!==ck["id"]),"확인만은 반려 안내를 띄우지 않는다");
must(as("lib@x","state").quiz.some(q=>q.id===ck["id"]&&q.status==="확인"),"선생님 목록에 '확인' 문제로 남는다");
NOW=new Date("2026-11-02T03:00:00Z");try{C().ensureWeeklyQuiz();}catch(e){}
must(ck["상태"]==="확인","월요일 자동 출제에서도 확인만 한 문제는 뽑히지 않는다");
as("lib@x","quizCheck",{id:ck["id"],undo:1});
must(ck["상태"]==="대기","다시 대기로 되돌릴 수 있다");
/* 문제 내기는 한 주에 1개(2026-10-12 회장님). 반려되면 다시 낼 수 있다 */
NOW=new Date("2026-11-03T03:00:00Z");plan("2026-11-09","침묵의 봄");
const sub=q=>as("s3102@x","quizSubmit",{book:"침묵의 봄",page:"5쪽",q,o1:"가",o2:"나다",o3:"라마",o4:"바사아",ans:1,why:"5쪽에 나옵니다"});
must(!sub("5쪽에서 처음 나오는 동물은 무엇인가요?").ERR,"이번 주 첫 문제는 낼 수 있다");
must(/한 주에 1개까지/.test(sub("5쪽에서 두 번째로 나오는 것은 무엇인가요?").ERR||""),"같은 주 두 번째 문제는 막힌다");
must(as("s3102@x","state").quiz.myWeek===1,"학생 화면에 이번 주 낸 문제 수");
const fq=T["퀴즈"].find(q=>q["문제"].startsWith("5쪽에서 처음"));
as("lib@x","quizDrop",{id:fq["id"]});
must(!sub("5쪽에서 세 번째로 나오는 것은 무엇인가요?").ERR,"반려되면 그 주에 다시 낼 수 있다");
NOW=new Date("2026-11-10T03:00:00Z");plan("2026-11-16","침묵의 봄");
must(!sub("5쪽에서 마지막에 나오는 것은 무엇인가요?").ERR,"다음 주에는 다시 낼 수 있다");
