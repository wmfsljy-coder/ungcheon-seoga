/* 선생님 도장(賞): 모든 선생님이 학번·이름으로 찾아 사유와 함께 찍어 준다.
   자리를 차지하지 않는 만능 도장이라, 그 주 다섯 자리가 어떻든 바로 한 칸이 된다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이메일":"lib@x","이름":"박서가","담당":"관리자"},
  {"이메일":"sci@x","이름":"최과학","담당":"교사"},{"이메일":"g1@x","이름":"이정민","담당":"1학년"});
[["1101","가온"],["1102","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":"1-1","이메일":"s"+h+"@x","동의":"y"}));
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};

/* 찾기 */
EMAIL="sci@x";
must(/학번이나 이름/.test(err(()=>C().api("stampFind",{q:""}))),"빈 검색은 막는다");
let f=C().api("stampFind",{q:"가온"});
must(f.list.length===1&&f.list[0].hakbun==="1101","이름으로 찾는다(교과 교사도)");
must(C().api("stampFind",{q:"1102"}).list[0].name==="두리","학번으로 찾는다");
EMAIL="s1101@x";
must(/교사만/.test(err(()=>C().api("stampFind",{q:"1101"}))),"학생은 찾을 수 없다");

/* 찍기 */
EMAIL="sci@x";
must(/한 마디 적어/.test(err(()=>C().api("stampGive",{hakbun:"1101",reason:"x"}))),"사유는 두 자 이상");
must(/명단에서 찾지/.test(err(()=>C().api("stampGive",{hakbun:"9999",reason:"좋은 질문"}))),"명단에 없는 학번은 거부");
C().api("stampGive",{hakbun:"1101",reason:"독서 토론에서 좋은 질문"});
must(T["도장"].length===1&&T["도장"][0]["교사"]==="최과학"&&T["도장"][0]["취소"]==="","도장 시트에 한 줄");
must(/이미 찍어/.test(err(()=>C().api("stampGive",{hakbun:"1101",reason:"또 주기"}))),"같은 학생에게는 하루 한 개");
C().api("stampGive",{hakbun:"1102",reason:"쉬는 시간마다 책을 읽음"});
must(T["도장"].length===2,"다른 학생에게는 같은 날도 된다");

/* 학생 도장판 */
let a=st("1101");
const w=a.week.stamps.filter(x=>x.k==="teacher")[0];
must(w&&/독서 토론에서 좋은 질문 · 최과학 선생님/.test(w.t),"사유와 선생님 이름이 도장판에 보인다");
must(w&&w.slot==="wild"&&w.extra===true,"자리를 차지하지 않는 만능 도장(덤)");
/* 자리를 다 채운 주에도 그대로 들어간다 */
T["글"].push({"id":"g1","시각":"2026-10-05 10:00:00","주":"2026-10-05","종류":"label","학번":"1101","반":"1-1","책제목":"책1","본문":"글","상태":"posted"},
  {"id":"g2","시각":"2026-10-05 11:00:00","주":"2026-10-05","종류":"review","학번":"1101","반":"1-1","책제목":"책2","본문":"글","상태":"posted"});
T["퀴즈"].push({"id":"q1","시각":"2026-10-06 10:00:00","학번":"1101","책제목":"책1","문제":"문제","품질":"8","상태":"대기","출처":"학생"});
T["퀴즈응답"].push({"주":"2026-10-05","학번":"1101","점수":"4","문항수":"5","시각":"2026-10-06 11:00:00"});
a=st("1101");
must(a.week.stamps.length===5&&a.week.stamps.filter(x=>x.k==="teacher").length===1,
  "네 자리를 채운 주에도 선생님 도장은 그대로(도장 "+a.week.stamps.length+"개)");
must(a.stars.leaf.have===0,"선생님 도장은 책갈피를 쓰지 않는다");

/* 하루 상한 */
EMAIL="lib@x";db.setConf("교사도장하루","1");
C().api("stampGive",{hakbun:"1101",reason:"도서관 정리를 도와줌"});
must(/오늘은 1개까지/.test(err(()=>C().api("stampGive",{hakbun:"1102",reason:"책을 추천해 줌"}))),"선생님 하루 상한");
db.setConf("교사도장하루","10");

/* 무르기 */
EMAIL="g1@x";
const id0=T["도장"][0]["id"];
must(/내가 찍은 도장만/.test(err(()=>C().api("stampUndo",{id:id0}))),"남이 찍은 도장은 못 무른다");
EMAIL="sci@x";C().api("stampUndo",{id:id0});
must(T["도장"][0]["취소"]==="Y"&&!st("1101").week.stamps.some(x=>x.t.indexOf("좋은 질문")>=0),"무르면 도장판에서 사라진다");
EMAIL="lib@x";
must(!err(()=>C().api("stampUndo",{id:T["도장"][1]["id"]})),"관리자는 남의 도장도 무를 수 있다");
/* 교사 화면 */
EMAIL="sci@x";const ts=C().api("state",{});
must(ts.given.length>=1&&ts.given[0].name,"교사 화면에 내가 찍어 준 도장 목록");
