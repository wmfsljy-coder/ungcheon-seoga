/* 로그인: 학생(학번·이름·메일)·선생님(이름·메일) → 메일 인증번호 → 같은 PC 자동 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-09-21T01:00:00Z");const MAIL=[];
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>require("crypto").createHash("sha256").update("k"+s).digest("hex"),http:()=>{throw 1},
  mail:(to,sub,body)=>MAIL.push({to,sub,code:(/인증번호: (\d+)/.exec(body)||[])[1]})};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@school.kr","이름":"사서","담당":"전체"},{"이메일":"","이름":"김담임","담당":"3학년"});
T["명단"].push({"학번":"30201","이름":"김서준","반":"3-2","이메일":"","동의":""},{"학번":"30202","이름":"이도윤","반":"3-2","이메일":"pre@x.com","동의":""});
const C=()=>Core.make(db,env);C().maintain();
const api=(n,p)=>{try{return C().api(n,p)}catch(e){return {ERR:e.message}}};
const last=()=>MAIL[MAIL.length-1].code;const tick=()=>{NOW=new Date(NOW.getTime()+31000);};
const must=(c,m)=>{if(!c)throw new Error("시험 실패: "+m);};
must(api("state",{}).need==="login","토큰 없으면 로그인");
must(/학번/.test(api("authStart",{role:"student",name:"김서준",email:"a@gmail.com"}).ERR),"학번 없음");
must(/명단에 없는/.test(api("authStart",{role:"student",hakbun:"30201",name:"김서주",email:"a@gmail.com"}).ERR),"틀린 이름");
must(api("authStart",{role:"student",hakbun:"30201",name:"김 서준",email:"a@gmail.com"}).need==="consent","처음이면 동의");
must(api("authStart",{role:"student",hakbun:"30201",name:"김서준",email:"A@gmail.com",agree:true}).sent,"번호 보냄");
must(/맞지 않/.test(api("authVerify",{email:"a@gmail.com",code:"000000"}).ERR),"틀린 번호");
const tA=api("authVerify",{email:"a@gmail.com",code:last(),remember:true}).token;must(tA,"토큰");
must(T["명단"][0]["이메일"]==="a@gmail.com"&&T["명단"][0]["동의"],"명단에 메일·동의");
must(api("state",{_t:tA}).me.name==="김서준","같은 PC 자동");
tick();must(/다른 메일/.test(api("authStart",{role:"student",hakbun:"30201",name:"김서준",email:"evil@x.com",agree:true}).ERR),"남의 학번 막기");
tick();must(api("authStart",{role:"student",hakbun:"30201",name:"김서준",email:"a@gmail.com"}).sent,"두 번째 PC는 동의 없이");
/* 메일이 미리 적힌 학생: 동의만 받고 들어옴 */
tick();must(api("authStart",{role:"student",hakbun:"30202",name:"이도윤",email:"pre@x.com"}).need==="consent","미리 적힌 학생 동의");
tick();api("authStart",{role:"student",hakbun:"30202",name:"이도윤",email:"pre@x.com",agree:true});const tP=api("authVerify",{email:"pre@x.com",code:last()}).token;
must(T["명단"][1]["동의"]&&api("state",{_t:tP}).me.name==="이도윤","동의 기록");
/* 선생님: 교사 시트에 이름만 있으면 메일을 묶음 */
tick();must(api("authStart",{role:"teacher",name:"김담임",email:"kim.t@gmail.com"}).sent,"교사 이름으로");
const tT=api("authVerify",{email:"kim.t@gmail.com",code:last()}).token;must(api("state",{_t:tT}).me.label==="3학년 담당","교사 메일 묶기");
/* 명단에 없는 선생님 → 승인 요청 → 관리자 승인 → 로그인 */
tick();must(api("authStart",{role:"teacher",name:"박새내기",email:"new.t@gmail.com"}).need==="approval","승인 요청");
tick();api("authStart",{role:"teacher",name:"사서",email:"lib@school.kr"});const tL=api("authVerify",{email:"lib@school.kr",code:last()}).token;
const rq=api("state",{_t:tL}).teacherReqs;must(rq.length===1,"관리자에게 요청 보임");
must(api("teacherOk",{_t:tL,id:rq[0].id,dam:"교사"}).ok,"승인");must(MAIL[MAIL.length-1].to==="new.t@gmail.com","승인 메일");
tick();must(api("authStart",{role:"teacher",name:"박새내기",email:"new.t@gmail.com"}).sent,"승인 뒤 로그인");
must(api("logout",{_t:tA}).ok&&api("state",{_t:tA}).need==="login","로그아웃");
console.log("로그인 시험 통과");
