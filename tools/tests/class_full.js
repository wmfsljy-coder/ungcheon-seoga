/* 학급 전원 가입(2026-09-22): 한 반이 모두 PIN 을 정하면 그 반 전원에게 만능 도장 1개 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-09T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"});
/* 1-1 세 명, 1-2 두 명, 1-3 한 명 */
[["1101","가온","1-1"],["1102","두리","1-1"],["1103","세인","1-1"],
 ["1201","나래","1-2"],["1202","마루","1-2"],["1301","혼자","1-3"]].forEach(([h,n,c])=>
  T["명단"].push({"학번":h,"이름":n,"반":c,"이메일":"s"+h+"@x","동의":"y"}));
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
function join(hb,at){db.set("명단","학번",hb,{"핀":"pin|"+hb,"핀설정":at});}

join("1101","2026-10-05 09:00:00");join("1102","2026-10-06 09:00:00");
let a=st("1101");
must(!a.classFull&&!a.week.stamps.length,"한 사람이라도 아직이면 도장이 없다");
join("1103","2026-10-07 09:00:00");
a=st("1101");
must(a.classFull&&a.classFull.cls==="1-1"&&a.classFull.n===3,"전원 가입이 학생 화면에 알려진다("+(a.classFull&&a.classFull.cls)+")");
const w=a.week.stamps.filter(x=>x.k==="welcome");
must(w.length===1&&w[0].slot==="wild","만능 도장 한 개가 찍힌다");
must(/우리 반 모두 가입/.test(w[0].t),"도장에 사유가 적힌다: "+w[0].t);
must(st("1102").week.stamps.some(x=>x.k==="welcome")&&st("1103").week.stamps.some(x=>x.k==="welcome"),"반 전원이 받는다");
must(!st("1201").week.stamps.length&&!st("1201").classFull,"다른 반은 아직");
join("1201","2026-10-08 09:00:00");join("1202","2026-10-08 10:00:00");
must(st("1201").week.stamps.some(x=>x.k==="welcome")&&st("1202").week.stamps.some(x=>x.k==="welcome"),"1-2 도 전원 가입하면 받는다");
must(st("1101").week.stamps.filter(x=>x.k==="welcome").length===1,"한 번만 받는다(다른 반 가입과 무관)");
join("1301","2026-10-08 11:00:00");
must(!st("1301").week.stamps.some(x=>x.k==="welcome"),"한 명뿐인 학급은 대상이 아니다");
/* 새 학생이 명단에 들어오면 다시 100% 가 아니게 된다 */
T["명단"].push({"학번":"1104","이름":"늦은","반":"1-1","이메일":"s1104@x","동의":"y"});
must(!st("1101").classFull&&!st("1101").week.stamps.some(x=>x.k==="welcome"),"명단에 새 학생이 들어오면 다시 기다린다");
join("1104","2026-10-09 09:00:00");
must(st("1101").week.stamps.some(x=>x.k==="welcome"),"그 학생까지 가입하면 다시 전원 도장");
/* 교사 화면 가입 현황 */
EMAIL="lib@x";const J=C().api("state",{}).join;
must(J&&J.rows.filter(r=>r.cls==="1-1")[0].pin===4,"교사 가입 현황에도 반영된다");
