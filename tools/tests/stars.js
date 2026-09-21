/* 별과 상품권 규칙(회장님 2026-09-20):
   ① 한 주 도장 최대 5개  ② 도장·별 누적, 도장 5개 = 별 1개  ③ 별 2개 = 문화상품권 5천 원 1매  ④ 한 번(한 달) 최대 2매
   ⑤ 도서부가 배부 완료 → 학생 '수령했어요'  ⑥ 공지: 수령 기간 지나면 별이 사라짐  ⑦ 받으면 별이 사라짐  ⑧ 별 1개는 대상 아님 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-09-30T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;   /* maintain 이 넣어 주는 주제 초안은 이 시험에서 치운다 */
db.setConf("상품권공개","Y");db.setConf("상품권배부","2026-10-05~2026-10-08, 2026-11-02~2026-11-05");
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"},{"이메일":"g3@x","이름":"삼","담당":"3학년"});
[["3101","가"],["3102","나"],["3103","다"],["3104","라"],["3105","마"],["2101","도서부"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"s"+h+"@x","동의":"y","도서부":h==="2101"?"Y":""}));
/* 2026-09-20 규칙: 별 1개에는 라벨·독후감·퀴즈가 하나씩 필요 → 한 주 도장은 라벨·독후감·퀴즈·라벨·라벨 순으로 만든다 */
let pid=0;const seenW={};
function days(hb,list){list.forEach(d=>{
  const w=Core.weekKey(new Date(d+"T00:00:00Z"),0),key=hb+"|"+w,i=(seenW[key]=(seenW[key]||0)+1)-1;
  const k=i===1?"review":i===2?"quiz":"label";
  if(k==="quiz")T["퀴즈응답"].push({"주":w,"학번":hb,"점수":"4","문항수":"5","시각":d+" 1"+(pid++%10)+":00:00"});
  else T["글"].push({"id":"g"+(pid++),"시각":d+" 1"+(pid%10)+":00:00","종류":k,"학번":hb,"반":"3-1","책제목":"책"+pid,"상태":"posted"});});}
