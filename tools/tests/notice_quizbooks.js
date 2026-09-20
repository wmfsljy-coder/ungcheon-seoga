/* 설정 '공지사항' 칸 → 학생 공지 맨 위 / 퀴즈 책은 학교에 부수가 많은 책 먼저 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-05T01:00:00Z"),EMAIL="s3101@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();db.setConf("이달","2026-09");
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s3101@x","동의":"y"});
T["공지"].push({"id":"n1","시작":"","끝":"","제목":"날짜 공지","내용":"","대상":"학생","숨김":""});
db.setConf("공지사항","도서관 휴관: 10월 9일 한글날\n북퀴즈는 매주 월요일에 새로 나와요");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
let s=C().api("state",{});
must(s.notices[0].title==="도서관 휴관"&&s.notices[0].body==="10월 9일 한글날"&&s.notices[1].title==="북퀴즈는 매주 월요일에 새로 나와요","설정 공지사항 두 줄이 맨 위에("+s.notices.map(n=>n.title).join(" / ")+")");
must(s.notices.length===3,"공지 시트 공지도 함께");
/* 퀴즈 책: 부수 */
const TOP=["우정","기억","바다","용기","도시","시간","가족","숲","별","편지","전쟁","음악"];
for(let i=0;i<12;i++)T["도서"].push({"id":"m"+i,"제목":"책"+i,"지은이":"지은이"+i,"영역":Core.GENRES[i%16][1],"출처":"자동","월":"2026-09","소장":"Y","청구기호":(800+i)+".6 가"+i,"권수":String(i<3?10+i:1),
  "소개":"예시 소개입니다. 주인공 "+i+"번은 "+TOP[i]+"에 얽힌 오래된 약속을 따라 먼 길을 떠난다. 여정 끝에서 그는 진짜 의미를 깨닫게 된다.","핵심어":TOP[i],"숨김":""});
C().ensureWeeklyQuiz();s=C().api("state",{});
must(s.quiz.bookInfo.every(b=>b.total>=10),"이번 주 퀴즈 책은 부수 많은 책("+s.quiz.bookInfo.map(b=>b.t+" "+b.total+"권").join(", ")+")");

/* 2026-09-20: 첫 공지·주제 초안과 상품권 공개 */
(function(){
  const T2={};Object.keys(Core.HEAD).forEach(t=>T2[t]=[]);
  const env2={now:()=>new Date("2026-09-21T02:00:00Z"),email:()=>"lib@x",uid:()=>Math.random().toString(36).slice(2,9),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
  const db2={rows:t=>T2[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T2[t].push(r)},addMany:(t,l)=>l.forEach(o=>db2.add(t,o)),
    set:(t,k,v,p)=>T2[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
    setMany:(t,k,m)=>T2[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
    setConf:(k,v)=>{const h=T2["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T2["설정"].push({"항목":k,"값":v})}};
  const C2=Core.make(db2,env2);C2.maintain();
  const cf=k=>(T2["설정"].find(r=>r["항목"]===k)||{})["값"];
  const ok=(c,m)=>console.log((c?"✓ ":"✗ ")+m)||(c||(process.exitCode=1));
  ok(cf("상품권공개")==="Y","상품권 안내가 켜져 있다");
  ok(/도장 5개면 별 1개/.test(cf("공지사항"))&&cf("공지사항").split("\n").length===4,"첫 공지사항 4줄이 들어 있다");
  ok(T2["주제"].length===4&&T2["주제"][0]["주"]==="2026-09-21","이 주의 주제 4주치 초안");
  /* 관리자가 고치면 그대로 둔다 */
  db2.setConf("공지사항","우리 반만 보는 공지");T2["주제"][0]["주제"]="바꾼 주제";
  C2.maintain();
  ok(cf("공지사항")==="우리 반만 보는 공지"&&T2["주제"][0]["주제"]==="바꾼 주제","관리자가 고친 내용은 그대로");
  db2.setConf("상품권공개","N");C2.maintain();
  ok(cf("상품권공개")==="N","상품권 안내를 끄면 꺼진 채로 둔다");
})();
