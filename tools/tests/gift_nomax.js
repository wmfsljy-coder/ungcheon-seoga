/* 2026-10-09 회장님 지시
   ① 상품권 매수 제한 없음  ② 대상 메일 없음(대상은 앱·시트에서 바로)  ③ 10/19 주부터 라벨·문장 도장 따로(각 1개), 한 주 5칸은 그대로 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-09T12:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
/* 지금 실제 시트: 매수 3, 메일 Y, 공지 옛 문구 */
db.setConf("월최대매수","3");db.setConf("상품권메일","Y");db.setConf("상품권공개","Y");db.setConf("수령기간판","1");
T["공지"]=[{"id":"g1","제목":"문화상품권","내용":"별 1개 = 5,000원 1매(한 번에 최대 3매). 매주 금요일 점심시간에 도서관에서 받아요.","대상":"모두","고정":"Y"},
  {"id":"g2","제목":"한 주 도장은 다섯 칸","내용":"라벨·문장은 합쳐서 1개, 독후감 2개, 퀴즈 2개까지. 선생님이 주시는 만능 도장은 제한이 없어요.","대상":"모두","고정":"Y"}];
const C=()=>Core.make(db,env);C().maintain();
must(cf("월최대매수")==="0"&&cf("상품권메일")==="N"&&cf("라벨문장따로")==="2026-10-19","설정: 매수 제한 없음(0) · 대상 메일 N · 10/19부터 라벨·문장 따로");
must(cf("주간도장")==="5","한 주 5칸은 그대로");
const n1=T["공지"].find(r=>r["id"]==="g1")["내용"],n2=T["공지"].find(r=>r["id"]==="g2")["내용"];
must(/매수 제한 없음/.test(n1)&&!/최대 3매/.test(n1),"공지 '문화상품권': 매수 제한 없음 — "+n1);
must(/10월 19일부터 라벨 1개·문장 1개\(따로 도장\)/.test(n2)&&/한 주 5칸/.test(n2),"공지 '한 주 도장': 10/19부터 라벨·문장 따로 — "+n2);

T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y"},{"학번":"3102","이름":"두리","반":"3-1","동의":"y","도서부":"Y"},{"학번":"3103","이름":"세인","반":"3-1","동의":"y"});
const tok={};[["3101","가온"],["3102","두리"],["3103","세인"]].forEach(([h,n],i)=>{tok[h]=C().api("login",{role:"student",hakbun:h,name:n,agree:true,newPin:"41820"+i}).token;});
T["교사"].push({"이름":"사서","담당":"관리자"});tok["사서"]=C().api("login",{role:"teacher",name:"사서",newPin:"713900"}).token;
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};

/* ① 매수 제한 없음: 별 6개 → 6매 */
const wks=["2026-08-31","2026-09-07","2026-09-14","2026-09-21","2026-09-28","2026-10-05"];
for(let i=0;i<30;i++){const w=wks[Math.floor(i/5)],d=w.slice(0,8)+String(Number(w.slice(8))+1).padStart(2,"0");
  T["도장"].push({"id":"d"+i,"시각":d+" 10:"+String(i).padStart(2,"0")+":00","주":w,"학번":"3103","이름":"","반":"3-1","사유":"선생님 도장","교사":"과학","취소":""});}
const g=as("3103","state").giftNotice;
must(g&&g.mine.vouchers===6&&g.mine.stars===6,"별 6개 → 6매(한 번에 최대 3매 제한 없음)");
must(as("3103","state").stars.rule.max>=9999,"화면 규칙에도 제한 없음");
/* ② 대상 메일 없음 */
NOW=new Date("2026-10-16T00:10:00Z");
must(C().giftMail().length===0,"수령 날 아침 대상 메일 안 감(상품권메일 N)");
/* 대상은 앱에서 바로: 관리자·도서부는 시트도 지금 기준으로 맞춘다 */
must(!as("사서","recvSync").ERR&&T["수령대상"].some(r=>r["학번"]==="3103"&&r["상품권"]==="6"),"관리자가 상품권 탭을 열면 수령대상 시트가 지금 기준(3103 · 6매)");
must(!as("3102","recvSync").ERR,"도서부도 시트 맞추기 가능");
must(/관리자·도서부만/.test(as("3101","recvSync").ERR||""),"일반 학생은 못 함");
must(as("3102","state").giftDesk.rows.some(r=>r.hakbun==="3103"&&r.vouchers===6),"도서부 배부 확인에 실시간 대상(3103 · 6매)");

/* ③ 라벨·문장: 10/12 주는 합쳐 한 칸, 10/19 주부터 따로 */
let pid=0;function post(kind,at){T["글"].push({"id":"p"+(++pid),"시각":at,"주":Core.weekOfYmd(at),"종류":kind,"학번":"3101","이름":"가온","반":"3-1","책제목":"책"+pid,"본문":"글","상태":"posted"});}
post("label","2026-10-13 09:00:00");post("quote","2026-10-14 09:00:00");
NOW=new Date("2026-10-15T03:00:00Z");
let w=as("3101","state").week;
must(w.stamps.length===1&&w.bonus===1&&!w.split&&w.caps.write===1,"10/12 주: 라벨+문장 = 도장 1 + 책갈피 1(예전대로)");
post("label","2026-10-19 09:00:00");post("quote","2026-10-20 09:00:00");post("label","2026-10-21 09:00:00");
NOW=new Date("2026-10-21T05:00:00Z");
w=as("3101","state").week;
must(w.split&&w.caps.write===2,"10/19 주: 라벨·문장 칸이 둘(라벨 1 + 문장 1)");
must(w.stamps.length===2&&w.stamps.every(x=>x.slot==="write")&&w.bonus===1,"10/19 주: 라벨 1 + 문장 1 = 도장 2, 두 번째 라벨은 책갈피");
must(as("3101","state").conf.writeSplit===true,"학생 화면에 '라벨·문장 따로'가 알려진다");
/* 한 주 5칸은 그대로: 독후감 2 + 퀴즈 출제 2 를 더 하면 5칸에서 멈춘다 */
post("review","2026-10-21 10:00:00");post("review","2026-10-22 10:00:00");
[0,1].forEach(i=>T["퀴즈"].push({"id":"q"+i,"시각":"2026-10-22 1"+i+":00:00","상태":"대기","책제목":"책","문제":"문제"+i,"학번":"3101","품질":"9","출처":"학생"}));
NOW=new Date("2026-10-23T05:00:00Z");
w=as("3101","state").week;
must(w.stamps.length===5,"한 주 도장은 그대로 5칸까지("+w.stamps.length+")");
