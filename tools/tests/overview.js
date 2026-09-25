/* 한눈에 보기(2026-09-25): 주별 흐름 · 오래 쉬는 학생 · 학년 범위 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-21T01:00:00Z");   /* 수요일 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
db.setConf("이달","2026-10");
T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"일담","담당":"1학년"},{"이름":"과학","담당":"교사"});
/* 1학년 세 명, 2학년 한 명 — 모두 가입(핀 있음) */
[["1101","가온","2026-10-05"],["1102","나리","2026-10-05"],["1103","다솜","2026-10-05"],["2101","마루","2026-10-12"]]
  .forEach(([h,n,at])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+String(Number(h[1])),"동의":"y","핀":"hpin|s:"+h+"|640217","핀설정":at+" 09:00:00"}));
[1,2].forEach(i=>T["도서"].push({"id":"m"+i,"제목":"추천책 "+i+"호","지은이":"지은이","영역":"소설","출처":"자동","월":"2026-10","소장":"Y","권수":"2"}));
/* 가온: 이번 주 라벨 / 나리: 3주 전 독후감(=오래 쉼) / 다솜: 아무것도 / 마루: 지난주 문장 */
T["글"].push({"id":"g1","시각":"2026-10-20 10:00:00","주":"2026-10-19","종류":"label","학번":"1101","이름":"가온","반":"1-1","책제목":"추천책 1호","상태":"posted"});
T["글"].push({"id":"g2","시각":"2026-09-29 10:00:00","주":"2026-09-28","종류":"review","학번":"1102","이름":"나리","반":"1-1","책제목":"추천책 2호","상태":"posted"});
T["글"].push({"id":"g3","시각":"2026-10-14 10:00:00","주":"2026-10-12","종류":"quote","학번":"2101","이름":"마루","반":"2-1","책제목":"추천책 1호","상태":"posted"});
T["퀴즈응답"].push({"주":"2026-10-19","학번":"1101","점수":"5","문항수":"5","시각":"2026-10-20 11:00:00"});
T["도장"].push({"id":"t1","시각":"2026-10-20 12:00:00","주":"2026-10-19","학번":"1101","이름":"가온","반":"1-1","사유":"쉬는 시간마다 읽음","교사":"과학","취소":""});
const tok={};["사서","일담","과학"].forEach((n,i)=>{tok[n]=C().api("login",{role:"teacher",name:n,newPin:"71390"+i}).token;});
const state=who=>C().api("state",{_t:tok[who]});

/* ── 관리자: 전교 ── */
const O=state("사서").overview;
must(O&&O.scope==="전교","관리자는 전교를 본다");
must(O.weeks.length===8&&O.weeks[7].now,"최근 여덟 주, 마지막이 이번 주");
const wk=O.weeks.find(w=>w.wk==="2026-10-19");
must(wk.label===1&&wk.quiz===1&&wk.wild===1,"이번 주 라벨 1 · 퀴즈 1 · 선생님 도장 1");
must(wk.people===1,"이번 주 참여 인원 1명");
must(O.weeks.find(w=>w.wk==="2026-10-12").quote===1,"지난주 문장 1");
must(O.weeks.find(w=>w.wk==="2026-10-05").join===3,"가입한 주에 새 가입 3명");
must(wk.stamp>=2,"도장 수도 주마다 센다("+wk.stamp+")");
/* 2주 넘게 쉬는 학생: 나리(9/29 마지막)와 다솜(한 번도) */
must(O.sum.joined===4&&O.sum.idle===2&&O.sum.active===2,"가입 4명 중 2명이 쉬는 중");
must(O.idle.map(x=>x.hakbun).join()==="1102,1103","쉬는 학생은 학번순(나리·다솜)");
must(O.idle.find(x=>x.hakbun==="1103").days===-1&&O.sum.never===1,"한 번도 안 한 학생은 따로 표시");
must(O.idle.find(x=>x.hakbun==="1102").days>=20,"마지막 활동에서 며칠 지났는지 센다");

/* ── 학년 담당: 우리 학년만 ── */
const O1=state("일담").overview;
must(O1.scope==="1학년"&&O1.sum.joined===3,"1학년 담당은 1학년 세 명만");
must(O1.idle.every(x=>x.cls.indexOf("1-")===0)&&O1.idle.length===2,"쉬는 학생도 우리 학년만");
must(O1.weeks.find(w=>w.wk==="2026-10-12").quote===0,"다른 학년 활동은 세지 않는다");

/* ── 교과 교사에게는 없다 ── */
must(state("과학").overview===null,"교과 교사는 한눈에 보기를 보지 않는다");

/* ── 글을 내면 바로 빠진다 ── */
C().api("submit",{_t:C().api("login",{role:"student",hakbun:"1103",name:"다솜",pin:"640217"}).token,
  kind:"label",bookId:"m1",text:"이 책은 정말 좋았다. ".repeat(5).slice(0,60),why:"도서관에서 빌려 읽었다"});
const O2=state("사서").overview;
must(O2.sum.idle===1&&O2.idle.every(x=>x.hakbun!=="1103"),"한 편 내면 쉬는 명단에서 빠진다");
