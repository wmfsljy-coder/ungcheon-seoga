/* 라벨·문장·독후감은 종류마다 하루 1편(2026-10-09 회장님 지시)
   하루 합계는 2 → 3 으로(세 종류를 하루에 하나씩 낼 수 있게), 공지 '한 주 도장은 다섯 칸'에도 하루 규칙 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-12T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
/* 지금 실제 시트: 하루 2편, 공지 옛 문구 */
db.setConf("하루제출상한","2");
T["공지"]=[{"id":"g2","제목":"한 주 도장은 다섯 칸","내용":"10월 19일부터 라벨 1개·문장 1개(따로 도장), 독후감 2개, 퀴즈 2개까지, 모두 합쳐 한 주 5칸.","대상":"모두","고정":"Y"}];
const C=()=>Core.make(db,env);C().maintain();
must(cf("하루종류상한")==="1"&&cf("하루제출상한")==="3","설정: 종류마다 하루 1편 · 하루 합계 3");
must(/종류마다 하루 1편까지/.test(T["공지"][0]["내용"]),"공지 '한 주 도장'에 하루 규칙: "+T["공지"][0]["내용"]);
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y"});
const tok=C().api("login",{role:"student",hakbun:"3101",name:"가온",agree:true,newPin:"418207"}).token;
const as=(op,p)=>{try{return C().api(op,Object.assign({_t:tok},p||{}));}catch(x){return {ERR:x.message};}};
const txt=n=>"이 책은 생각보다 훨씬 좋았다. ".repeat(Math.ceil(n/16)).slice(0,n);
let bn=0;const sub=(kind,extra)=>as("submit",Object.assign({kind:kind,bookId:"free",title:"책"+(++bn),author:"지은이",text:txt(kind==="review"?320:kind==="quote"?40:60),why:"도서관에서 빌려 읽었다",page:kind==="label"?"":"12쪽"},extra||{}));
must(as("state").conf.dayKindCap===1,"화면에 '종류마다 하루 1편'이 알려진다");
must(!sub("label").ERR,"월요일 라벨 1편");
const e=sub("label").ERR||"";
must(/오늘은 라벨을 이미 1편 냈어요/.test(e),"같은 날 라벨 두 번째는 막힌다: "+e);
must(!sub("quote").ERR,"같은 날 문장 1편은 된다");
must(!sub("review").ERR,"같은 날 독후감 1편도 된다(하루 합계 3)");
must(/오늘은 문장을|하루에 3편/.test(sub("quote").ERR||""),"같은 날 네 번째 글(문장 두 번째)은 막힌다");
NOW=new Date("2026-10-13T03:00:00Z");
must(!sub("label").ERR,"다음 날에는 다시 라벨 1편");
/* 내려간 글은 세지 않는다 */
const last=T["글"][T["글"].length-1];last["상태"]="down";
must(!sub("label").ERR,"내린 글은 그날 편수에서 빠진다");
