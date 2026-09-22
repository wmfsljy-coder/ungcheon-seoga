/* 가입 현황(2026-09-22): 학년 담당은 우리 학년, 관리자는 전교 + 선생님 가입까지 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-06T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const login=p=>C().api("login",p);
const state=t=>C().api("state",{_t:t});

T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"일담","담당":"1학년"},{"이름":"이담","담당":"2학년"},{"이름":"과학","담당":"교사"});
/* 1학년 4명 중 2명이 PIN 을 정했고, 2학년 2명 중 1명 */
[["1101","가온",1],["1102","나리",1],["1103","다솜",0],["1104","라온",0],["2101","마루",1],["2102","바다",0]]
  .forEach(([h,n,pin])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+String(Number(h[1])),"핀":pin?"h핀":"","동의":pin?"y":"","비고":h==="1103"?"전학생":""}));
/* 1101 은 기기에 로그인해 두었고 글도 한 편 썼다(내려간 글은 세지 않는다) */
T["기기"].push({"id":"d1","계정":"s:1101","토큰":"hdev|x","만료":"2026-12-31","해제":""});
T["글"].push({"id":"g1","학번":"1101","반":"1-1","상태":"posted"},{"id":"g2","학번":"1103","반":"1-1","상태":"down"});
db.set("명단","학번","1104",{"잠금":"2026-10-06 13:00:00"});

/* 선생님들이 들어온다 */
const t1=login({role:"teacher",name:"일담",newPin:"820134"}).token;
const t2=login({role:"teacher",name:"사서",newPin:"713902"}).token;
const t3=login({role:"teacher",name:"과학",newPin:"550481"}).token;

/* ① 학년 담당: 우리 학년만 */
const J1=state(t1).join;
must(J1&&J1.scope==="1학년","학년 담당은 우리 학년 현황을 본다");
must(J1.sum.total===4&&J1.sum.pin===2,"1학년 4명 중 2명 가입");
must(J1.rows.length===1&&J1.rows[0].cls==="1-1"&&J1.rows[0].pin===2,"반마다 가입 수가 나온다");
must(J1.waitN===2&&J1.wait.map(x=>x.hakbun).join()==="1103,1104","아직 안 들어온 학생이 학번순으로");
must(J1.wait[0].name==="다솜"&&J1.wait[0].memo==="전학생","이름과 비고도 함께(선생님만 봄)");
must(J1.sum.dev===1,"기기에 로그인해 둔 학생 수");
must(J1.sum.wrote===1,"글 쓴 학생은 내려간 글을 빼고 센다");
must(J1.rows[0].lock===1,"잠긴 계정도 반마다 보인다");
must(!J1.teachers,"학년 담당에게는 선생님 가입이 보이지 않는다");

/* ② 관리자: 전교 + 선생님 */
const J2=state(t2).join;
must(J2.scope==="전교"&&J2.sum.total===6&&J2.sum.pin===3,"관리자는 전교 6명 중 3명 가입");
must(J2.rows.map(x=>x.cls).join()==="1-1,2-1","반이 차례대로");
must(J2.waitN===3,"아직 안 들어온 학생 3명");
must(J2.teachers.total===4&&J2.teachers.pin===3,"선생님 4분 중 3분 가입");
must(J2.teachers.wait[0].name==="이담"&&J2.teachers.wait[0].job==="2학년 담당","안 들어오신 선생님은 담당과 함께");

/* ③ 교과 교사에게는 없다 */
must(state(t3).join===null,"교과 교사는 가입 현황을 보지 않는다");

/* ④ 한 명이 들어오면 바로 반영 */
login({role:"student",hakbun:"1103",name:"다솜",agree:true,newPin:"640217"});
const J3=state(t1).join;
must(J3.sum.pin===3&&J3.waitN===1,"학생이 PIN 을 정하면 가입 수가 오른다");
