/* 추천 도서(2026-09-20): 청소년 권장도서 × 우리 학교 장서 → 12개 영역으로 40권 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-09-21T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"lib@x",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const C=()=>Core.make(db,env);C().maintain();
must(T["권장도서"].length===Core.TEEN.length&&Core.TEEN.length>=240,"권장도서 시트 "+T["권장도서"].length+"권(우리 학교에 있는 청소년 권장도서)");
const cnt={};Core.TEEN.forEach(x=>cnt[x[2]]=(cnt[x[2]]||0)+1);console.log("  영역별",JSON.stringify(cnt));
C().maintain();must(T["권장도서"].length===Core.TEEN.length,"다시 돌려도 중복으로 붙지 않음");
C().pickBooks("2026-09");
const live=m=>T["도서"].filter(b=>b["월"]===m&&b["숨김"]!=="Y");
const s9=live("2026-09"),by={};s9.forEach(b=>by[b["영역"]]=(by[b["영역"]]||0)+1);
must(s9.length===40,"9·10월 40권");console.log("  영역",JSON.stringify(by));
const Q={"소설":6,"청소년":4,"시·에세이":4,"인문":3,"철학":3,"역사":3,"사회·정치":3,"경제·경영":3,"과학":4,"기술·IT":2,"예술":3,"자기계발":2};
must(Object.keys(Q).every(a=>(cnt[a]||0)<Q[a]||by[a]===Q[a]),"영역마다 몫대로(책이 넉넉한 영역)");
must(s9.every(b=>/청소년 권장도서/.test(b["추천사"])&&b["청구기호"]&&b["출처"]==="자동"),"모두 권장 목록 · 청구기호 있음 (예: "+s9.slice(0,4).map(b=>b["제목"]).join(", ")+")");
must(s9.filter(b=>{const r=T["권장도서"].find(x=>x["제목"]===b["제목"]);return r&&Number(r["권수"])>=2;}).length>=30,"부수 2권 이상 책 먼저");
/* 다음 달들: 6달 안에는 겹치지 않음 */
const seen=new Set(s9.map(b=>b["제목"]));let dup=0,short=0;
["2026-11","2026-12","2027-01","2027-02"].forEach(m=>{C().pickBooks(m);const l=live(m);if(l.length<40)short++;l.forEach(b=>{if(seen.has(b["제목"]))dup++;seen.add(b["제목"]);});});
must(dup===0&&short===0,"11~2월 네 번 더 뽑아도 40권씩, 겹침 "+dup);
/* 뺌 Y */
T["도서"]=[];const x0=T["권장도서"].find(r=>r["영역"]==="소설");
T["권장도서"].forEach(r=>{if(r["영역"]==="소설"&&r!==x0)r["뺌"]="Y";});
C().pickBooks("2026-09");const s2=live("2026-09");
must(s2.filter(b=>b["영역"]==="소설").length===1&&s2.length===40,"‘뺌’ Y 는 빠지고, 모자란 몫은 다른 영역에서(소설 "+s2.filter(b=>b["영역"]==="소설").length+" · 모두 "+s2.length+")");
const pc=C().api("state",{}).conf||{};
