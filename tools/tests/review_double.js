/* 독후감 도장 2배(2026-10-12 회장님): 이번 주·다음 주 북퀴즈 책 독후감만 덤 도장. 이 주의 주제·이달 추천 도서 덤은 10/12 전 글만(예전대로) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-14T03:00:00Z"),EMAIL="s3101@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
[["3101","가"],["3102","나"],["3103","다"],["3104","라"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","이메일":"s"+h+"@x","동의":"y"}));
db.setConf("이달","2026-10");
["이번책","다음책","추천책"].forEach((t,i)=>T["도서"].push({"id":"b"+i,"제목":t,"지은이":"지은이","영역":"소설","월":"2026-10","소장":"Y","출처":"자동"}));
/* 10/12 주 북퀴즈 = 이번책, 10/19 주(다음 주)로 정해 둔 책 = 다음책 */
db.add("퀴즈",{"id":"qa","상태":"출제","주":"2026-10-12","책제목":"이번책","문제":"이번책 문제","출처":"자동"});
db.setConf("다음주퀴즈책","2026-10-19|2026-10|다음책");
must(T["설정"].find(r=>r["항목"]==="퀴즈책독후감")["값"]==="2026-10-12","설정 퀴즈책독후감 = 2026-10-12");
let pid=0;
const post=(hb,title,day)=>T["글"].push({"id":"g"+(++pid),"시각":day+" 10:00:0"+pid,"종류":"review","학번":hb,"반":"3-1","책제목":title,"본문":"글","상태":"posted"});
post("3101","이번책","2026-10-13");     /* 이번 주 퀴즈 책 → 2개 */
post("3102","다음책","2026-10-13");     /* 다음 주 퀴즈 책 → 2개 */
post("3103","추천책","2026-10-13");     /* 이달 추천 도서지만 퀴즈 책 아님 → 1개(새 규칙) */
post("3104","추천책","2026-10-09");     /* 10/12 전 글: 예전 규칙(추천 도서 덤) → 2개 */
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
const n=(hb)=>{const w=st(hb).week;return w.stamps.filter(x=>x.slot==="review").length;};
must(n("3101")===2,"이번 주 퀴즈 책 독후감 = 도장 2개");
must(st("3101").week.stamps.some(x=>x.k==="theme"&&/이번 주 퀴즈 책/.test(x.t||"")),"덤 도장에 '이번 주 퀴즈 책' 표시");
must(n("3102")===2,"다음 주 퀴즈 책 독후감 = 도장 2개");
must(n("3103")===1,"퀴즈 책이 아닌 추천 도서 독후감은 1개(10/12부터)");
NOW=new Date("2026-10-09T03:00:00Z");
must(n("3104")===2,"10/12 전에 낸 추천 도서 독후감은 예전대로 2개(이미 받은 도장은 안 줄어듦)");
/* 다음 주 월요일에 다음책이 실제로 출제되면(계획이 바뀌어도) 지난주 글은 그대로 2개 */
NOW=new Date("2026-10-20T03:00:00Z");db.setConf("다음주퀴즈책","2026-10-26|2026-10|추천책");
db.add("퀴즈",{"id":"qb","상태":"출제","주":"2026-10-19","책제목":"다음책","문제":"다음책 문제","출처":"자동"});
const all=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
must(T["글"].length===4,"글 4편");
const hist=Core.make(db,env);
must(st("3102").week.stamps.length===0,"새 주에는 이번 주 도장판이 비어 있음");
