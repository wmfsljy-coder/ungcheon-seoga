/* Code.gs 를 가짜 구글 서비스(시트·트리거·캐시·UrlFetch) 위에서 돌려 본다.
   독서로 요청은 python 도우미로 실제로 보낸다(없으면 LIVE=0 로 가짜 응답).
   사용: node tools/test_code_gs.js [LIVE=0] */
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,"..");
const LIVE=process.env.LIVE!=="0";
const HELPER=path.join(__dirname,"httphelper.py");

/* ── 가짜 스프레드시트 ── */
function Sheet(name){this.name=name;this.cells=[];this.frozen=0;}
Sheet.prototype.getLastRow=function(){for(var r=this.cells.length;r>0;r--){if((this.cells[r-1]||[]).some(v=>v!==""&&v!=null))return r;}return 0;};
Sheet.prototype.getMaxRows=function(){return Math.max(1000,this.cells.length);};
Sheet.prototype.getLastColumn=function(){return this.cells.reduce((m,r)=>Math.max(m,(r||[]).length),0);};
Sheet.prototype.getRange=function(r,c,nr,nc){return new Range(this,r,c,nr||1,nc||1);};
let READS=0;Sheet.prototype.getDataRange=function(){READS++;return new Range(this,1,1,Math.max(1,this.getLastRow()),Math.max(1,this.getLastColumn()));};
Sheet.prototype.appendRow=function(v){this.cells[this.getLastRow()]=v.slice();SHEET_WRITES++;return this;};
Sheet.prototype.insertRowsAfter=function(){};Sheet.prototype.getMaxColumns=function(){return 30;};
Sheet.prototype.setFrozenRows=function(n){this.frozen=n;};
Sheet.prototype.setColumnWidth=function(){};
function Range(sh,r,c,nr,nc){this.sh=sh;this.r=r;this.c=c;this.nr=nr;this.nc=nc;}
Range.prototype.getValues=function(){var o=[];for(var i=0;i<this.nr;i++){var row=[];for(var j=0;j<this.nc;j++){var v=(this.sh.cells[this.r-1+i]||[])[this.c-1+j];row.push(v==null?"":v);}o.push(row);}return o;};
Range.prototype.setValues=function(v){SHEET_WRITES++;for(var i=0;i<this.nr;i++){this.sh.cells[this.r-1+i]=this.sh.cells[this.r-1+i]||[];for(var j=0;j<this.nc;j++)this.sh.cells[this.r-1+i][this.c-1+j]=v[i][j];}return this;};
Range.prototype.setValue=function(v){return this.setValues([[v]]);};
Range.prototype.clearContent=function(){for(var i=0;i<this.nr;i++){var row=this.sh.cells[this.r-1+i];if(row)for(var j=0;j<this.nc;j++)row[this.c-1+j]="";}return this;};
["setNumberFormat","setFontWeight","setBackground","setDataValidation","setNote"].forEach(m=>Range.prototype[m]=function(){return this;});
const BOOK={sheets:{},toasts:[]};
let SHEET_WRITES=0,FETCHES=0;
const SS={getSheetByName:n=>BOOK.sheets[n]||null,insertSheet:n=>(BOOK.sheets[n]=new Sheet(n)),getSheets:()=>Object.values(BOOK.sheets),
  toast:(m)=>BOOK.toasts.push(m)};
let ACTIVE_EMAIL="teacher@school.kr",UI_ALERTS=0;
const triggers=[];
global.SpreadsheetApp={newDataValidation:()=>{const b={requireDate(){return b;},requireValueInList(){return b;},setAllowInvalid(){return b;},setHelpText(){return b;},build(){return {};}};return b;},getActiveSpreadsheet:()=>SS,openById:()=>SS,getUi:()=>({alert:()=>{UI_ALERTS++;throw new Error("alert 는 실행을 붙잡는다");},
  createMenu:()=>({addItem(){return this;},addToUi(){}}),ButtonSet:{},Button:{}})};
