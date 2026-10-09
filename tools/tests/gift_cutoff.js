/* 배부 대상 명단 새로 고침 시각(2026-10-09 회장님 지시)
   - 구글 시트 '수령대상'은 늘 실시간
   - 앱(도서부 배부 확인·교사 상품권)은 오전 9시·오후 3시 기준, 금요일(수령 날)은 실시간
   - 학생 본인은 도장이 별이 되는 순간 수령 대상임을 안다(실시간) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-15T02:00:00Z");   /* 10/15(목) 오전 11시 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
db.setConf("상품권공개","Y");
const C=()=>Core.make(db,env);C().maintain();
T["수령기간"]=[{"시작":"2026-10-16","끝":"2026-10-16","메모":"금요일 수령"},{"시작":"2026-10-23","끝":"2026-10-23","메모":"금요일 수령"}];
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y"},{"학번":"3102","이름":"두리","반":"3-1","동의":"y","도서부":"Y"});
T["교사"].push({"이름":"사서","담당":"관리자"});
const tok={};[["3101","가온"],["3102","두리"]].forEach(([h,n],i)=>{tok[h]=C().api("login",{role:"student",hakbun:h,name:n,agree:true,newPin:"41820"+i}).token;});
tok["사서"]=C().api("login",{role:"teacher",name:"사서",newPin:"713900"}).token;
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};
/* 3101: 도장 4개는 지난주, 5번째 도장(별이 되는 것)은 목요일 오전 10:30 */
for(let i=0;i<4;i++)T["도장"].push({"id":"d"+i,"시각":"2026-10-0"+(5+i)+" 10:00:00","주":"2026-10-05","학번":"3101","사유":"선생님 도장","교사":"과학","취소":""});
T["도장"].push({"id":"d4","시각":"2026-10-15 10:30:00","주":"2026-10-12","학번":"3101","사유":"선생님 도장","교사":"과학","취소":""});

/* 목 11시: 학생 본인은 바로 안다 */
const gn=as("3101","state").giftNotice;
must(gn&&gn.mine.vouchers===1&&gn.from==="2026-10-16","학생 본인은 별이 된 순간 수령 대상(1매 · 10/16)");
/* 앱 명단은 오전 9시 기준 → 아직 없음 */
let dk=as("3102","state").giftDesk;
must(!dk.live&&/10월 15일 오전 9시/.test(dk.asOf)&&!dk.rows.some(r=>r.hakbun==="3101"),"도서부 명단: 오전 9시 기준이라 10:30 에 생긴 별은 아직 없음("+dk.asOf+")");
let g=as("사서","state").gifts;
must(!g.live&&/오전 9시/.test(g.asOf)&&!(g.rows["2026-10-16"]||[]).some(r=>r.hakbun==="3101"),"교사 상품권 탭도 오전 9시 기준");
/* 구글 시트는 실시간 */
C().syncRecvSheet();
must(T["수령대상"].some(r=>r["학번"]==="3101"&&r["상품권"]==="1"),"구글 시트 '수령대상'에는 바로 들어간다");
/* 오후 3시가 지나면 앱 명단에도 */
NOW=new Date("2026-10-15T06:10:00Z");   /* 15:10 */
dk=as("3102","state").giftDesk;
must(/오후 3시/.test(dk.asOf)&&dk.rows.some(r=>r.hakbun==="3101"&&r.vouchers===1),"오후 3시 기준 명단에는 들어간다");
/* 밤 10시 → 오후 3시 기준 그대로, 다음 날 아침 8시 → 전날 오후 3시 기준 */
NOW=new Date("2026-10-14T23:00:00Z");   /* 10/15 08:00 */
must(/10월 14일 오후 3시/.test(as("3102","state").giftDesk.asOf),"아침 9시 전에는 전날 오후 3시 기준");
/* 금요일(수령 날)은 실시간 */
NOW=new Date("2026-10-16T02:00:00Z");   /* 10/16(금) 11시 */
T["도장"].push({"id":"d5","시각":"2026-10-16 10:50:00","주":"2026-10-12","학번":"3102","사유":"선생님 도장","교사":"과학","취소":""});
for(let i=0;i<4;i++)T["도장"].push({"id":"e"+i,"시각":"2026-10-0"+(5+i)+" 11:00:00","주":"2026-10-05","학번":"3102","사유":"선생님 도장","교사":"과학","취소":""});
dk=as("3102","state").giftDesk;
must(dk.live&&dk.open&&dk.rows.some(r=>r.hakbun==="3102"),"금요일엔 도서부 명단이 실시간(10:50 에 생긴 별도 바로)");
g=as("사서","state").gifts;
must(g.live,"금요일엔 교사 상품권 탭도 실시간");
