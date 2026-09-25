const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]===\"로그인방식\")r[1]=\"구글\";});");
let NOW=new Date("2026-09-30T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1}};
let EMAIL="lib@x";
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"},{"이메일":"hr@x","이름":"담임","담당":"3-2"});
T["명단"].push({"학번":"30201","이름":"김","반":"3-2","이메일":"s@x","동의":"y"},{"학번":"30202","이름":"이","반":"3-2","이메일":"t@x","동의":"y"});
/* 김: 9월 도장 6개 세 종류 → 대상 */
["label","review","label","label","review"].forEach((k,i)=>T["글"].push({"id":"g"+i,"시각":"2026-09-0"+(i+1)+" 10:00:00","주":"","종류":k,"학번":"30201","반":"3-2","책제목":"책"+i,"상태":"posted"}));
T["퀴즈응답"].push({"주":"2026-08-31","학번":"30201","점수":"5","문항수":"5","시각":"2026-09-02 10:00:00"});
const C=()=>Core.make(db,env);C().maintain();
db.setConf("상품권공개","Y");db.setConf("상품권배부","2026-10-05~2026-10-08, 2026-11-02~2026-11-05");
C().api("noticeAdd",{title:"도서관 휴관",body:"10월 9일 한글날 휴관",from:"2026-09-28",to:"2026-10-09",who:"학생"});
C().api("noticeAdd",{title:"교사 회의",from:"",to:"",who:"교사"});
function stu(){EMAIL="s@x";const s=C().api("state");EMAIL="lib@x";return s;}
for(const d of ["2026-09-27","2026-09-28","2026-10-05","2026-10-08","2026-10-09","2026-10-27"]){
  NOW=new Date(d+"T01:00:00Z");const s=stu();
  console.log(d,"| 공지",s.notices.map(n=>n.title).join(",")||"-","| 배부안내",s.giftNotice?s.giftNotice.mon+" "+s.giftNotice.from+"~"+s.giftNotice.to+" 열림:"+s.giftNotice.open+" 나:"+JSON.stringify(s.giftNotice.mine):"-");
}
NOW=new Date("2026-10-01T01:00:00Z");
const t=C().api("state");console.log("교사 새 소식 상품권:",JSON.stringify(t.news&&t.news.gift&&{mon:t.news.gift.mon,from:t.news.gift.from,n:t.news.gift.rows.length}),"| 공지(교사)",t.notices.map(n=>n.title),"| 전체 공지",t.allNotices.length);
console.log("메일:",C().giftMail("2026-09").map(m=>m.body.split("\n").find(l=>/배부/.test(l))).join(" / "));
C().api("noticeHide",{id:T["공지"][0].id,on:true});NOW=new Date("2026-10-02T01:00:00Z");console.log("내린 뒤 학생 공지:",stu().notices.length);

/* ── 자동 판정(2026-09-25) ── */
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
function at(d){NOW=new Date(d+"T01:00:00Z");return stu();}
must(!at("2026-09-27").giftNotice,"기간 일주일 전보다 이르면 배부 안내가 없다");
const pre=at("2026-09-28");
must(pre.giftNotice&&pre.giftNotice.open===false,"일주일 전부터 예고가 뜬다(아직 열리지 않음)");
const open=at("2026-10-05");
must(open.giftNotice&&open.giftNotice.open===true,"첫날에는 열린다");
must(at("2026-10-08").giftNotice.open===true,"마지막 날까지 열린다");
must(!at("2026-10-09").giftNotice,"기간이 지나면 사라진다");
const n2=at("2026-10-02").notices.map(n=>n.title);
must(n2.indexOf("교사 회의")<0,"교사 공지는 학생에게 보이지 않는다");
