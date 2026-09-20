/* 시트가 이달("2026-09")을 날짜로 바꿔도 서가가 비지 않아야 한다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>new Date("2026-09-21T01:00:00Z"),email:()=>"",uid:()=>Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},set:()=>{},setMany:()=>{},
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["설정"].push({"항목":"이달","값":"2026-09-01 00:00:00"});
T["도서"].push({"id":"m1","제목":"책","지은이":"가","영역":"소설","출처":"자동","월":"2026-09","소장":"Y","숨김":""});
const C=Core.make(db,env);if(C.status().shelf!==1)throw new Error("시험 실패: 날짜로 바뀐 이달에서 서가가 빔");
C.maintain();if(T["설정"].find(r=>r["항목"]==="이달")["값"]!=="2026-09")throw new Error("시험 실패: 이달을 글자로 되돌리지 못함");
console.log("이달 날짜 변환 시험 통과");
