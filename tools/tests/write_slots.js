/* 글쓰기 세 갈래(라벨·문장·독후감)와 한 주 도장 자리(2026-09-22 규칙)
   ① 라벨·문장은 둘을 합쳐 한 주 한 칸  ② 같은 자리를 또 채우면 책갈피 한 장, 그 뒤는 기록만
   ③ 책갈피 5장 = 만능 도장 1개(한 주 1개)  ④ 한 주 다섯 칸: 라벨·문장 / 독후감 / 퀴즈 출제 / 퀴즈 풀이 / 만능 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-09T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;db.setConf("로그인방식","구글");db.setConf("하루제출상한","9");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이름":"사서","담당":"관리자","이메일":"lib@x"});
[["3101","가온"],["3102","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"s"+h+"@x","동의":"y"}));
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
const err=f=>{try{f();return "";}catch(e){return e.message;}};

/* ── 문장 제출 ── */
EMAIL="s3101@x";
const quote={kind:"quote",bookId:"free",title:"아몬드",author:"손원평",page:"88쪽",
  why:"도서관에서 표지를 보고 빌렸습니다",text:"나는 내가 아는 것보다 조금 더 오래 기다릴 수 있는 사람이었다."};
must(/쪽/.test(err(()=>C().api("submit",Object.assign({},quote,{page:""})))),"문장은 쪽수를 적어야 한다");
must(/글자 수/.test(err(()=>C().api("submit",Object.assign({},quote,{text:"짧다"})))),"문장도 글자 수를 지킨다("+"15~120자)");
C().api("submit",quote);
must(T["글"].length===1&&T["글"][0]["종류"]==="quote","글 시트에 종류 quote 로 들어간다");
let a=st("3101");
must(a.week.stamps.length===1&&a.week.stamps[0].slot==="write","문장 한 편 = 라벨·문장 자리 한 칸");
must(a.mine[0].kind==="quote"&&a.board.some(x=>x.kind==="quote"),"내 서재·게시판에 문장이 보인다");

/* ── 라벨과 문장은 합쳐서 한 칸 ── */
C().api("submit",{kind:"label",bookId:"free",title:"완득이",author:"김려령",why:"친구가 권해서 읽었습니다",
  text:"싸움 잘하는 애 이야기인 줄 알았는데, 다 읽고 나니 옆집 아저씨가 자꾸 생각난다."});
a=st("3101");
must(a.week.stamps.length===1&&a.week.bonus===1,"같은 주 라벨은 도장이 아니라 책갈피 한 장(도장 "+a.week.stamps.length+" · 책갈피 "+a.week.bonus+")");
C().api("submit",{kind:"label",bookId:"free",title:"하얼빈",author:"김훈",why:"국어 시간에 이름을 들었습니다",
  text:"문장이 짧아서 금방 읽히는데, 다 읽고 나면 한 문장씩 다시 읽게 된다."});
a=st("3101");
must(a.week.stamps.length===1&&a.week.bonus===1&&a.week.over===1,"세 번째부터는 기록만 남는다(책갈피는 자리마다 주 1장)");

/* ── 자리 넷을 채우면 네 칸 ── */
C().api("submit",{kind:"review",bookId:"free",title:"아몬드",author:"손원평",page:"132쪽",head:"감정을 배우는 일",
  why:"문장을 옮겨 적다가 끝까지 읽었습니다",text:"읽기 전에는 ".padEnd(320,"감정이라는 말이 무엇인지 몰랐다. ")});
T["퀴즈"].push({"id":"q1","시각":"2026-10-06 10:00:00","학번":"3101","책제목":"아몬드","문제":"문제","품질":"8","상태":"대기","출처":"학생"});
T["퀴즈응답"].push({"주":"2026-10-05","학번":"3101","점수":"4","문항수":"5","시각":"2026-10-07 10:00:00"});
a=st("3101");
must(a.week.stamps.length===4&&a.week.stamps.map(x=>x.slot).sort().join()==="quizmk,quizsv,review,write",
  "한 주에 채울 수 있는 자리는 넷(만능은 책갈피로): "+a.week.stamps.map(x=>x.slot).join("·"));