global.Session={getActiveUser:()=>({getEmail:()=>ACTIVE_EMAIL}),getEffectiveUser:()=>({getEmail:()=>"teacher@school.kr"})};
global.ScriptApp={getProjectTriggers:()=>triggers.slice(),deleteTrigger:t=>{triggers.splice(triggers.indexOf(t),1);},
  newTrigger:fn=>{const t={fn,kind:"",getHandlerFunction(){return fn;}};const b={forSpreadsheet(){return b;},onEdit(){t.kind="onEdit";return b;},onChange(){t.kind="onChange";return b;},timeBased(){return b;},after(ms){t.kind="after "+ms;return b;},everyDays(){return b;},atHour(h){t.kind="daily "+h;return b;},inTimezone(){return b;},create(){triggers.push(t);return t;}};return b;}};
const props={};global.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>{props[k]=v;},getProperties:()=>Object.assign({},props),deleteProperty:k=>{delete props[k];}})};
const cache={};global.CacheService={getScriptCache:()=>({get:k=>cache[k]||null,put:(k,v)=>{cache[k]=v;},
  getAll:ks=>{const o={};ks.forEach(k=>{if(cache[k]!=null)o[k]=cache[k];});return o;},putAll:m=>{Object.assign(cache,m);}})};
const crypto=require("crypto");
global.Utilities={newBlob:s=>({getBytes:()=>s}),getUuid:()=>crypto.randomUUID(),computeHmacSha256Signature:(s,k)=>Array.from(crypto.createHmac("sha256",k).update(s).digest()).map(b=>b>127?b-256:b),
  formatDate:(d)=>(d.getMonth()+1)+"-"+d.getDate(),base64EncodeWebSafe:b=>Buffer.from(b.map(x=>x&255)).toString("base64url"),
  computeDigest:(a,s)=>Array.from(crypto.createHash(a===2?"sha256":"md5").update(s).digest()).map(b=>b>127?b-256:b),DigestAlgorithm:{MD5:1,SHA_256:2},Charset:{UTF_8:1}};
const MAILS=[];global.MailApp={sendEmail:(to,sub,body)=>MAILS.push([to,sub])};
global.LockService={getScriptLock:()=>({waitLock(){},releaseLock(){}})};
global.ContentService={MimeType:{JSON:1},createTextOutput:s=>({text:s,setMimeType(){return this;}})};
global.HtmlService={createHtmlOutputFromFile:()=>({setTitle(){return this;},addMetaTag(){return this;}})};
function fake(q){
  if(q.payload){const b=JSON.parse(q.payload);
    if(b.categoryCode)return {status:"OK",data:{totalCount:60,bookList:Array.from({length:50},(_,k)=>({bookKey:b.categoryCode+"-"+k,title:"분류"+b.categoryCode.slice(0,3)+" 책 "+k,author:"지은이"+k+" 지음",pubFormCode:"MA",appendixYn:"N",pubYear:"2020",publisher:"출판"}))}};
    return {status:"OK",data:{totalCount:2,bookList:[1,2].map(i=>({bookKey:b.searchKeyword+i,title:b.searchKeyword,author:"",callNo:"813.6 가12ㄴ c."+i,locationName:"자료실"}))}};}
  return {status:"OK",data:{status:"대출가능",coverUrl:""}};
}
global.UrlFetchApp={fetchAll:reqs=>{FETCHES+=reqs.length;
  if(!LIVE)return reqs.map(q=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify(fake(q))}));
  const conv=reqs.map(q=>({url:q.url,method:q.method,body:q.payload?JSON.parse(q.payload):undefined}));
  const out=JSON.parse(cp.execFileSync("python",[HELPER],{input:Buffer.from(JSON.stringify(conv),"utf8"),maxBuffer:1<<26}).toString("utf8"));
  return out.map(o=>({getResponseCode:()=>o.code,getContentText:()=>o.text}));}};

