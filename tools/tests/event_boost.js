/* 도장 배수 이벤트(2026-09-22): 기간·대상·종류를 정해 도장을 2배로 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-08T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이름":"사서","담당":"관리자","이메일":"lib@x"});
[["1101","가온"],["2101","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"s"+h+"@x","동의":"y"}));
let pid=0;
function post(hb,kind,day,t){T["글"].push({"id":"g"+(++pid),"시각":day+" 1"+(pid%9)+":00:00","종류":kind,"학번":hb,"반":hb[0]+"-"+hb[1],"책제목":t||("책"+pid),"본문":"글","상태":"posted"});}
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
/* 이벤트 없을 때: 라벨 하나 = 도장 하나 */
post("1101","label","2026-10-05");
must(st("1101").week.stamps.length===1,"이벤트가 없으면 도장 1개");
/* 관리자가 이벤트를 연다: 10/06~10/09, 1학년만, ×2 */
EMAIL="lib@x";C().api("eventSet",{name:"가을 독서 주간",way:"배수",from:"2026-10-06",to:"2026-10-09",val:2,target:"1학년",memo:"1학년 도장 두 배"});
must(T["이벤트"].length===1,"이벤트 시트에 한 줄");
post("1101","label","2026-10-06");
let a=st("1101");
must(a.week.stamps.length===3&&a.week.stamps.filter(x=>x.ev===2).length===1,"이벤트 기간 라벨 하나 = 도장 2개(모두 "+a.week.stamps.length+")");
must(a.events.length===1&&a.events[0].mul===2&&a.events[0].name==="가을 독서 주간","학생 화면에 진행 중인 이벤트가 보인다");
/* 대상이 아닌 학년은 그대로 */
post("2101","label","2026-10-06");
must(st("2101").week.stamps.length===1,"2학년은 대상이 아니라 그대로 1개");
must(!st("2101").events.length,"대상이 아니면 이벤트 알림도 없다");
/* 한 주 상한도 배수만큼 늘어난다: 이벤트 주에는 최대 10개 (별 하나에 세 종류가 필요하니 섞어서) */
post("1101","review","2026-10-07");
T["퀴즈응답"].push({"주":"2026-10-05","학번":"1101","점수":"4","문항수":"5","시각":"2026-10-07 15:00:00"});
post("1101","label","2026-10-08");post("1101","review","2026-10-08");post("1101","label","2026-10-09");
a=st("1101");
must(a.week.stamps.length===10&&a.week.bonus>0,"이벤트 주 상한은 5×2=10개(도장 "+a.week.stamps.length+" · 책갈피 "+a.week.bonus+")");
must(a.stars.mStars===2,"이벤트 주에는 별도 두 개까지(별 "+a.stars.mStars+")");
/* 기간이 지나면 원래대로 */
NOW=new Date("2026-10-13T03:00:00Z");
post("1101","label","2026-10-12");post("1101","label","2026-10-12");post("1101","label","2026-10-12");post("1101","label","2026-10-12");
must(st("1101").week.stamps.length===3,"이벤트가 끝나면 라벨 넉 장을 써도 도장 3개(원래 규칙)");
/* 종류를 정하면 그 종류만 두 배 */
EMAIL="lib@x";C().api("eventSet",{name:"독후감 주간",way:"배수",from:"2026-10-12",to:"2026-10-16",val:2,kind:"review"});
post("2101","review","2026-10-13");post("2101","label","2026-10-13");
const b=st("2101");
must(b.week.stamps.filter(x=>x.k==="review").length===2&&b.week.stamps.filter(x=>x.k==="label").length===1,"독후감만 두 배, 라벨은 그대로");
/* 관리자 화면 목록·내리기 */
EMAIL="lib@x";const ev=C().api("state",{}).events;
must(ev.length===2&&ev[0].live===true,"교사 화면에 이벤트 목록(진행 중 표시)");
C().api("eventHide",{name:"독후감 주간",from:"2026-10-12"});
must(!st("2101").events.length,"내리면 바로 꺼진다");
/* 잘못된 값 */
const err=f=>{try{f();return "";}catch(e){return e.message;}};
EMAIL="lib@x";
must(/배수는 2에서 5/.test(err(()=>C().api("eventSet",{name:"x",way:"배수",from:"2026-11-01",to:"2026-11-02",val:9}))),"배수는 2~5");
must(/끝 날짜/.test(err(()=>C().api("eventSet",{name:"x",way:"배수",from:"2026-11-05",to:"2026-11-01",val:2}))),"끝이 시작보다 빠르면 거부");
EMAIL="s1101@x";
must(/관리자/.test(err(()=>C().api("eventSet",{name:"x",way:"배수",from:"2026-11-01",to:"2026-11-02",val:2}))),"학생은 이벤트를 못 연다");