/* ── 책갈피 다섯 장 = 만능 도장 ── */
T["퀴즈"].push({"id":"q2","시각":"2026-10-06 11:00:00","학번":"3101","책제목":"완득이","문제":"문제","품질":"8","상태":"대기","출처":"학생"});
T["퀴즈응답"].push({"주":"2026-10-05","학번":"3101","점수":"5","문항수":"5","시각":"2026-10-07 11:00:00"});
C().api("submit",{kind:"review",bookId:"free",title:"하얼빈",author:"김훈",page:"20쪽",head:"짧은 문장",
  why:"도서관에서 한 권 더 빌렸습니다",text:"두 번째 독후감입니다. ".padEnd(320,"문장이 짧아서 자꾸 다시 읽게 된다. ")});
a=st("3101");
must(a.week.stamps.length===4&&a.stars.leaf.have===4,"책갈피가 넉 장 모였다(아직 만능 도장 없음 · "+a.stars.leaf.have+"장)");
/* 다음 주에 라벨 두 편 → 한 칸 + 다섯 번째 책갈피 → 만능 도장 */
NOW=new Date("2026-10-16T03:00:00Z");
EMAIL="s3101@x";
C().api("submit",{kind:"label",bookId:"free",title:"코스모스",author:"칼 세이건",why:"과학 시간에 소개받았습니다",
  text:"아무 장이나 펴서 읽어도 되는 책. 두께 보고 겁먹지 말 것, 문장이 아름답다."});
C().api("submit",{kind:"quote",bookId:"free",title:"코스모스",author:"칼 세이건",page:"12쪽",
  why:"같은 책에서 한 문장 더 옮깁니다",text:"우리는 코스모스의 일부이며, 이것은 결코 시적인 표현이 아니다."});
a=st("3101");
must(a.stars.leaf.have===0&&a.week.stamps.some(x=>x.slot==="wild"),"책갈피 다섯 장 → 만능 도장 1개(남은 책갈피 "+a.stars.leaf.have+"장)");
must(a.week.stamps.length===2,"그 주 도장은 라벨·문장 한 칸 + 만능 한 칸("+a.week.stamps.length+"칸)");
must(a.stars.stamps===6,"누적 도장 6개("+a.stars.stamps+")");

/* ── 만능 도장은 한 주 하나 ── */
T["퀴즈"].push({"id":"q3","시각":"2026-10-13 10:00:00","학번":"3101","책제목":"코스모스","문제":"문제","품질":"8","상태":"대기","출처":"학생"});
T["퀴즈"].push({"id":"q4","시각":"2026-10-13 11:00:00","학번":"3101","책제목":"하얼빈","문제":"문제","품질":"8","상태":"대기","출처":"학생"});
T["퀴즈응답"].push({"주":"2026-10-12","학번":"3101","점수":"5","문항수":"5","시각":"2026-10-14 10:00:00"});
T["퀴즈응답"].push({"주":"2026-10-12","학번":"3101","점수":"5","문항수":"5","시각":"2026-10-14 11:00:00"});
a=st("3101");
must(a.week.stamps.filter(x=>x.slot==="wild").length===1,"만능 도장은 한 주에 하나까지");
must(a.stars.leaf.have===2,"남은 책갈피 두 장은 다음 주로 넘어간다(지금 "+a.stars.leaf.have+"장)");

/* ── 같은 책 같은 종류는 한 번만, 종류가 다르면 된다 ── */
must(/같은 종류의 글/.test(err(()=>C().api("submit",{kind:"quote",bookId:"free",title:"코스모스",author:"칼 세이건",page:"12쪽",
  why:"또 냅니다",text:"우리는 코스모스의 일부이며, 이것은 결코 시적인 표현이 아니다."}))),"같은 책 같은 종류는 한 번만");
must(!err(()=>C().api("submit",{kind:"review",bookId:"free",title:"코스모스",author:"칼 세이건",page:"9쪽",head:"별의 먼지",
  why:"문장을 옮겨 적고 나서 끝까지 읽었습니다",text:"세 번째 독후감입니다. ".padEnd(320,"우주는 생각보다 조용하고 넓다. ")})),"같은 책이어도 종류가 다르면 낼 수 있다");
