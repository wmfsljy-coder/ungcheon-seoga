const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-06T01:00:00Z"),EMAIL="lib@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const http=reqs=>reqs.map(q=>{
  if(q.body&&q.body.searchKeyword){const t=q.body.searchKeyword;
    if(t==="코스모스")return ok({totalCount:2,bookList:[1,2].map(i=>({bookKey:"c"+i,title:"코스모스",author:"칼 세이건 지음",callNo:"443 세68ㅋ c."+i,isbn:"9788983711892",categoryInfo:{lcode:"009000000"}}))});
    return ok({totalCount:0,bookList:[]});}
  if(q.url&&/state/.test(q.url))return ok({status:"대출가능"});
  return ok({});});
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"},{"이메일":"hr@x","이름":"담임","담당":"3-2"},{"이메일":"g2@x","이름":"이학년","담당":"2학년"},{"이메일":"sci@x","이름":"최과학","담당":"교사"});
T["명단"].push({"학번":"30201","이름":"김","반":"3-2","이메일":"s1@x","동의":"y"},{"학번":"30501","이름":"오","반":"3-5","이메일":"s2@x","동의":"y"},{"학번":"20101","이름":"강","반":"2-1","이메일":"s3@x","동의":"y","도서부":"Y"});
["label","review","label","label","review"].forEach((k,i)=>T["글"].push({"id":"g"+i,"시각":"2026-09-0"+(i+1)+" 10:00:00","종류":k,"학번":"30201","반":"3-2","책제목":"책"+i,"상태":"posted"}));
T["글"].push({"id":"g9","시각":"2026-10-01 10:00:00","종류":"label","학번":"30501","반":"3-5","책제목":"책9","상태":"posted"},{"id":"g8","시각":"2026-10-01 10:00:00","종류":"label","학번":"20101","반":"2-1","책제목":"책8","상태":"posted"});
T["퀴즈응답"].push({"주":"2026-08-31","학번":"30201","점수":"5","문항수":"5","시각":"2026-09-02 10:00:00"});
const C=()=>Core.make(db,env);C().maintain();
db.setConf("이달","2026-09");db.setConf("상품권공개","Y");db.setConf("상품권배부","2026-10-05~2026-10-08");
const as=(e,n,p)=>{EMAIL=e;try{return C().api(n,p||{})}catch(x){return {ERR:x.message}}};
for(const [e,nm] of [["lib@x","관리자"],["hr@x","담당 3-2"],["g2@x","2학년"],["sci@x","교사"]]){const s=as(e,"state");
  console.log(nm.padEnd(8),"→",s.me.label,"| 새 글 반",[...new Set(s.posts.map(p=>p.cls))].join(",")||"-","| 독서기록",s.readlog.length,"명 | 상품권 9월",(s.gifts.rows["2026-09"]||[]).length,"명");}
console.log("담임이 3-5 계정 풀기:",JSON.stringify(as("hr@x","resetAccount",{hakbun:"30501"})),"| 2학년 담당이 3학년 풀기:",as("g2@x","resetAccount",{hakbun:"30201"}).ERR,"| 교사가 풀기:",as("sci@x","resetAccount",{hakbun:"30201"}).ERR);
console.log("교사 추천(교과 없이):",as("sci@x","teacherBook",{t:"코스모스"}).ERR);
console.log("교사 추천(없는 책):",as("sci@x","teacherBook",{subj:"과학",t:"없는책"}).ERR);
console.log("교사 추천(코스모스):",JSON.stringify(as("sci@x","teacherBook",{subj:"과학",t:"코스모스",a:"칼 세이건",q:"우주를 처음 만나는 책"})));
const bk=T["도서"].find(b=>b["제목"]==="코스모스");console.log("  → 도서:",bk["영역"],"|",bk["추천"],"|",bk["청구기호"],"| 학생 서가에 보임:",as("s1@x","state").books.some(b=>b.t==="코스모스"));
console.log("  같은 책 또:",as("sci@x","teacherBook",{subj:"과학",t:"코스모스",a:"칼 세이건"}).ERR);
console.log("  다른 교사가 빼기:",as("hr@x","teacherBookHide",{id:bk.id}).ERR,"| 내가 빼기:",JSON.stringify(as("sci@x","teacherBookHide",{id:bk.id})),"→ 숨김",bk["숨김"]);
db.setConf("교사추천상한","1");bk["숨김"]="";console.log("  상한 1에서 하나 더:",as("sci@x","teacherBook",{subj:"과학",t:"코스모스",a:"칼 세이건"}).ERR);
const d=as("s3@x","state");console.log("도서부:",d.me.club,"| 배부 대상",d.giftDesk.rows.map(x=>x.name+(x.paid?"✓":"")).join(","),"열림",d.giftDesk.open);
console.log("  체크:",JSON.stringify(as("s3@x","clubMark",{ids:["30201"],on:true})),"→ 지급",T["지급"].map(r=>r["처리"]+"/"+r["처리자"]).join(","));
console.log("  대상 아닌 학생:",as("s3@x","clubMark",{ids:["30501"],on:true}).ERR,"| 도서부 아닌 학생:",as("s2@x","clubMark",{ids:["30201"],on:true}).ERR);
NOW=new Date("2026-10-09T01:00:00Z");console.log("  기간 지난 뒤:",as("s3@x","clubMark",{ids:["30201"],on:false}).ERR,"| 화면",JSON.stringify(as("s3@x","state").giftDesk).slice(0,60));