/* ── 추첨·대항·미션 ── */
NOW=new Date("2026-11-10T03:00:00Z");
EMAIL="lib@x";
/* 추첨: 11/02~11/06, 1등 3명에게 상품권 1매 */
C().api("eventSet",{name:"가을 추첨",way:"추첨",from:"2026-11-02",to:"2026-11-06",val:2,prize:1});
post("1101","label","2026-11-03");post("1101","review","2026-11-04");post("2101","label","2026-11-03");
NOW=new Date("2026-11-05T03:00:00Z");   /* 추첨 기간 안에서 보기 */
let a2=st("1101");
const tk2=(a2.events.filter(e=>e.way==="추첨")[0]||{}).tickets;
must(tk2===2,"학생 화면: 내 추첨권 2장(지금 "+tk2+")");
NOW=new Date("2026-11-10T03:00:00Z");   /* 기간이 끝난 뒤 뽑기 */
EMAIL="lib@x";const dr=C().api("eventDraw",{name:"가을 추첨",from:"2026-11-02"});
must(dr.picked.length===2&&dr.tickets===3,"추첨: 표 3장에서 2명("+dr.picked.map(x=>x.name).join(",")+")");
must(T["이벤트"].find(r=>r["이름"]==="가을 추첨")["당첨"],"당첨자가 시트에 남는다");
let e2="";try{C().api("eventDraw",{name:"가을 추첨",from:"2026-11-02"});}catch(x){e2=x.message;}
must(/이미 뽑았/.test(e2),"두 번 뽑지 않는다(다시 뽑기는 따로)");
must(!C().api("eventDraw",{name:"가을 추첨",from:"2026-11-02",again:true}).ok===false,"다시 뽑기는 된다");
/* 대항: 반별 참여율 */
C().api("eventSet",{name:"반 대항",way:"대항",from:"2026-11-02",to:"2026-11-30",val:2});
const ev2=C().api("state",{}).events.filter(e=>e.way==="대항")[0];
must(ev2.rank&&ev2.rank.length>=1&&ev2.rank[0].pct===100,"교사 화면: 반 순위 1등 "+ev2.rank[0].cls+" "+ev2.rank[0].pct+"%");
must(st("1101").events.some(e=>e.way==="대항"&&e.rank>=1),"학생 화면: 우리 반 등수");
/* 미션: 기간 안 3건 채우면 도장 2개 더 */
EMAIL="lib@x";C().api("eventSet",{name:"11월 미션",way:"미션",from:"2026-11-09",to:"2026-11-15",val:3,prize:2,target:"1학년"});
post("1101","label","2026-11-09");post("1101","review","2026-11-09");
let m1=st("1101");
must(m1.events.some(e=>e.way==="미션"&&e.done===2&&!e.ok),"미션 2/3 — 아직");
must(m1.week.stamps.filter(x=>x.k==="mission").length===0,"아직 보상 도장 없음");
post("1101","label","2026-11-10");
T["퀴즈응답"].push({"주":"2026-11-09","학번":"1101","점수":"5","문항수":"5","시각":"2026-11-10 09:00:00"});
let m2=st("1101");
must(m2.events.some(e=>e.way==="미션"&&e.ok),"미션 3/3 달성");
must(m2.week.stamps.filter(x=>x.k==="mission").length===2,"보상 도장 2개가 찍힌다(별 규칙은 그대로라 퀴즈도 있어야 다 들어감)");
must(m2.stars.mStars>=1,"보상까지 더해 별 "+m2.stars.mStars+"개");
