/* 만화·웹툰(2026-09-23): 기본 규칙은 '라벨만' — 라벨·문장은 되고 독후감 도장은 없다.
   가려내는 길 셋: 청구기호(설정 만화청구기호) · 도서 시트 '만화' 칸 · 학생 자진 체크.
   그래픽노블·교양만화는 '예외'로 독후감까지 인정 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T03:00:00Z"),EMAIL="s3101@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");db.setConf("하루제출상한","9");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","이메일":"s3101@x","동의":"y"});
const mon="2026-10";
T["도서"].push(
  {"id":"b1","제목":"불편한 편의점","지은이":"김호연","영역":"소설","월":mon,"소장":"Y","출처":"자동","청구기호":"813.6 김95ㅂ"},
  {"id":"b2","제목":"열혈강호","지은이":"전극진","영역":"소설","월":mon,"소장":"Y","출처":"자동","청구기호":"만 813.6 전18ㅇ"},
  {"id":"b3","제목":"어떤 만화","지은이":"아무개","영역":"소설","월":mon,"소장":"Y","출처":"자동","청구기호":"813.6 아12ㅇ","만화":"Y"},
  {"id":"b4","제목":"쥐","지은이":"아트 슈피겔만","영역":"역사","월":mon,"소장":"Y","출처":"자동","청구기호":"만 998 슈894ㅈ"});
const why="도서관에서 표지를 보고 빌렸습니다";
const long="읽기 전에는 ".padEnd(320,"생각이 많아지는 책이었다. ");
const rev=(id,t)=>({kind:"review",bookId:id,title:t,page:"12쪽",head:"머리글",why:why,text:long});
const lab=(id,t)=>({kind:"label",bookId:id,title:t,why:why,text:"표지 보고 무거울 줄 알았는데 하루 만에 읽었다. 읽고 나니 생각이 달라졌다."});

/* 청구기호로 자동 판별 */
must(/라벨/.test(err(()=>C().api("submit",rev("b2")))),"청구기호가 ‘만’으로 시작하면 독후감을 막는다");
must(!err(()=>C().api("submit",lab("b2"))),"같은 만화책도 라벨은 된다");
must(T["글"][0]["만화"]==="Y","글에 만화 표시가 남는다");
let a=C().api("state",{});
must(a.week.stamps.length===1&&a.week.stamps[0].slot==="write","만화 라벨도 도장 한 개(라벨·문장 자리)");

/* 도서 시트 '만화' 칸 */
must(/라벨/.test(err(()=>C().api("submit",rev("b3")))),"도서 시트에 만화로 적힌 책도 독후감을 막는다");

/* 그래픽노블은 예외 */
must(!err(()=>C().api("submit",rev("b4"))),"예외 목록(쥐)은 청구기호가 ‘만’이어도 독후감이 된다");
must(T["글"].filter(r=>r["책제목"]==="쥐")[0]["만화"]==="","예외 책에는 만화 표시가 붙지 않는다");
EMAIL="lib@x";C().api("bookComic",{id:"b4",v:"Y"});
EMAIL="s3101@x";
must(/라벨/.test(err(()=>C().api("submit",Object.assign(rev("b4"),{title:"쥐"})))),"선생님이 만화로 바꾸면 그때부터는 막힌다");
EMAIL="lib@x";C().api("bookComic",{id:"b4",v:"예외"});

/* 줄글 책은 그대로 */
EMAIL="s3101@x";
must(!err(()=>C().api("submit",rev("b1"))),"줄글 책은 독후감이 된다");

/* 학생 자진 체크(목록에 없는 책·웹툰) */
must(/라벨/.test(err(()=>C().api("submit",{kind:"review",bookId:"free",title:"어떤 웹툰",author:"작가",page:"1화",head:"머리글",why:why,text:long,comic:true}))),
  "목록에 없는 책도 만화·웹툰이라고 하면 독후감을 막는다");
must(!err(()=>C().api("submit",{kind:"quote",bookId:"free",title:"어떤 웹툰",author:"작가",page:"1화",why:why,text:"이 장면이 오래 남았다. 말풍선 하나가 전부였는데도.",comic:true})),
  "웹툰도 문장은 된다");

/* 설정으로 규칙을 바꿀 수 있다 */
EMAIL="lib@x";db.setConf("만화규칙","허용");EMAIL="s3101@x";
must(!err(()=>C().api("submit",Object.assign(rev("b3"),{title:"어떤 만화"}))),"만화규칙=허용 이면 독후감도 된다");
EMAIL="lib@x";db.setConf("만화규칙","금지");EMAIL="s3101@x";
must(/낼 수 없어요/.test(err(()=>C().api("submit",lab("b2")))),"만화규칙=금지 면 라벨도 막는다");
EMAIL="lib@x";db.setConf("만화규칙","라벨만");
/* 뒤늦게 만화로 지정된 독후감은 라벨·문장 자리로 내려간다 */
const rev1=()=>C().api("state",{}).week.stamps.filter(x=>x.slot==="review"&&/편의점/.test(x.t)).length;
EMAIL="s3101@x";const before=rev1();
EMAIL="lib@x";C().api("bookComic",{id:"b1",v:"Y"});
EMAIL="s3101@x";const after=rev1();
must(before===1&&after===0,"나중에 만화로 표시하면 그 독후감은 독후감 자리에서 빠진다(전 "+before+" → 후 "+after+")");
