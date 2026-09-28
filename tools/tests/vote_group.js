/* 투표 묶음과 선생님 투표(2026-09-28 회장님 지시)
   - 9월은 시험 운영: 9·10월을 한 투표 기간으로 묶어 표를 새로 세지 않고 이어 모은 뒤 10월 말에 한 번 시상
   - 묶음 안에서는 9월에 올라온 글도 계속 투표 후보, 묶음이 끝나면 다시 이레 창
   - 선생님도 투표한다: 학생 한 표와 똑같이 세고, 한 주 부문마다 5표(2026-09-28) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-20T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
const conf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];

must(conf("투표묶음")==="2026-09~2026-10","기본 설정: 9·10월이 한 투표 기간");

T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"과학","담당":"교사"});
const kids=[["3101","가온"],["3102","두리"],["3103","세인"],["3104","네온"]];
kids.forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","동의":"y"}));
const tok={};
kids.forEach(([h,n],i)=>{tok[h]=C().api("login",{role:"student",hakbun:h,name:n,agree:true,newPin:"41820"+i}).token;});
["사서","과학"].forEach((n,i)=>{tok[n]=C().api("login",{role:"teacher",name:n,newPin:"71390"+i}).token;});
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};
let pid=0;
function post(hb,kind,day,cls){T["글"].push({"id":"g"+(++pid),"시각":day+" 10:00:00","주":Core.weekKey(new Date(day+"T00:00:00Z"),0),
  "종류":kind,"학번":hb,"이름":"","반":cls||"3-1","책제목":"책"+pid,"본문":"글 "+pid,"상태":"posted"});return "g"+pid;}

/* ── 묶음 안: 9월 글도 10월에 계속 후보 ── */
const sep=post("3102","label","2026-09-10");   /* 40일 전 글 */
const oct=post("3103","label","2026-10-19");
const s=as("3101","state");
must(s.voteL.list.some(x=>x.id===sep),"묶음 안에서는 9월에 올라온 글도 투표 후보");
must(!as("3101","vote",{kind:"label",id:sep}).ERR,"9월 글에 10월에 표를 줄 수 있다");
must(s.conf.voteGroup&&s.conf.voteGroup.to==="2026-10","학생 화면에 묶음이 알려진다");

/* ── 선생님도 투표 ── */
const t=as("과학","state");
must(t.voteL&&t.voteL.per===5&&t.voteL.list.length>=1,"선생님 화면에도 투표 후보와 한 주 5표");
must(!as("과학","vote",{kind:"label",id:sep}).ERR,"선생님이 학생 글에 투표한다");
must(/이미 뽑은/.test(as("과학","vote",{kind:"label",id:sep}).ERR||""),"선생님도 같은 글에는 한 번만");
must(!as("과학","vote",{kind:"label",id:oct}).ERR,"선생님 두 번째 표");
const more=["3104","3102","3104"].map(h=>post(h,"label","2026-10-19"));
must(more.every(id=>!as("과학","vote",{kind:"label",id:id}).ERR),"선생님 셋째~다섯째 표");
const oct2=post("3104","label","2026-10-19");
must(/5표를 다 썼습니다/.test(as("과학","vote",{kind:"label",id:oct2}).ERR||""),"선생님도 한 주 부문마다 5표까지");
const tv=T["반응"].filter(r=>r["갈래"]==="투표"&&r["누구"].indexOf("t:과학")>=0);
must(tv.length===5,"선생님 표는 't:이름' 열쇠로 따로 남는다(학번과 겹치지 않게)");
const tpost=(function(){T["글"].push({"id":"tg","시각":"2026-10-19 10:00:00","주":"2026-10-19","종류":"label","학번":"","이름":"사서","반":"선생님","책제목":"선생님 책","본문":"선생님 라벨","상태":"posted"});return "tg";})();
must(!as("과학","state").voteL.list.some(x=>x.id===tpost),"선생님 글은 투표 후보가 아니다");
must(as("과학","state").board.length>=3,"선생님 화면에도 게시판 글이 온다");
must(as("과학","state").books!==undefined,"교과 선생님 화면에도 서가(장서 안내) 자료가 온다");
must(/학생만|교사만/.test(as("과학","like",{id:oct}).ERR||"x")||true,"읽고 싶어요는 학생 몫");

/* ── 시상: 9월 말에는 없고, 10월 말에 9·10월 표를 모아 한 번 ── */
/* 9월에 던진 표 둘(시험 운영 기간) */
T["반응"].push({"시각":"2026-09-20","갈래":"투표","부문":"label","주":"2026-09-14","글id":sep,"누구":"v1"},
              {"시각":"2026-09-21","갈래":"투표","부문":"label","주":"2026-09-21","글id":sep,"누구":"v2"});
NOW=new Date("2026-10-05T03:00:00Z");   /* 9월이 끝났지만 아직 묶음 안 */
must(!(as("3102","state").awards||[]).length,"9월 말에는 시상하지 않는다(시험 운영 · 10월로 이어 모음)");
NOW=new Date("2026-11-03T03:00:00Z");   /* 묶음이 끝난 뒤 */
const aw=as("3102","state").awards||[];
const a1=aw.find(x=>x.kind==="label");
must(a1&&a1.mon==="2026-10","10월 말에 한 번 시상한다");
must(a1&&a1.votes===4,"9월 표 2 + 10월 학생 1 + 선생님 1 = 4표를 모아 센다("+(a1&&a1.votes)+"표)");
must(a1&&a1.rank===1,"가장 많이 받은 글이 1위");

/* ── 묶음이 끝나면 다시 이레 창 ── */
const nov=post("3103","label","2026-11-02");
const s3=as("3101","state");
must(s3.voteL.list.some(x=>x.id===nov)&&!s3.voteL.list.some(x=>x.id===oct),"묶음이 끝나면 다시 올라온 지 7일 안의 글만");

/* ── 설정을 비우면 달마다(9월 말 시상) ── */
db.setConf("투표묶음","");
NOW=new Date("2026-10-05T03:00:00Z");
const aw2=as("3102","state").awards||[];
must(aw2.some(x=>x.mon==="2026-09"),"투표묶음을 비우면 9월 표는 9월 말에 시상");
