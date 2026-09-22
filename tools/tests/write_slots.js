/* 글쓰기 세 갈래(라벨·문장·독후감)와 한 주 도장 규칙(2026-09-22)
   ① 한 주 주간도장(5)개  ② 라벨·문장 합쳐 1개, 독후감 2개, 퀴즈(출제+풀이) 2개
   ③ 상한을 넘기면 종류마다 책갈피 한 장, 그 뒤는 기록만
   ④ 책갈피 5장 = 만능 도장(개수 제한 없음, 그 주 칸이 없으면 다음 주로 이월) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-04T23:00:00Z"),EMAIL="";   /* KST 10월 5일(월) 08시 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");db.setConf("하루제출상한","9");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이름":"사서","담당":"관리자","이메일":"lib@x"});
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","이메일":"s3101@x","동의":"y"});
const st=()=>{EMAIL="s3101@x";return C().api("state",{});};
const BK=["아몬드","완득이","하얼빈","코스모스","데미안","파친코","1984"];
function post(kind,n,day,extra,hh){T["글"].push(Object.assign({"id":"g"+T["글"].length,"시각":day+" "+(hh||("1"+(T["글"].length%9)))+":00:00",
  "주":Core.weekKey(new Date(day+"T00:00:00Z"),0),"종류":kind,"학번":"3101","반":"3-1","책제목":BK[n],"본문":"글","쪽수":"12쪽","상태":"posted"},extra||{}));}
function quizMake(n,day){T["퀴즈"].push({"id":"q"+T["퀴즈"].length,"시각":day+" 09:0"+T["퀴즈"].length+":00","학번":"3101",
  "책제목":BK[n],"문제":"문제","품질":"8","상태":"대기","출처":"학생"});}
function quizDo(day,wk,hh){T["퀴즈응답"].push({"주":wk,"학번":"3101","점수":"4","문항수":"5","시각":day+" "+(hh||"15")+":00:00"});}

/* ── 문장 제출 ── */
EMAIL="s3101@x";
const quote={kind:"quote",bookId:"free",title:"아몬드",author:"손원평",page:"88쪽",
  why:"도서관에서 표지를 보고 빌렸습니다",text:"나는 내가 아는 것보다 조금 더 오래 기다릴 수 있는 사람이었다."};
must(/쪽/.test(err(()=>C().api("submit",Object.assign({},quote,{page:""})))),"문장은 쪽수를 적어야 한다");
must(/글자 수/.test(err(()=>C().api("submit",Object.assign({},quote,{text:"짧다"})))),"문장도 글자 수를 지킨다(15~120자)");
C().api("submit",quote);
must(T["글"].length===1&&T["글"][0]["종류"]==="quote","글 시트에 종류 quote 로 들어간다");
let a=st();
must(a.week.stamps.length===1&&a.week.stamps[0].slot==="write","문장 한 편 = 라벨·문장 도장 한 개");
must(a.mine[0].kind==="quote"&&a.board.some(x=>x.kind==="quote"),"내 서재·게시판에 문장이 보인다");

/* ── 라벨·문장은 합쳐서 한 주 한 개, 더 내면 책갈피 ── */
const wk="2026-10-05";
NOW=new Date("2026-10-09T03:00:00Z");
post("label",1,wk,null,"10");
a=st();
must(a.week.stamps.length===1&&a.week.bonus===1,"같은 주 라벨은 도장이 아니라 책갈피 한 장(도장 "+a.week.stamps.length+" · 책갈피 "+a.week.bonus+")");
post("label",2,wk,null,"11");
a=st();
must(a.week.stamps.length===1&&a.week.bonus===2,"계속 써도 책갈피로 쌓인다(책갈피 "+a.week.bonus+"장)");

/* ── 독후감은 한 주 두 개 ── */
post("review",0,wk,null,"12");post("review",1,wk,null,"13");
a=st();
must(a.week.stamps.filter(x=>x.slot==="review").length===2,"독후감은 한 주 두 개까지 도장");
post("review",2,wk,null,"14");
a=st();
must(a.week.stamps.filter(x=>x.slot==="review").length===2&&a.week.bonus===3,"세 번째 독후감은 책갈피(책갈피 "+a.week.bonus+"장)");

/* ── 퀴즈도 출제·풀이 합쳐 한 주 두 개 ── */
quizMake(0,wk);quizDo("2026-10-05",wk,"15");
a=st();
must(a.week.stamps.length===5&&a.week.stamps.filter(x=>x.slot==="quiz").length===2,
  "퀴즈 출제 1 + 풀이 1 = 두 개, 이걸로 한 주 다섯 칸이 다 찼다(도장 "+a.week.stamps.length+")");
must(a.week.used.write===1&&a.week.used.review===2&&a.week.used.quiz===2,"한 주 구성: 라벨·문장 1 · 독후감 2 · 퀴즈 2");

/* ── 책갈피는 한 주 다섯 장이 끝. 다섯 장이 차면 만능 도장이 되고, 칸이 없으면 다음 주로 ── */
post("label",3,wk,null,"16");
a=st();
must(a.week.bonus===4,"네 번째 책갈피(책갈피 "+a.week.bonus+"장)");
post("label",4,wk,null,"17");
a=st();
must(a.week.bonus===5&&a.stars.leaf.have===0&&a.week.wait===1,
  "다섯 장째에 만능 도장이 되지만 그 주 칸이 없어 다음 주로(대기 "+a.week.wait+")");
post("label",5,wk,null,"18");
a=st();
must(a.week.bonus===5&&a.week.over===1,"한 주 책갈피는 다섯 장까지, 그 뒤는 기록만(책갈피 "+a.week.bonus+" · 기록만 "+a.week.over+")");

/* ── 이월된 만능 도장은 다음 주 첫 칸에 찍힌다 ── */
const wk2="2026-10-12";
NOW=new Date("2026-10-16T03:00:00Z");
a=st();
must(a.week.stamps.length===1&&a.week.stamps[0].slot==="wild"&&!a.week.wait,"다음 주 첫 칸에 이월된 만능 도장이 찍힌다");
post("quote",3,wk2,null,"09");post("review",3,wk2,null,"11");quizDo("2026-10-15",wk2,"13");
a=st();
must(a.week.stamps.length===4&&a.week.used.wild===1&&a.week.used.write===1,"만능 1 + 라벨·문장 1 + 독후감 1 + 퀴즈 1 = 네 칸");
must(a.stars.stamps===9,"누적 도장 9개(첫 주 5 · 둘째 주 4) — 지금 "+a.stars.stamps);

/* ── 같은 책·같은 종류는 한 번만 ── */
EMAIL="s3101@x";
must(/같은 종류의 글/.test(err(()=>C().api("submit",{kind:"quote",bookId:"free",title:"아몬드",author:"손원평",page:"12쪽",
  why:"또 냅니다",text:"나는 내가 아는 것보다 조금 더 오래 기다릴 수 있는 사람이었다."}))),"같은 책 같은 종류는 한 번만");
must(!err(()=>C().api("submit",{kind:"review",bookId:"free",title:"아몬드",author:"손원평",page:"9쪽",head:"감정을 배우는 일",
  why:"문장을 옮겨 적고 나서 끝까지 읽었습니다",text:"독후감입니다. ".padEnd(320,"감정이라는 말이 무엇인지 몰랐다. ")})),"같은 책이어도 종류가 다르면 낼 수 있다");
