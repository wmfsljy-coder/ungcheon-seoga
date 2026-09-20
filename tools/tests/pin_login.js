/* PIN 로그인(2026-09-20): 학생 학번+이름 → PIN 6자리, 교사 이름 → PIN. 구글 메일은 쓰지 않는다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-06T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
let SEQ=0;
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+(++SEQ)+"xxxxxxx",hmac:s=>"H("+s+")",http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
const login=p=>C().api("login",p);
T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"일담","담당":"1학년"});
[["1101","가온"],["1102","나리"],["2101","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"동의":"","도서부":""}));

/* 1. 학생 첫 로그인 */
must(login({role:"student",hakbun:"1101",name:"가온"}).need==="consent","처음에는 개인정보 동의부터");
must(login({role:"student",hakbun:"1101",name:"가온",agree:true}).need==="setpin","동의하면 PIN 정하기로");
must(/숫자 6자리/.test(err(()=>login({role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"123"}))),"6자리가 아니면 거부");
must(/같은 숫자/.test(err(()=>login({role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"111111"}))),"같은 숫자만은 거부");
must(/이어지는 숫자/.test(err(()=>login({role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"123456"}))),"이어지는 숫자는 거부");
const first=login({role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"493028"});
must(first.token&&first.newPin,"PIN 을 정하면 바로 들어간다");
const row=T["명단"].find(x=>x["학번"]==="1101");
must(row["핀"]&&row["핀"]!=="493028","PIN 은 시트에 해시로만 저장된다");
must(row["동의"]&&row["핀설정"]&&row["최근접속"],"동의·PIN설정·최근접속이 기록된다");
must(C().api("state",{_t:first.token}).me.id==="1101","토큰으로 학생 화면");
/* 2. 다음부터는 학번+PIN */
must(login({role:"student",hakbun:"1101",name:"가온"}).need==="pin","등록된 학생은 PIN 을 묻는다");
must(/맞지 않아요/.test(err(()=>login({role:"student",hakbun:"1101",name:"가온",pin:"111222"}))),"틀린 PIN 은 거부");
const again=login({role:"student",hakbun:"1101",name:"가온",pin:"493028"});
must(again.token&&!again.newPin,"맞으면 새 토큰");
must(Number(T["명단"].find(x=>x["학번"]==="1101")["실패"])===0,"맞히면 틀린 횟수가 0 으로");
/* 3. 잠금 */
for(let i=0;i<4;i++)err(()=>login({role:"student",hakbun:"1101",name:"가온",pin:"000999"}));
const lockMsg=err(()=>login({role:"student",hakbun:"1101",name:"가온",pin:"000999"}));
must(/10분/.test(lockMsg),"다섯 번 틀리면 10분 잠금: "+lockMsg);
must(/잠겨 있어요/.test(err(()=>login({role:"student",hakbun:"1101",name:"가온",pin:"493028"}))),"잠긴 동안에는 맞는 PIN 도 안 받는다");
NOW=new Date(NOW.getTime()+11*60000);
must(!!login({role:"student",hakbun:"1101",name:"가온",pin:"493028"}).token,"10분이 지나면 다시 들어간다");
/* 4. 이름이 다르면·명단에 없으면 */
must(/명단에서 찾지 못했/.test(err(()=>login({role:"student",hakbun:"1101",name:"딴이름",pin:"493028"}))),"학번과 이름이 다르면 거부");
must(/명단에서 찾지 못했/.test(err(()=>login({role:"student",hakbun:"9999",name:"없음"}))),"명단에 없으면 안내");
/* 5. 교사 */
must(login({role:"teacher",name:"일담"}).need==="setpin","교사도 처음에는 PIN 정하기");
const t1=login({role:"teacher",name:"일담",newPin:"820134"});
must(t1.token&&C().api("state",{_t:t1.token}).me.label==="1학년 담당","교사 PIN 로그인");
must(login({role:"teacher",name:"일담"}).need==="pin","교사도 다음부터는 이름+PIN");
must(!!login({role:"teacher",name:" 일 담 ",pin:"820134"}).token,"이름의 공백은 무시");
const req=login({role:"teacher",name:"모르는샘"});
must(req.need==="approval"&&T["교사신청"].length===1,"교사 명단에 없으면 관리자 승인 대기");
/* 6. PIN 바꾸기·초기화·잠금 풀기 */
must(/지금 쓰는 PIN/.test(err(()=>C().api("pinChange",{_t:again.token,pin:"000000",newPin:"771122"}))),"지금 PIN 을 맞혀야 바꾼다");
C().api("pinChange",{_t:again.token,pin:"493028",newPin:"771122"});
must(!!login({role:"student",hakbun:"1101",name:"가온",pin:"771122"}).token,"바꾼 PIN 으로 들어간다");
const admTok=login({role:"teacher",name:"사서",newPin:"640913"}).token;
C().api("pinReset",{_t:admTok,hakbun:"1101"});
must(login({role:"student",hakbun:"1101",name:"가온"}).need==="setpin","선생님이 초기화하면 새 PIN 을 정한다");
must(C().api("state",{_t:again.token}).need==="login","초기화하면 그 학생의 기기도 모두 풀린다");
/* 7. 자동 로그인 끄기 = 하루짜리 */
const short=login({role:"student",hakbun:"1102",name:"나리",agree:true,newPin:"305174",remember:false});
must(C().api("state",{_t:short.token}).me.id==="1102","자동 로그인을 꺼도 그때는 들어간다");
NOW=new Date(NOW.getTime()+2*24*3600000);
must(C().api("state",{_t:short.token}).need==="login","자동 로그인을 끄면 토큰이 하루만 산다");
