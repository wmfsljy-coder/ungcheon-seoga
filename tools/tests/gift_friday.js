/* 상품권 금요일 수령(2026-10-09 회장님 지시)
   - 별 1개 = 문화상품권 1매(한 번에 최대 3매), 매주 금요일 점심시간 도서관에서
   - 이번 금요일에 못 받으면 별은 그대로 남아 다음 주 금요일에 받는다
   - 한 주 도장 5개는 그대로
   - 옛 수령기간(달마다)·옛 공지 문구는 한 번만 갈아 준다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-09T12:00:00Z");   /* 10/9(금) 저녁 — 첫 수령은 다음 금요일 10/16 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
/* 지금 실제 시트 모양: 별 2개 = 1매, 달마다 수령 기간, 옛 공지 문구 */
db.setConf("상품권당별","2");db.setConf("상품권공개","Y");db.setConf("수령기간판","1");
T["수령기간"]=[{"시작":"2026-11-09","끝":"2026-11-11","메모":"11월 수령"},{"시작":"2026-12-07","끝":"2026-12-10","메모":"12월 수령"}];
T["공지"]=[{"id":"g1","제목":"문화상품권","내용":"별 2개 = 5,000원 1매, 한 번에 최대 3매. 수령 기간에 도서관에서 받아요(그때만 받을 수 있어요).","대상":"모두","고정":"Y"},
           {"id":"g2","제목":"로그인이 안 되면","내용":"담임 선생님께 말해 주세요.","대상":"모두","고정":"Y"}];
const C=()=>Core.make(db,env);C().maintain();

/* ── 한 번 갈아 주기 ── */
must(cf("상품권당별")==="1","설정: 별 1개 = 1매");
must(cf("주간도장")==="5","한 주 도장 5개는 그대로");
const R=T["수령기간"];
must(R.length>=15&&R.every(r=>r["시작"]===r["끝"]&&new Date(r["시작"]+"T00:00:00Z").getUTCDay()===5),"수령기간 시트가 매주 금요일 한 줄씩("+R.length+"번)");
must(R[0]["시작"]==="2026-10-16"&&R[R.length-1]["시작"]<="2027-02-19","다음 금요일(10/16)부터 학년말까지");
must(!R.some(r=>r["시작"]==="2026-11-09"),"옛 달마다 수령 기간은 지웠다(준 기록이 없으므로)");
const gn=T["공지"].find(r=>r["제목"]==="문화상품권")["내용"];
must(/별 1개 = 5,000원 1매/.test(gn)&&/매주 금요일 점심시간에 도서관에서/.test(gn)&&/다음 주 금요일/.test(gn),"공지 '문화상품권'을 새 문구로: "+gn);
must(T["공지"].find(r=>r["제목"]==="로그인이 안 되면")["내용"]==="담임 선생님께 말해 주세요.","다른 공지는 그대로");
/* 시트에서 쉬는 금요일을 지우면 그대로 남는다(다시 갈아 주지 않음) */
T["수령기간"]=T["수령기간"].filter(r=>r["시작"]!=="2026-10-30");C().maintain();
must(!T["수령기간"].some(r=>r["시작"]==="2026-10-30")&&T["수령기간"][0]["시작"]==="2026-10-16","시트에서 지운 금요일은 다시 생기지 않는다");

/* ── 학생 ── */
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y","도서부":""},{"학번":"3102","이름":"두리","반":"3-1","동의":"y","도서부":""},
  {"학번":"3103","이름":"세인","반":"3-1","동의":"y","도서부":"Y"},{"학번":"3104","이름":"네온","반":"3-1","동의":"y","도서부":""});
const tok={};[["3101","가온"],["3102","두리"],["3103","세인"],["3104","네온"]].forEach(([h,n],i)=>{tok[h]=C().api("login",{role:"student",hakbun:h,name:n,agree:true,newPin:"41820"+i}).token;});
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};
/* 선생님 도장으로 별 만들기: 주마다 5개씩(한 주 5칸) */
function stamps(hb,n){const wks=["2026-09-07","2026-09-14","2026-09-21","2026-09-28","2026-10-05"];
  for(let i=0;i<n;i++){const w=wks[Math.floor(i/5)],d=w.slice(0,8)+String(Number(w.slice(8))+1).padStart(2,"0");
    T["도장"].push({"id":"d"+hb+i,"시각":d+" 10:"+String(i).padStart(2,"0")+":00","주":w,"학번":hb,"이름":"","반":"3-1","사유":"선생님 도장","교사":"과학","취소":""});}}
stamps("3101",5);stamps("3102",10);stamps("3103",20);
const st=h=>as(h,"state");
let g1=st("3101").giftNotice;
must(g1&&g1.mine.vouchers===1&&g1.label==="10월 16일 수령"&&g1.from==="2026-10-16"&&g1.to==="2026-10-16","별 1개 → 10월 16일(금) 수령 1매 안내(일주일 전부터)");
must(st("3102").giftNotice.mine.vouchers===2,"별 2개 → 2매");
must(st("3103").giftNotice.mine.vouchers===3,"별 4개 → 3매(한 번에 최대 3매)");
must(!(st("3104").giftNotice||{mine:{}}).mine.vouchers,"별 없는 학생은 대상 아님");
must(st("3101").conf.recvWeekly===true,"화면에 '매주 금요일 수령'이 알려진다");

/* ── 10/16(금): 3101 만 받음 ── */
NOW=new Date("2026-10-16T03:30:00Z");
let dk=as("3103","state").giftDesk;
must(dk.open&&dk.label==="10월 16일 수령"&&dk.rows.map(r=>r.hakbun).join()==="3101,3102,3103","금요일에 도서부 배부 단추가 열린다(학번 순 3명)");
must(!as("3103","clubMark",{ids:["3101"],on:true}).ERR,"3101 배부");
must(st("3101").giftAck.length===1&&st("3101").stars&&true,"3101 학생 화면에 배부 완료 확인 창");
/* ── 토요일: 배부 단추는 닫힘 ── */
NOW=new Date("2026-10-17T03:30:00Z");
must(/배부 기간이 아닙니다/.test(as("3103","clubMark",{ids:["3102"],on:true}).ERR||""),"금요일이 지나면 배부 단추가 닫힌다");
/* ── 다음 주 금요일: 못 받은 3102 는 그대로 2매 ── */
let g2=st("3102").giftNotice;
must(g2&&g2.from==="2026-10-23"&&g2.mine.vouchers===2&&!g2.mine.paid,"10/16 에 못 받은 학생은 10/23(금)에 그대로 2매");
must(st("3101").giftNotice===null||!st("3101").giftNotice.mine.vouchers,"이미 받은 학생은 별이 줄어 다음 주에는 대상이 아니다");
NOW=new Date("2026-10-23T03:30:00Z");
dk=as("3103","state").giftDesk;
must(dk.open&&dk.rows.some(r=>r.hakbun==="3102"&&r.vouchers===2),"10/23(금) 배부 명단에 3102(2매)");
must(T["수령대상"].some(r=>r["수령"]==="10월 16일 수령"&&r["학번"]==="3101"&&r["배부"]==="배부 완료"),"수령대상 시트에 '10월 16일 수령' 배부 기록");
