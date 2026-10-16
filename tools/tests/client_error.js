/* 새 소식 '문제 채택'(2026-10-13 회장님 "퀴즈 당첨된 학생 글은 확인해도 계속 뜨네"): 확인했어요를 누르면 사라지고, 그 뒤 새로 뽑은 것만 다시 뜬다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-13T03:00:00Z"),EMAIL="lib@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s3101@x","동의":"2026-09-20 10:00:00","도서부":"Y"});
/* 화면 오류 알림(2026-10-16): 학생 기기에서 난 오류를 시트 '화면오류'에 남긴다 */
EMAIL="s3101@x";
const r=C().api("clientError",{where:"panel:desk",msg:"x is undefined",ua:"Mozilla/5.0 (Linux; Android 14)"});
must(r&&r.ok,"오류 알림을 받음");
const row=T["화면오류"][0];
must(row&&row["누구"]==="3101"&&row["탭"]==="panel:desk"&&/undefined/.test(row["내용"])&&/Android/.test(row["기기"]),"누가·어느 탭·무슨 오류·어떤 기기인지 남음");
EMAIL="";const r2=C().api("clientError",{where:"panel:shelf",msg:"y"});
must(r2.ok&&T["화면오류"][1]["누구"]!=="3101","로그인 전 오류도 남음(누구는 비움)");
C().api("clientError",{where:"w",msg:"z".repeat(1000)});
must(T["화면오류"][2]["내용"].length<=300,"긴 내용은 300자까지");
