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
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s3101@x","동의":"2026-09-20 10:00:00"});
T["명단"].push({"학번":"3102","이름":"나","반":"3-1","이메일":"s3102@x","동의":"2026-09-20 10:00:00"});
const q=(id,hb,at)=>db.add("퀴즈",{"id":id,"시각":at,"상태":"대기","책제목":"책"+id,"문제":"문제 "+id,"보기1":"가","보기2":"나","보기3":"다","보기4":"라","정답":"1","학번":hb,"반":"3-1","출처":"학생","품질":"8"});
q("qa","3101","2026-10-12 09:00:00");q("qb","3102","2026-10-13 09:00:00");
const st=()=>{EMAIL="lib@x";return C().api("state",{});};
const picked=()=>st().news.picked.map(x=>x.title);
C().api("newsSeen",{});
NOW=new Date("2026-10-13T04:00:00Z");
C().api("quizPick",{id:"qa",next:true});   /* 다음 주(10/19 주) 출제로 뽑음 */
must(picked().join()==="책qa","뽑은 뒤 새 소식에 '문제 채택'이 뜸");
NOW=new Date("2026-10-13T05:00:00Z");C().api("newsSeen",{});
NOW=new Date("2026-10-13T06:00:00Z");
must(picked().length===0,"확인했어요를 누르면 사라짐(다음 주 출제여도)");
NOW=new Date("2026-10-15T01:00:00Z");
must(picked().length===0,"며칠 뒤에도 다시 안 뜸");
C().api("quizPick",{id:"qb",next:true});
must(picked().join()==="책qb","그 뒤 새로 뽑은 것만 뜸");
must(T["퀴즈"].find(r=>r.id==="qb")["출제시각"]==="2026-10-15 10:00:00","출제시각이 시트에 남음");
/* 출제시각이 없는 옛 줄: 낸 시각으로 셈 → 확인 뒤엔 안 뜸 */
db.add("퀴즈",{"id":"qold","시각":"2026-10-10 09:00:00","상태":"출제","주":"2026-10-19","책제목":"옛책","문제":"옛 문제","학번":"3101","반":"3-1","출처":"학생"});
must(!picked().includes("옛책"),"출제시각 없는 옛 줄은 확인 뒤 안 뜸");
