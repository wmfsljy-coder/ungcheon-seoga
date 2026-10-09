/* 이달 추천도서 20권(2026-10-09 회장님 지시 — 권장도서 탭이 따로 있으니)
   지금 달 40권을 바로 20권으로: 퀴즈 책(이번 주·다음 주 미리 알림)·글 달린 책 먼저 남기고, 영역 몫대로, 나머지는 숨김(지우지 않음) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-09-21T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"lib@x",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
/* 지금 실제 모습: 40권으로 뽑혀 있는 9·10월 */
db.setConf("추천20판","1");db.setConf("이달의권수","40");
const C=()=>Core.make(db,env);C().maintain();C().pickBooks("2026-09");db.setConf("이달","2026-09");
const live=()=>T["도서"].filter(b=>b["월"]==="2026-09"&&b["숨김"]!=="Y"&&b["출처"]==="자동");
must(live().length===40,"(준비) 지금 40권");
NOW=new Date("2026-10-09T03:00:00Z");
const L=live(),wkNow=Core.weekKey(NOW,0),wkNext=Core.weekKey(NOW,1);
/* 이번 주 퀴즈 책 둘(영역 몫이 작은 쪽에서), 다음 주 미리 알린 책 둘, 학생 글이 달린 책 하나 */
const pick=L.slice(-6);
[pick[0],pick[1]].forEach((b,i)=>T["퀴즈"].push({"id":"q"+i,"상태":"출제","주":wkNow,"책제목":b["제목"],"문제":"문제"+i,"보기1":"a","보기2":"b","보기3":"c","보기4":"d","정답":"1"}));
db.setConf("다음주퀴즈책",wkNext+"|2026-09|"+pick[2]["제목"]+";"+pick[3]["제목"]);
T["글"].push({"id":"g1","시각":"2026-10-08 10:00:00","주":"2026-10-05","종류":"label","학번":"3101","반":"3-1","책제목":pick[4]["제목"],"본문":"x","상태":"posted"});
/* 선생님 추천 책은 손대지 않는다 */
T["도서"].push({"id":"tch1","제목":"선생님 추천 책","지은이":"누구","영역":"과학","출처":"추천","월":"2026-09","소장":"Y","숨김":""});
db.setConf("추천20판","");C().maintain();
const after=live();
must(cf("이달의권수")==="20","설정: 이달의권수 20");
must(after.length===20,"이번 달 자동 추천 도서 40 → 20권");
must(T["도서"].filter(b=>b["월"]==="2026-09"&&b["출처"]==="자동"&&b["숨김"]==="Y").length===20,"뺀 20권은 지우지 않고 숨김 Y");
const has=t=>after.some(b=>b["제목"]===t);
must(has(pick[0]["제목"])&&has(pick[1]["제목"]),"이번 주 퀴즈 책은 남는다");
must(has(pick[2]["제목"])&&has(pick[3]["제목"]),"다음 주 미리 알린 퀴즈 책도 남는다");
must(has(pick[4]["제목"]),"학생 글이 달린 책은 남는다");
const areas=new Set(after.map(b=>b["영역"]));
must(areas.size>=10,"영역이 고르게 남는다("+areas.size+"개 영역)");
must(T["도서"].find(b=>b["id"]==="tch1")["숨김"]==="","선생님 추천 책은 그대로");
C().maintain();
must(live().length===20,"한 번만(다시 돌려도 더 줄지 않음)");
must(C().pickBooks("2026-11").length===20,"다음 추천(11월)부터 20권씩 뽑는다");