/* ── Code.gs + core.gs 불러오기(Apps Script 처럼 한 전역에) ── */
const src=fs.readFileSync(path.join(root,"core.gs"),"utf8")+"\n"+fs.readFileSync(path.join(root,"Code.gs"),"utf8")+
  "\n;global.setup=setup;global.firstRun=firstRun;global.api=api;global.libDaily=libDaily;global.Core=Core;";
(0,eval)(src);

function time(label,fn){const t=Date.now();SHEET_WRITES=0;FETCHES=0;const r=fn();console.log(label,((Date.now()-t)/1000).toFixed(1)+"초","시트 쓰기",SHEET_WRITES,"독서로 요청",FETCHES);return r;}
time("setup",()=>setup());
console.log("  시계:",triggers.map(t=>t.fn+"("+t.kind+")").join(", "),"| 알림창 호출",UI_ALERTS,"| 토스트",BOOK.toasts.length);
time("firstRun(30초 뒤)",()=>firstRun());
console.log("  남은 시계:",triggers.map(t=>t.fn+"("+t.kind+")").join(", "));
console.log("  마지막 토스트:",BOOK.toasts[BOOK.toasts.length-1]);
const conf=BOOK.sheets["설정"].getDataRange().getValues().map(r=>r[0]+"="+r[1]);
console.log("  설정:",conf.filter(x=>/도서확인|이달=|추천묶음|장서/.test(x)).join(" / "));
console.log("  도서 줄",BOOK.sheets["도서"].getLastRow()-1,"퀴즈 줄",BOOK.sheets["퀴즈"].getLastRow()-1);
time("setup 다시(이미 설치된 시트)",()=>setup());
console.log("  시계:",triggers.map(t=>t.fn+"("+t.kind+")").join(", "));
const st=time("교사 첫 화면(api state)",()=>JSON.parse(api("state","{}")));
console.log("  역할",st.me&&st.me.role,"| 새 소식",st.news&&st.news.total,"| 오류",st.error||"없음");
ACTIVE_EMAIL="stu@school.kr";BOOK.sheets["명단"].appendRow(["30201","김서준","3-2","",""]);
console.log("  학생 첫 접속:",JSON.parse(api("state","{}")).need);
console.log("  등록:",api("register",JSON.stringify({hakbun:"30201",name:"김서준",agree:true})));
const s2=time("학생 화면(api state)",()=>JSON.parse(api("state","{}")));
console.log("  서가",s2.books&&s2.books.length,"권 | 오류",s2.error||"없음");
console.log("  메일(1일 7시 이후에만):",JSON.stringify(MAILS));
if(process.env.DUMPKW){const v=BOOK.sheets["도서"].getDataRange().getValues(),h=v[0];v.slice(1).forEach(r=>{const o=Object.fromEntries(h.map((k,i)=>[k,r[i]]));if(o["숨김"]!=="Y")console.log(o["제목"],"|",o["핵심어"],"|",String(o["소개"]).slice(0,60));});}
if(process.env.DUMPQ){
  const rowsOf=n=>{const v=BOOK.sheets[n].getDataRange().getValues(),h=v[0];return v.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));};
  const mon=conf.find(x=>/^이달=/.test(x)).slice(3);
  const bk=rowsOf("도서").filter(b=>b["월"]===mon&&b["숨김"]!=="Y");
  const g={};bk.forEach(b=>(g[b["영역"]]=g[b["영역"]]||[]).push(b["제목"]+(b["소개"]&&b["소개"]!=="-"?"":"(소개없음)")));
  console.log("\n추천",bk.length,"권");Object.keys(g).forEach(k=>console.log(" ",k,g[k].length,"|",g[k].join(" / ")));
  rowsOf("퀴즈").filter(q=>q["상태"]==="출제").forEach(q=>console.log("\n["+q["품질근거"]+"] "+q["문제"]+"\n  보기: "+[1,2,3,4].map(i=>(i==q["정답"]?"*":"")+q["보기"+i]).join(" | ")));
}
if(process.env.UPGRADE){
  /* 옛 판에서 넘어온 시트 흉내: 선별판 없음, 이달의권수 24, 이번 주 옛 청구기호 문제 5개 */
  const sh=BOOK.sheets["설정"],v=sh.getDataRange().getValues();
  v.forEach((r,i)=>{if(r[0]==="선별판"||r[0]==="퀴즈판"||r[0]==="문장판")sh.cells[i][1]="";if(r[0]==="이달의권수")sh.cells[i][1]="24";});
  const qv=BOOK.sheets["퀴즈"].getDataRange().getValues(),qh=qv[0];
  qv.slice(1).forEach((r,i)=>{BOOK.sheets["퀴즈"].cells[i+1][qh.indexOf("품질근거")]="";BOOK.sheets["퀴즈"].cells[i+1][qh.indexOf("문제")]="옛 문제 "+i+" (청구기호)";});
  ACTIVE_EMAIL="teacher@school.kr";triggers.splice(0,triggers.length,...triggers.filter(t=>t.fn!=="firstRun"));
  const st=JSON.parse(api("state","{}"));
  console.log("\n[업그레이드] 첫 화면 selVer:",JSON.stringify(st.conf.selVer),"| 예약된 시계:",triggers.map(t=>t.fn+"("+t.kind+")").join(", "));
  JSON.parse(api("state","{}"));console.log("  두 번째 열람 뒤 firstRun 예약 수:",triggers.filter(t=>t.fn==="firstRun").length);
  time("  firstRun",()=>firstRun());
  const conf2=BOOK.sheets["설정"].getDataRange().getValues().map(r=>r[0]+"="+r[1]).filter(x=>/선별판|이달의권수|도서확인결과/.test(x));
  console.log("  설정:",conf2.join(" / "));
  const q2=BOOK.sheets["퀴즈"].getDataRange().getValues(),h2=q2[0];
  const rows=q2.slice(1).map(r=>Object.fromEntries(h2.map((k,i)=>[k,r[i]])));
  console.log("  옛 문제 상태:",[...new Set(rows.filter(r=>/^옛 문제/.test(r["문제"])).map(r=>r["상태"]))],"| 이번 주 출제:",rows.filter(r=>r["상태"]==="출제").map(r=>r["품질근거"]).join(","));
  const s3=JSON.parse(api("state","{}"));console.log("  서가",s3.books.length,"권, 분류",[...new Set(s3.books.map(b=>b.s))].length,"개 | selVer",s3.conf.selVer);
}
if(process.env.DUMPBANK){
  const v=BOOK.sheets["퀴즈"].getDataRange().getValues(),h=v[0],rows=v.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));
  const k={};rows.forEach(q=>{const key=q["상태"]+"/"+q["품질근거"];k[key]=(k[key]||0)+1;});console.log("\n퀴즈 시트:",JSON.stringify(k));
  console.log("문장 시트",BOOK.sheets["문장"].getLastRow()-1,"줄");
}
if(process.env.DUMPBANK){
  const v=BOOK.sheets["퀴즈"].getDataRange().getValues(),h=v[0],rows=v.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));
  const wk=rows.filter(q=>q["상태"]==="출제").map(q=>q["책제목"]);
  [...new Set(wk)].forEach(t=>console.log("책",t,"은행:",rows.filter(q=>q["책제목"]===t).map(q=>q["상태"]+":"+q["품질근거"].replace("자동:","")).join(",")));
  console.log("시각",[...new Set(rows.map(q=>q["시각"]))].join(" | "));
}
if(process.env.MAILFLOW){
  const sh=BOOK.sheets["설정"],v=sh.getDataRange().getValues();v.forEach((r,i)=>{if(r[0]==="로그인방식")sh.cells[i][1]="메일";});
  global.MailApp.sendEmail=o=>MAILS.push([o.to,o.subject]);
  ACTIVE_EMAIL="";
  console.log("\n[메일 로그인] 토큰 없이:",JSON.parse(api("state","{}")).need);
  console.log("  교사 메일로 요청:",api("authStart",JSON.stringify({email:"teacher@school.kr"})),"| 메일",JSON.stringify(MAILS[MAILS.length-1]));
  const code=/인증번호 (\d+)/.exec(MAILS[MAILS.length-1][1])[1];
  const r=JSON.parse(api("authVerify",JSON.stringify({email:"teacher@school.kr",code,remember:true})));
  const st=JSON.parse(api("state",JSON.stringify({_t:r.token})));
  console.log("  번호 확인 → 토큰",!!r.token,"| 화면",st.me&&st.me.role,st.conf&&st.conf.loginMode,"| 기기 시트",BOOK.sheets["기기"].getLastRow()-1,"줄 | 인증 시트",BOOK.sheets["인증"].getLastRow()-1,"줄");
}

