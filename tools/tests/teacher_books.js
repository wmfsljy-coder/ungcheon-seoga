/* 선생님 추천 도서(2026-09-21): 권수 제한 없음 · 이번 달/다음 달 고르기 · 감사 안내와 라벨 권유.
   자동으로 뽑는 이달의 40권과는 따로 쌓인다. */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-06T01:00:00Z"),EMAIL="lib@x";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const BOOKS={"코스모스":"443 세68ㅋ","아몬드":"813 손66ㅇ","데미안":"853 헤53ㄷ","총균쇠":"909 다66ㅊ"};
const http=reqs=>reqs.map(q=>{
  if(q.body&&q.body.searchKeyword){const t=q.body.searchKeyword;
    if(BOOKS[t])return ok({totalCount:1,bookList:[{bookKey:"k"+t,title:t,author:"지은이 지음",callNo:BOOKS[t]+" c.1",isbn:"978898371189",categoryInfo:{lcode:"009000000"}}]});
    return ok({totalCount:0,bookList:[]});}
  if(q.url&&/state/.test(q.url))return ok({status:"대출가능"});
  return ok({});});
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  addMany:(t,l)=>l.forEach(o=>db.add(t,o)),replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
db.setConf("이달","2026-10");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const api=(n,p)=>{try{return C().api(n,p||{});}catch(e){return {ERR:e.message};}};

T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"},{"이메일":"sci@x","이름":"최과학","담당":"교사"});
const 분야=T["설정"].find(r=>r["항목"]==="추천분야")["값"].split(/[,\n]+/).map(s=>s.trim())[0];

/* ── 이번 달 ── */
EMAIL="sci@x";
let r=api("teacherBook",{subj:분야,t:"코스모스",a:"지은이",q:"우주를 처음 보는 눈",mon:"this"});
must(r.ok&&r.mon==="2026-10"&&r.next===false,"이번 달로 넣으면 이달(2026-10)에 들어간다");
must(/추천 도서 감사합니다/.test(r.thanks),"감사 안내가 온다: "+(r.thanks||"").slice(0,30)+"…");
must(/라벨/.test(r.tip),"라벨로도 남겨 달라는 안내가 온다");
must(T["도서"].find(b=>b["제목"]==="코스모스")["출처"]==="선생님","출처가 ‘선생님’ 으로 기록된다");

/* ── 다음 달 ── */
r=api("teacherBook",{subj:분야,t:"아몬드",a:"지은이",q:"감정을 배우는 이야기",mon:"next"});
must(r.ok&&r.mon==="2026-11"&&r.next===true,"다음 달로 넣으면 다음 달(2026-11)에 들어간다");
must(/11월 1일부터/.test(r.thanks),"다음 달 안내에 언제부터 보이는지 나온다");
must(T["도서"].find(b=>b["제목"]==="아몬드")["월"]==="2026-11","시트의 월 칸이 다음 달");

/* ── 권수 제한 없음 ── */
let n=0;
for(const t of ["데미안","총균쇠"]){ if(api("teacherBook",{subj:분야,t:t,a:"지은이",q:"한 줄",mon:"this"}).ok)n++; }
must(n===2,"세 권째·네 권째도 막히지 않는다(권수 제한 없음)");
must(!Core.CONF0.some(r2=>r2[0]==="교사추천상한"),"설정에서 교사추천상한이 사라졌다");

/* ── 같은 달 같은 책은 한 번만, 다른 달은 따로 ── */
must(/이미 이번 달/.test(api("teacherBook",{subj:분야,t:"코스모스",a:"지은이",mon:"this"}).ERR),"같은 달에 같은 책은 다시 못 넣는다");
must(api("teacherBook",{subj:분야,t:"코스모스",a:"지은이",mon:"next"}).ok,"다음 달에는 같은 책을 넣을 수 있다");

/* ── 학생 화면: 이번 달 책만 보인다 ── */
T["명단"].push({"학번":"3101","이름":"가","반":"3-1","이메일":"s1@x","동의":"y"});
EMAIL="s1@x";
const bt=(api("state",{}).books||[]).map(b=>b.t);
must(bt.indexOf("코스모스")>=0,"이번 달 추천 도서는 학생에게 보인다");
must(bt.indexOf("아몬드")<0,"다음 달 추천 도서는 아직 안 보인다");

/* ── 달이 바뀌면 다음 달 책이 나온다 ── */
db.setConf("이달","2026-11");
const bt2=(api("state",{}).books||[]).map(b=>b.t);
must(bt2.indexOf("아몬드")>=0,"11월이 되면 다음 달로 넣은 책이 보인다");
must(bt2.indexOf("데미안")<0,"10월에만 넣은 책은 11월에 안 보인다");

/* ── 내가 넣은 책 목록: 이번 달 + 다음 달 ── */
db.setConf("이달","2026-10");
EMAIL="sci@x";
const my=api("state",{}).myBooks||[];
must(my.length===5,"내가 넣은 책 5권이 보인다(이번 달 4 + 다음 달 2 중 내 것)   실제 "+my.length);
must(my.some(x=>x.next===true)&&my.some(x=>x.next===false),"이번 달·다음 달이 구분되어 표시된다");
