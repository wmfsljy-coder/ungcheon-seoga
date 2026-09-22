/* 투표(2026-09-22): 라벨·문장·독후감 세 부문, 부문마다 한 주 2표, 글은 올라온 날부터 7일 동안만 대상.
   달마다 부문별로 표를 모아 3위 안에 들면 만능 도장 1개 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-20T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이름":"사서","담당":"관리자","이메일":"lib@x"});
const kids=[["3101","가온"],["3102","두리"],["3103","세인"],["3104","네온"],["3105","다섯"]];
kids.forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","이메일":"s"+h+"@x","동의":"y"}));
let pid=0;
function post(hb,kind,day,title){T["글"].push({"id":"g"+(++pid),"시각":day+" 10:00:00","주":Core.weekKey(new Date(day+"T00:00:00Z"),0),
  "종류":kind,"학번":hb,"이름":"","반":"3-1","책제목":title||("책"+pid),"본문":"글 "+pid,"상태":"posted"});return "g"+pid;}
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};

/* ── 세 부문 후보 ── */
const oldOne=post("3102","label","2026-10-10","오래된 라벨");     /* 10일 전 = 후보 아님 */
const gL=post("3102","label","2026-10-19","새 라벨");
const gQ=post("3103","quote","2026-10-19","새 문장");
const gR=post("3104","review","2026-10-19","새 독후감");
let a=st("3101");
must(a.voteL.list.length===1&&a.voteQ.list.length===1&&a.voteR.list.length===1,"세 부문 모두 후보가 따로 나온다");
must(!a.voteL.list.some(x=>x.id===oldOne),"올라온 지 7일이 지난 글은 후보에서 빠진다");
must(a.voteL.per===2&&a.voteQ.per===2&&a.voteR.per===2,"부문마다 한 주 2표");
EMAIL="s3101@x";
must(/7일이 지난 글/.test(err(()=>C().api("vote",{kind:"label",id:oldOne}))),"7일 지난 글에는 표를 못 준다");
C().api("vote",{kind:"label",id:gL});C().api("vote",{kind:"quote",id:gQ});C().api("vote",{kind:"review",id:gR});
a=st("3101");
must(a.voteL.left===1&&a.voteQ.left===1&&a.voteR.left===1,"부문별로 표가 따로 줄어든다");
must(/이미 뽑은 글/.test(err(()=>C().api("vote",{kind:"label",id:gL}))),"같은 글에는 한 번만");

/* 한 부문 2표를 다 쓰면 더는 못 준다 */
const gL2=post("3105","label","2026-10-19","또 다른 라벨"),gL3=post("3104","label","2026-10-20","세 번째 라벨");
C().api("vote",{kind:"label",id:gL2});
must(/투표권 2표를 다 썼습니다/.test(err(()=>C().api("vote",{kind:"label",id:gL3}))),"한 주 부문별 2표까지");

/* 주가 바뀌어도 같은 글에는 다시 표를 못 준다(후보 기간이 이레라 겹칠 수 있음) */
EMAIL="s3102@x";C().api("vote",{kind:"label",id:gL3});        /* 10-20 글, 10-19 주에 한 표 */
NOW=new Date("2026-10-26T03:00:00Z");                          /* 다음 주. gL3 은 아직 이레 안 */
const fresh=post("3103","label","2026-10-25","다음 주에도 보이는 라벨");
EMAIL="s3102@x";
must(/이미 뽑은 글/.test(err(()=>C().api("vote",{kind:"label",id:gL3}))),"지난주에 뽑은 글에는 다시 표를 못 준다");
must(!err(()=>C().api("vote",{kind:"label",id:fresh})),"새 주에는 새 표로 다른 글을 뽑는다");
NOW=new Date("2026-10-20T03:00:00Z");

/* ── 달마다 부문별 3위 안 = 만능 도장 ── */
/* 10월 라벨: gL(3102) 3표, gL2(3105) 2표, gL3(3104) 1표, oldOne(3102) 0표 */
function ballots(id,who){who.forEach(h=>T["투표"].push({"시각":"2026-10-20","주":"2026-10-19","종류":"label","투표자":"v|"+h+"|"+id,"글id":id}));}
ballots(gL,["3103","3104"]);      /* gL 은 3101 표까지 3표 */
ballots(gL2,["3103"]);            /* gL2 는 3101 표까지 2표 */
ballots(gL3,["3102"]);            /* 1표 */
NOW=new Date("2026-11-03T03:00:00Z");
let s2=st("3102"),s5=st("3105"),s4=st("3104"),s1=st("3101");
must(s2.week.stamps.some(x=>x.slot==="wild"&&/이달의 라벨/.test(x.t)),"라벨 1위(3표)에게 만능 도장");
must(s5.week.stamps.some(x=>x.slot==="wild"&&/이달의 라벨/.test(x.t)),"라벨 2위(2표)에게 만능 도장");
must(s4.week.stamps.some(x=>x.slot==="wild"&&/이달의 라벨/.test(x.t)),"라벨 3위(1표)에게 만능 도장");
must(st("3103").week.stamps.some(x=>x.slot==="wild"&&/이달의 문장/.test(x.t)),"문장 부문 1위에게 만능 도장");
must(st("3104").week.stamps.some(x=>x.slot==="wild"&&/이달의 독후감/.test(x.t)),"독후감 부문 1위에게 만능 도장");
must(!s1.week.stamps.some(x=>x.slot==="wild"),"표를 못 받은 학생에게는 만능 도장이 없다");
must(st("3104").week.stamps.filter(x=>x.slot==="wild").length===2,"부문이 다르면 두 개까지 받는다(라벨 3위 + 독후감 1위)");
