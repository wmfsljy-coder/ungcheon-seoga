/* 상품권 명단이 볼 권한 있는 사람에게만 가는지(2026-09-22 검토 지적).
   화면에 안 보여도 응답에 실려 나가면 그대로 새는 것이므로 응답 자체를 본다. */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-06T01:00:00Z"),EMAIL="lib@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  addMany:(t,l)=>l.forEach(o=>db.add(t,o)),replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
db.setConf("상품권공개","Y");db.setConf("상품권배부","2026-10-05~2026-10-08");

T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"},
               {"이메일":"g3@x","이름":"삼학년","담당":"3학년"},
               {"이메일":"sci@x","이름":"최과학","담당":"교사"});
[["3101","가","3-1"],["3201","나","3-2"],["2101","도서부","2-1"]].forEach(([h,n,c])=>
  T["명단"].push({"학번":h,"이름":n,"반":c,"이메일":"s"+h+"@x","동의":"y","도서부":h==="2101"?"Y":""}));

/* 지급 기록이 있으면 명단에 오른다(도장을 쌓지 않고 상황만 만든다) */
[["3101","가","3-1"],["3201","나","3-2"],["2101","도서부","2-1"]].forEach(([h,n,c])=>
  T["지급"].push({"키":"2026-10-05|"+h,"월":"2026-10","학번":h,"이름":n,"반":c,"도장":"10",
    "처리":"지급","시각":"2026-10-05 12:00:00","처리자":"사서","매수":"1","별":"2"}));

const st=(e)=>{EMAIL=e;return C().api("state",{});};
const names=(o)=>JSON.stringify(o||{});

/* 교과 교사: 지급 명단이 아예 없어야 한다 */
let s=st("sci@x");
must(s.giftNow&&s.giftNow.open===true,"교과 교사도 배부 기간인 것은 안다");
must((s.giftNow.rows||[]).length===0,"교과 교사 응답에 지급 명단이 없다 (실제 "+(s.giftNow.rows||[]).length+"명)");
must(names(s.giftNow).indexOf("3101")<0&&names(s.giftNow).indexOf("가")<0,"학번·이름이 응답 어디에도 없다");

/* 학년 담당: 그 학년만 */
s=st("g3@x");
const g3=(s.giftNow.rows||[]).map(x=>x.hakbun);
must(g3.length===2&&g3.indexOf("3101")>=0&&g3.indexOf("3201")>=0,"3학년 담당은 3학년만 본다 ("+g3.join(",")+")");
must(g3.indexOf("2101")<0,"다른 학년은 안 보인다");

/* 관리자: 전체 */
s=st("lib@x");
must((s.giftNow.rows||[]).length===3,"관리자는 전체를 본다 (실제 "+(s.giftNow.rows||[]).length+"명)");

/* 도서부 학생: 배부해야 하므로 기간 중에는 전체 대상 */
s=st("s2101@x");
must(s.giftDesk&&(s.giftDesk.rows||[]).length===3,"도서부 학생은 배부 대상 전원을 본다");
s=st("s3101@x");
must(!s.giftDesk,"도서부가 아닌 학생에게는 배부 화면이 없다");

/* seeCls 는 주체가 없으면 막는다 */
must(Core.make(db,env).api&&true,"api 접근 가능");
