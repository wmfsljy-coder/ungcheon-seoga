/* 시트에서 바로 조작하기(2026-09-25): 공지 한곳으로, 교사 승인, 핀 비우면 기기도 해제, 라벨·문장 주 3편 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const conf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
db.setConf("이달","2026-10");
T["명단"].push({"학번":"1101","이름":"가온","반":"1-1","동의":"y"});
[1,2,3,4].forEach(i=>T["도서"].push({"id":"m"+i,"제목":"추천책 "+i+"호","지은이":"지은이"+i,"영역":"소설","출처":"자동","월":"2026-10","소장":"Y","권수":"2"}));
const tok=C().api("login",{role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"418205"}).token;
const as=(op,p)=>{try{return C().api(op,Object.assign({_t:tok},p||{}));}catch(x){return {ERR:x.message};}};
const text=n=>"이 책은 정말 좋았다. ".repeat(Math.ceil(n/12)).slice(0,n);

/* ── 라벨·문장은 한 주 3편(첫 편 도장, 나머지 책갈피) ── */
must(!as("submit",{kind:"label",bookId:"m1",text:text(60),why:"도서관에서 빌려 읽었다"}).ERR,"첫 편(라벨)");
NOW=new Date("2026-10-08T01:00:00Z");
must(!as("submit",{kind:"quote",bookId:"m2",page:"45쪽",text:"오래 기억하고 싶은 한 문장이 여기에 있다.",why:"수업에서 듣고 읽었다"}).ERR,"둘째 편(문장)");
NOW=new Date("2026-10-09T01:00:00Z");
must(!as("submit",{kind:"quote",bookId:"m3",page:"12쪽",text:"두 번째로 옮겨 적는 문장도 여기에 남긴다.",why:"친구가 권해서 읽었다"}).ERR,"셋째 편(문장)");
const over=as("submit",{kind:"label",bookId:"m4",text:text(60),why:"도서관에서 또 빌렸다"});
must(/한 주에 합쳐서 3편/.test(over.ERR||""),"넷째 편은 막힌다");
const w=as("state").week;
must(w.stamps.filter(x=>x.slot==="write").length===1,"라벨·문장 도장은 한 주 1개");
must(w.leaf&&w.leaf.have===2,"나머지 두 편은 책갈피 2장 ("+(w.leaf&&w.leaf.have)+")");
NOW=new Date("2026-10-12T01:00:00Z");   /* 다음 주 월요일 */
must(!as("submit",{kind:"label",bookId:"m4",text:text(60),why:"새 주가 되어 다시 쓴다"}).ERR,"다음 주에는 다시 쓸 수 있다");

/* ── 공지: 설정 칸에 적어도 공지 시트로 옮겨진다 ── */
db.setConf("공지사항","도서관 휴관: 10월 9일 한글날");
C().maintain();
must(!conf("공지사항")&&T["공지"].some(r=>r["제목"]==="도서관 휴관"&&r["고정"]==="Y"),"설정에 적은 공지가 공지 시트로");
const n0=T["공지"].length;C().maintain();
must(T["공지"].length===n0,"두 번 돌려도 공지가 겹치지 않는다");
/* 시트에서 바로 적어도 학생에게 보인다 */
T["공지"].push({"id":"n9","시작":"","끝":"","제목":"시트에서 쓴 공지","내용":"바로 보입니다","대상":"학생","고정":"","숨김":""});
must(as("state").notices.some(n=>n.title==="시트에서 쓴 공지"),"시트에 적은 줄이 학생 화면에");

/* ── 교사신청: 시트에서 '승인'으로 고치면 교사 명단으로 ── */
T["교사"].push({"이름":"사서","담당":"관리자"});
T["교사신청"].push({"id":"r1","시각":"2026-10-07 09:00:00","이름":"한상담","이메일":"","상태":"대기"});
C().maintain();
must(!T["교사"].some(r=>r["이름"]==="한상담"),"대기 중에는 그대로");
db.set("교사신청","id","r1",{"상태":"승인"});
C().maintain();
must(T["교사"].some(r=>r["이름"]==="한상담"&&r["담당"]==="교사"),"시트에서 승인하면 교사 명단에 들어간다");
const before=T["교사"].length;C().maintain();
must(T["교사"].length===before,"두 번 돌려도 겹치지 않는다");

/* ── 명단에서 핀 칸을 비우면 로그인해 둔 기기도 풀린다 ── */
must(as("state").me.id==="1101","아직 자동 로그인 중");
db.set("명단","학번","1101",{"핀":""});
C().maintain();
const after=as("state");
must(!after.me||after.me.role==="nologin"||after.need,"핀을 지우면 그 기기도 함께 풀린다 ("+JSON.stringify(after).slice(0,60)+")");
must(T["기기"].every(r=>r["해제"]==="Y"),"기기 표에 해제로 남는다");

/* ── 옛 공감·투표 탭을 '반응' 한곳으로 ── */
(function(){
  const T2={};Object.keys(Core.HEAD).forEach(t=>T2[t]=[]);
  T2["공감"]=[{"시각":"2026-10-20","글id":"g1","누른이":"h1"}];
  T2["투표"]=[{"시각":"2026-10-20","주":"2026-10-19","종류":"label","투표자":"v1","글id":"g2"}];
  const env2={now:()=>new Date("2026-10-21T01:00:00Z"),email:()=>"",uid:()=>Math.random().toString(36).slice(2,9),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
  const db2={replace:(t,l)=>{T2[t]=[];l.forEach(o=>db2.add(t,o));},rows:t=>T2[t],
    add:(t,o)=>{const r={};(Core.HEAD[t]||Object.keys(o)).forEach(h=>r[h]=o[h]==null?"":String(o[h]));T2[t].push(r)},
    addMany:(t,l)=>l.forEach(o=>db2.add(t,o)),
    set:(t,k,v,p)=>T2[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
    setMany:(t,k,m)=>T2[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
    setConf:(k,v)=>{const h=T2["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T2["설정"].push({"항목":k,"값":v})}};
  Core.make(db2,env2).maintain();
  const R=T2["반응"]||[];
  must(R.length===2,"옛 두 탭의 기록이 반응으로 ("+R.length+"줄)");
  must(R.some(r=>r["갈래"]==="공감"&&r["글id"]==="g1"&&r["누구"]==="h1"),"공감 한 줄이 그대로");
  must(R.some(r=>r["갈래"]==="투표"&&r["부문"]==="label"&&r["주"]==="2026-10-19"&&r["누구"]==="v1"),"투표 한 줄이 부문·주와 함께");
  must(!T2["공감"].length&&!T2["투표"].length,"옛 탭은 비워진다(시트 정리가 지움)");
  const n=T2["반응"].length;Core.make(db2,env2).maintain();
  must(T2["반응"].length===n,"두 번 돌려도 겹치지 않는다");
})();