if(process.env.SPEED){
  const sh=BOOK.sheets["설정"],v=sh.getDataRange().getValues();v.forEach((r,i)=>{if(r[0]==="로그인방식")sh.cells[i][1]="구글";});
  global.onSheetEdit({range:{getSheet:()=>({getName:()=>"설정"})}});
  ACTIVE_EMAIL="teacher@school.kr";
  for(const k of [1,2,3]){READS=0;const t0=Date.now();const st=JSON.parse(api("state","{}"));console.log("교사 화면 "+k+"번째: 시트 읽기",READS,"번 · 역할",st.me&&st.me.role);}
  READS=0;const r=JSON.parse(api("newsSeen",JSON.stringify({_state:1})));console.log("처리+새 화면 한 번에: 화면 포함",!!r.state,"| 시트 읽기",READS,"번");
  READS=0;JSON.parse(api("state","{}"));console.log("그다음 화면: 시트 읽기",READS,"번(쓴 시트만 다시)");
  global.onSheetEdit({range:{getSheet:()=>({getName:()=>"명단"})}});READS=0;JSON.parse(api("state","{}"));console.log("사람이 명단 시트를 고친 뒤: 시트 읽기",READS,"번");
  const g=global.doGet({parameter:{status:"1"}});console.log("상태 주소:",g.text.slice(0,160));
  console.log("시계:",triggers.map(t=>t.fn+"("+t.kind+")").join(", "));
}