function wk(mon,n){const out=[];for(let i=0;i<n;i++)out.push(new Date(Date.parse(mon+"T00:00:00Z")+i*864e5).toISOString().slice(0,10));return out;}
/* 도장판은 달마다 새로: 그달 도장 5개 = 별 1개 */
days("3101",[...wk("2026-09-01",4),...wk("2026-09-07",5),...wk("2026-09-14",5),...wk("2026-09-21",5),"2026-09-28"]);   /* 9월 20 = 별 4 */
days("3102",[...wk("2026-09-07",5),...wk("2026-09-14",5),...wk("2026-09-21",5)]);                                    /* 9월 15 = 별 3 */
days("3103",[...wk("2026-09-21",5),"2026-09-28","2026-09-29"]);                                                     /* 9월 7 = 별 1 + 남은 도장 2 */
days("3104",[...wk("2026-08-03",5),...wk("2026-08-10",5),...wk("2026-08-17",5),...wk("2026-08-24",5),...wk("2026-09-07",5),...wk("2026-09-14",5)]); /* 8월 별 4 + 9월 별 2 = 6 */
days("3105",["2026-09-28","2026-09-28","2026-09-29","2026-09-29","2026-09-30","2026-09-30"]);                     /* 한 주 6편 → 도장 5 + 은행잎 1 */
function posts(hb,monday,k){days(hb,wk(monday,k));}
const st=hb=>{EMAIL="s"+hb+"@x";return C().api("state",{});};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
let a=st("3105");
must(a.week.stamps.length===5&&a.week.bonus===1,"① 한 주 도장 5개까지(이번 주 "+a.week.stamps.length+"개, 은행잎 "+a.week.bonus+")");
a=st("3101");
must(a.stars.total===4&&a.stars.stamps===20&&a.stars.mStamps===20&&a.stars.mStars===4,"② 9월 도장 20개 = 별 4개");
let c3=st("3103");must(c3.stars.total===1&&c3.stars.toNext===3,"3103: 9월 도장 7개 = 별 1 + 남은 2(다음 별까지 3)");
must(c3.stars.toNext===3,"다음 별까지 남은 도장 "+c3.stars.toNext+"개");
must(a.giftNotice&&!a.giftNotice.open&&a.giftNotice.mine.vouchers===2,"수령 기간 5일 전: 공지에 '곧 10월 수령 · 2매'");
NOW=new Date("2026-10-05T03:00:00Z");
a=st("3101");const b=st("3102"),cc=st("3103"),d=st("3104");
must(a.giftNotice.open&&a.giftNotice.mine.vouchers===2,"③ 별 4개 → 2매");
must(b.giftNotice.mine.vouchers===1,"③ 별 3개 → 1매(남는 1개는 대상 아님)");
must(cc.giftNotice.mine.vouchers===0,"⑧ 별 1개는 대상 아님");
must(d.giftNotice.mine.stars===6&&d.giftNotice.mine.vouchers===2,"④ 별 6개여도 최대 2매");
EMAIL="s2101@x";const dk=C().api("state",{}).giftDesk;
must(dk.open&&dk.rows.map(x=>x.hakbun).join()==="3101,3102,3104","도서부 명단: 1매 이상인 학생만(3103 제외)");
must(dk.rows.reduce((s0,x)=>s0+x.vouchers,0)===5,"필요한 상품권 5매");
EMAIL="s2101@x";C().api("clubMark",{ids:["3101"],on:true});
a=st("3101");must(a.giftNotice.mine.paid&&a.claims[0].paid,"⑤ 배부 완료 → 학생 화면 '수령했어요'");
must(a.stars.shown===0,"⑦ 받은 뒤 별이 사라짐(지금 별 "+a.stars.shown+")");
/* 수령 기간 중에 새로 모은 별은 다음 수령으로 */
posts("3101","2026-10-05",5);NOW=new Date("2026-10-07T03:00:00Z");
a=st("3101");must(a.stars.shown===1&&a.stars.total===5,"기간 중 새 별 1개는 다음 수령으로(지금 별 "+a.stars.shown+")");
let bb=st("3102");must(bb.stars.shown===3,"받기 전 3102 별 3개 보임");
/* 수령 기간이 지나도 별은 그대로 남는다(2026-09-22 규칙) */
NOW=new Date("2026-10-09T03:00:00Z");
bb=st("3102");must(bb.stars.shown===3,"⑥ 기간이 지나도 안 받은 별은 그대로(지금 별 "+bb.stars.shown+")");
must(!bb.claims.length,"내 서재 수령 기록에는 실제로 받은 것만 남는다");
must(!bb.giftNotice||bb.giftNotice.from!=="2026-10-05","기간이 지나면 공지 사라짐");
/* 교사 화면·메일 */
NOW=new Date("2026-10-05T00:00:00Z");
EMAIL="lib@x";const G=C().api("state",{}).gifts;must(G.def==="2026-10-05"&&G.rows["2026-10-05"].length===3,"관리자 상품권 탭: 10월 수령 대상 3명");
const mails=C().giftMail();must(mails.length>=1&&/10월 수령 상품권 대상 3명 · 5매/.test(mails[0].subject),"수령 첫날 메일: "+(mails[0]&&mails[0].subject));
must(C().giftMailKey()==="2026-10-05","메일은 수령 첫날에만");
/* 설정을 비우면 매달 첫 월~목 */
db.setConf("상품권배부","");NOW=new Date("2026-11-02T03:00:00Z");
a=st("3101");must(a.giftNotice&&a.giftNotice.from==="2026-11-02"&&a.giftNotice.to==="2026-11-05","설정이 비면 매달 첫 월요일~목요일(11/2~11/5)");

/* 수령기간 시트·수령대상 시트 */
NOW=new Date("2026-10-06T03:00:00Z");
must(T["수령기간"].length>=2&&T["수령기간"][0]["시작"]==="2026-10-05","수령기간 시트에 기본 일정("+T["수령기간"].map(r=>r["시작"]+"~"+r["끝"]).join(", ")+")");
T["수령기간"][0]["시작"]="2026-10-12";T["수령기간"][0]["끝"]="2026-10-14";
a=st("3104");must(a.giftNotice&&a.giftNotice.from==="2026-10-12","시트에서 날짜를 고치면 바로 반영(10/12~10/14)");
NOW=new Date("2026-10-12T03:00:00Z");EMAIL="s2101@x";C().api("clubMark",{ids:["3104"],on:true});
must(T["수령대상"].some(r=>r["학번"]==="3104"&&r["배부"]==="배부 완료"&&/도서부/.test(r["처리자"])),"수령대상 시트에 배부 완료·처리자 기록");
must(T["수령대상"].filter(r=>r["시작"]==="2026-10-12").every(r=>Number(r["상품권"])>=1),"수령대상 시트에는 1매 이상인 학생만");

