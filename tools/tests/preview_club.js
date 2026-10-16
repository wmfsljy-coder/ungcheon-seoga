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
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s3101@x","동의":"2026-09-20 10:00:00","도서부":"Y"});
T["명단"].push({"학번":"3102","이름":"나","반":"3-1","이메일":"s3102@x","동의":"2026-09-20 10:00:00"});
/* 도서부 학생 미리보기(2026-10-16 회장님 '도서부 학생 화면 오류'): 선생님이 도서부 학생으로 미리 보면 실제 화면처럼 배부 탭 자료가 온다 */
const pv=C().api("state",{as:"3101"});
must(pv.preview&&pv.me.club===true,"도서부 학생 미리보기에 도서부 표시가 넘어감");
must(!!pv.giftDesk,"미리보기에도 상품권 배부 자료(명단 또는 '목요일부터' 안내)가 옴");
const pv2=C().api("state",{as:"3102"});
must(pv2.preview&&!pv2.me.club&&!pv2.giftDesk,"일반 학생 미리보기에는 배부 자료가 없음");