if(process.env.IMPORT){
  const key=require("fs").readFileSync(process.env.IMPORT,"utf8").trim();
  const T=BOOK.sheets["교사"];T.appendRow(["","이학년","2-3",""]);T.appendRow(["","김교과","",""]);
  const post=k=>JSON.parse(global.doPost({postData:{contents:JSON.stringify({key:k,rows:[["1101","가나다","1-1"],["1102","라마바","1-1"],["30201","잘못","3-2"]]})}}).text);
  console.log("틀린 열쇠:",JSON.stringify(post("nope")));
  console.log("맞는 열쇠:",JSON.stringify(post(key)));
  console.log("같은 열쇠 또:",JSON.stringify(post(key)));
  console.log("교사 담당:",T.getDataRange().getValues().slice(1).map(r=>r[1]+":"+r[2]).join(", "));
}
if(process.env.RECV){
  const rv=BOOK.sheets["수령기간"],rt=BOOK.sheets["수령대상"];
  console.log("\n[수령] 수령기간 시트:",rv?rv.getDataRange().getValues().slice(1).map(r=>r[0]+"~"+r[1]).join(", "):"없음");
  console.log("  수령대상 시트:",rt?"있음, 머리글 "+rt.getDataRange().getValues()[0].join("|"):"없음");
}