/* 도장은 달이 바뀌어도 이어진다(2026-09-22 규칙): 9월에 남은 2개 위에 10월 도장이 쌓인다 */
NOW=new Date("2026-10-02T03:00:00Z");
c3=st("3103");must(c3.stars.mon==="2026-10"&&c3.stars.mStamps===0&&c3.stars.toNext===3,"10월로 넘어가도 남은 도장 2개가 살아 있다(다음 별까지 "+c3.stars.toNext+")");
days("3103",["2026-10-01","2026-10-02"]);c3=st("3103");
must(c3.stars.mStamps===2&&c3.stars.toNext===1&&c3.stars.stamps===9,"9월 7개 + 10월 2개 = 도장 9개, 다음 별까지 1");
must(c3.months[0].mon==="2026-10"&&c3.months[1].mon==="2026-09"&&c3.months[1].stamps===7&&c3.months[1].stars===1,"내 서재 달별 표: 9월 도장 7·별 1, 10월 도장 2");
/* 도서부 학번 조회(수령 기간 안에서만) */
NOW=new Date("2026-10-13T03:00:00Z");EMAIL="s2101@x";
let lk=C().api("deskLookup",{q:"3102"}).list[0];must(lk.claim&&lk.claim.vouchers===1&&!lk.claim.paid,"도서부 조회: 3102 수령 대상 1매");
lk=C().api("deskLookup",{q:"3103"}).list[0];must(lk.claim&&lk.claim.vouchers===0&&lk.mStamps===2,"도서부 조회: 3103 대상 아님, 이번 달 도장 2");
EMAIL="s3101@x";let e1="";try{C().api("deskLookup",{q:"3102"});}catch(x){e1=x.message;}must(/도서부만/.test(e1),"도서부 아닌 학생은 조회 못 함");

/* 2026-09-20 ⑨ 학생·도서부는 제출물에서 남의 이름을 못 본다 ⑩ 배부 명단은 수령 기간에만 */
T["글"].push({"id":"gx","시각":"2026-10-06 09:00:00","주":"2026-10-05","종류":"label","학번":"3102","이름":"나","반":"3-1","책제목":"아몬드","지은이":"손원평","본문":"한 줄 남깁니다. 표지보다 훨씬 좋았어요. 친구에게도 권하고 싶은 책.","상태":"posted"});
NOW=new Date("2026-10-13T03:00:00Z");   /* 수령 기간 10-12~10-14 */
/* 제출물(본문이 있는 칸)에 남의 이름·학번이 붙어 나가는지 그릇을 훑는다 */
function peopleLeak(o,me,out){
  if(!o||typeof o!=="object")return out;
  if(Array.isArray(o)){o.forEach(x=>peopleLeak(x,me,out));return out;}
  if(o.text!==undefined&&(o.name||o.hakbun)&&String(o.hakbun||"")!==me&&!/선생님/.test(String(o.name||"")))out.push((o.hakbun||"")+" "+(o.name||"")+" · "+String(o.title||"").slice(0,10));
  Object.keys(o).forEach(k=>peopleLeak(o[k],me,out));
  return out;
}
EMAIL="s3103@x";const leak1=peopleLeak(C().api("state",{}),"3103",[]);
must(!leak1.length,"학생 화면: 제출물에 남의 이름·학번 없음(학반만)"+(leak1.length?" — "+leak1.slice(0,3).join(", "):""));
EMAIL="s2101@x";const stC=C().api("state",{}),deskRows=stC.giftDesk.rows.map(r=>r.hakbun);
const leak2=peopleLeak(Object.assign({},stC,{giftDesk:null}),"2101",[]);
must(!leak2.length,"도서부 화면: 배부 명단 말고는 남의 이름·학번 없음"+(leak2.length?" — "+leak2.slice(0,3).join(", "):""));
must(deskRows.length>=1&&deskRows.join()===deskRows.slice().sort().join(),"배부창: 대상 전원 학번순 "+deskRows.join(","));
must(stC.giftDesk.rows.every(r=>r.hakbun&&r.name)&&stC.giftDesk.open,"배부창: 학번·이름 함께, 기간 중이라 체크 가능");
NOW=new Date("2026-10-16T03:00:00Z");   /* 기간이 지난 뒤 */
const after=C().api("state",{});
must(after.giftDesk&&after.giftDesk.none&&!after.giftDesk.rows.length,"수령 기간이 지나면 배부 명단이 사라진다");
let e2="";try{C().api("deskLookup",{q:"3101"});}catch(x){e2=x.message;}
must(/배부 기간이 아닙니다/.test(e2),"기간 밖에서는 도서부 조회도 막힘");
