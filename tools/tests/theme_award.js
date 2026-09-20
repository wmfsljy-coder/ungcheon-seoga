/* 이 주의 주제(2026-09-20): 주제 책 독후감 = 도장 2개, 한 주 5개·별 1개 한도는 그대로 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-09T03:00:00Z"),EMAIL="s3101@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;   /* maintain 이 넣어 주는 주제 초안은 이 시험에서 치운다 */
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
[["3101","가"],["3102","나"],["1101","한"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"s"+h+"@x","동의":"y"}));
T["도서"].push({"id":"b1","제목":"침묵의 봄","지은이":"레이첼 카슨","영역":"과학","월":"2026-10","소장":"Y","출처":"자동"},
  {"id":"b2","제목":"완득이","지은이":"김려령","영역":"청소년","월":"2026-10","소장":"Y","출처":"자동"});
/* 10월 5일 주(월) 주제: 과학 */
EMAIL="lib@x";C().api("themeSet",{week:"2026-10-05",title:"과학의 눈으로 보기",body:"실험이 나오는 책",area:"과학"});
must(T["주제"].length===1&&T["주제"][0]["주"]==="2026-10-05","주제 시트에 한 줄");
let pid=0;
function post(hb,kind,title,day){T["글"].push({"id":"g"+(++pid),"시각":day+" 10:0"+pid+":00","종류":kind,"학번":hb,"반":hb[0]+"-"+hb[1],"책제목":title,"본문":"글","상태":"posted"});}
post("3101","review","침묵의 봄","2026-10-06");          /* 주제 책 독후감 → 2개 */
post("3102","label","침묵의 봄","2026-10-06");           /* 주제 책이어도 라벨은 1개 */
post("1101","review","완득이","2026-10-06");             /* 주제는 아니지만 이달의 추천 도서 → 2개 */
post("1101","review","서가에 없는 책","2026-10-07");      /* 추천 도서도 주제도 아님 → 1개 */
const wk=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
must(wk("3101").week.stamps.length===2,"주제 책 독후감 = 도장 2개");
must(wk("3102").week.stamps.length===1,"주제 책 라벨은 1개 그대로");
must(wk("1101").week.stamps.length===3,"이달의 추천 도서 독후감 2개 + 그 밖의 책 1개 = 3");
must(wk("1101").week.stamps.filter(x=>x.k==="theme").length===1,"추천 도서 독후감에만 덤 도장");
must(wk("3101").week.stamps.some(x=>x.k==="theme"),"도장판에 주제 도장(主) 표시");
/* 별 1개에는 라벨·독후감·퀴즈가 하나씩 — 주제 독후감만 이어 써도 3칸에서 멈춘다 */
post("3101","review","침묵의 봄","2026-10-07");post("3101","review","침묵의 봄","2026-10-08");
let a=wk("3101");
must(a.week.stamps.length===3&&a.week.bonus===3,"독후감만 이어 쓰면 도장 3개에서 멈추고 나머지는 은행잎(도장 "+a.week.stamps.length+" · 은행잎 "+a.week.bonus+")");
must(a.week.bonusWhy==="kinds"&&a.stars.run.need.join()==="label,quiz","무엇이 빠졌는지 알려 준다: "+a.stars.run.need.join("·"));
post("3101","label","완득이","2026-10-08");
T["퀴즈응답"].push({"주":"2026-10-05","학번":"3101","점수":"4","문항수":"5","시각":"2026-10-09 10:00:00"});
a=wk("3101");
must(a.week.stamps.length===5&&a.stars.mStars===1,"라벨·퀴즈를 채우면 5칸이 되고 별 1개("+a.week.stamps.length+"칸)");
must(a.stars.run.need.length===0||a.stars.run.n===0,"별을 받으면 도장판이 새로 시작");
/* 다음 주에 주제가 없으면 독후감도 1개 */
post("3102","review","침묵의 봄","2026-10-13");
must(wk("3102").week.stamps.length===1,"주제가 없는 주에는 독후감도 1개");
/* 주제를 비우면 그 주는 사라진다 */
EMAIL="lib@x";C().api("themeSet",{week:"2026-10-05",title:""});
NOW=new Date("2026-10-07T03:00:00Z");
must(!wk("3101").theme,"주제를 비우면 학생 화면에서 사라짐");
must(wk("3101").week.stamps.some(x=>x.k==="theme"),"주제가 없어도 추천 도서 독후감이면 도장 2개는 그대로");

/* 개인정보 보유 기간: 3학년 졸업식 / 1·2학년 학년말 */
must(wk("3101").keepMine==="졸업식 날까지"&&wk("1101").keepMine==="이번 학년말(2월)까지","보유 기간이 학년에 맞게 나온다("+wk("1101").keepMine+")");
/* 건의함: 학생이 보내고 관리자만 이름을 본다 */
EMAIL="s3101@x";C().api("ideaAdd",{text:"청소년 소설을 더 들여 주세요. 아몬드 같은 책이요."});
let mine=C().api("state",{}).ideas;
must(mine.length===1&&!mine[0].reply,"학생: 건의 1건, 아직 답변 없음");
EMAIL="s1101@x";must(!(C().api("state",{}).ideas||[]).length,"남의 건의는 안 보인다");
EMAIL="lib@x";let adm=C().api("state",{}).ideas;
must(adm.length===1&&adm[0].name==="가"&&adm[0].hakbun==="3101","관리자만 이름·학번을 본다");
C().api("ideaReply",{id:adm[0].id,text:"곧 들여놓을게요. 고마워요."});
EMAIL="s3101@x";mine=C().api("state",{}).ideas;
must(/곧 들여놓을게요/.test(mine[0].reply)&&/선생님/.test(mine[0].who),"답변이 학생 화면에 보인다");
EMAIL="s1101@x";let e3="";try{C().api("ideaReply",{id:adm[0].id,text:"나쁜 답변"});}catch(x){e3=x.message;}
must(/관리자/.test(e3),"학생은 답변을 달 수 없다");
EMAIL="s3101@x";let e4="";
try{for(let i=0;i<4;i++)C().api("ideaAdd",{text:"건의 되풀이 시험 "+i});}catch(x){e4=x.message;}
must(/하루에 3개/.test(e4),"하루 3개까지");
/* 문제를 성의껏 내면 그 자리에서 도장(2026-09-20) */
NOW=new Date("2026-10-20T03:00:00Z");   /* 주제 없는 주 */
EMAIL="s3102@x";T["명단"].push({"학번":"3102","이름":"바","반":"3-1","이메일":"s3102@x","동의":"y"});
const good=C().api("quizSubmit",{book:"침묵의 봄",page:"88쪽",q:"88쪽에서 저자가 경고한 것은 무엇인가요?",o1:"살충제가 생태계에 남긴 자취",o2:"도시의 소음",o3:"바다의 수온",o4:"철새의 이동",ans:1,why:"88쪽에 나옵니다"});
must(good.stamped&&good.score>=good.bar,"성의껏 낸 문제: 품질 "+good.score+"/10 → 도장");
must(wk("3102").week.stamps.some(x=>x.k==="quiz"),"낸 그 자리에서 問 도장이 찍힌다");
const poor=C().api("quizSubmit",{book:"완득이",page:"",q:"완득이는 누구인가요?",o1:"학생",o2:"교사",o3:"의사",o4:"군인",ans:1,why:""});
must(!poor.stamped,"대충 낸 문제(품질 "+poor.score+")는 도장 없음");
must(wk("3102").week.stamps.filter(x=>x.k==="quiz").length===1,"도장은 성의껏 낸 문제 하나만");
