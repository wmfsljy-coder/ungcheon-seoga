/* 계정 관리(2026-09-20): 선생님이 학번·이름·구글이메일로 등록 → 인증번호 없이 로그인, 명단은 학번순·비고 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
const GOOGLE=()=>{const h=T["설정"].find(r=>r["항목"]==="로그인방식");if(h)h["값"]="구글";};   /* 옛 방식 시험용 */
const MAILMODE=()=>{const h=T["설정"].find(r=>r["항목"]==="로그인방식");if(h)h["값"]="메일";};
let NOW=new Date("2026-10-06T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:(to,s,b)=>MAIL.push([to,s])};
let MAIL=[];
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();GOOGLE();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"},{"이메일":"g1@x","이름":"일","담당":"1학년"},{"이메일":"sci@x","이름":"과학","담당":"교사"});
[["1102","나리"],["1101","가온"],["2101","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"","동의":"","도서부":""}));
const call=(e,n,p)=>{EMAIL=e;return C().api(n,p||{});};
/* 명단 학번순 정렬 */
C().maintain();
must(T["명단"].map(r=>r["학번"]).join()==="1101,1102,2101","명단이 학번순으로 정리됨");
/* 선생님이 학생을 명단에 넣어 준다(메일 없이 학번·이름·비고) */
let r=call("g1@x","rosterAdd",{hakbun:"1101",name:"가온",memo:"전학생"});
must(r.ok&&!r.made,"학년 담당이 기존 학생 등록");
const row=T["명단"].find(x=>x["학번"]==="1101");
must(row["등록방법"]==="선생님"&&row["비고"]==="전학생","명단에 등록방법·비고가 남음");
/* 학생은 학번·이름으로 들어와 PIN 을 정한다 */
MAILMODE();
must(C().api("login",{role:"student",hakbun:"1101",name:"가온",agree:true}).need==="setpin","선생님이 넣어 준 학생도 PIN 을 정하고 들어간다");
const st=C().api("login",{role:"student",hakbun:"1101",name:"가온",agree:true,newPin:"418205"});
must(st.token&&C().api("state",{_t:st.token}).me.id==="1101","PIN 을 정하면 바로 입장");
must(T["명단"].find(x=>x["학번"]==="1101")["최근접속"],"최근접속이 기록됨");
GOOGLE();
/* 명단에 없는 학번은 새 줄 + 학번순 */
r=call("g1@x","rosterAdd",{hakbun:"1103",name:"세찬",memo:"9월 전입"});
must(r.made&&T["명단"].map(x=>x["학번"]).join()==="1101,1102,1103,2101","새 학생을 넣어도 학번순 유지");
/* 권한 */
let e="";try{call("g1@x","rosterAdd",{hakbun:"2102",name:"남"});}catch(x){e=x.message;}
must(/우리 학년/.test(e),"1학년 담당은 2학년을 넣지 못함");
e="";try{call("sci@x","rosterAdd",{hakbun:"1104",name:"교과"});}catch(x){e=x.message;}
must(/학년 담당 또는 관리자/.test(e),"교과 교사는 계정 관리 못 함");
e="";try{call("lib@x","rosterAdd",{hakbun:"110",name:"짧은"});}catch(x){e=x.message;}
must(/네 자리/.test(e),"학번은 네 자리(1101 형식)만");
/* 조회·PIN 초기화·잠금 풀기 */
const f=call("lib@x","rosterFind",{q:"가온"});
must(f.list[0].hakbun==="1101"&&f.list[0].pin===true&&f.list[0].memo==="전학생","조회: PIN 정함·비고까지 보임");
call("g1@x","pinReset",{hakbun:"1101"});
must(!T["명단"].find(x=>x["학번"]==="1101")["핀"],"PIN 초기화");
must(T["기기"].every(d=>d["해제"]==="Y"),"초기화하면 로그인해 둔 기기도 풀림");
T["명단"].find(x=>x["학번"]==="1101")["잠금"]="2030-01-01 00:00:00";
call("g1@x","unlockAccount",{hakbun:"1101"});
must(!T["명단"].find(x=>x["학번"]==="1101")["잠금"],"잠금 풀기");
/* 여러 명 한꺼번에 등록 */
const LINES=["1201,한별,도서부 지원","1202,두별","99,틀림","1203,세별"].join(String.fromCharCode(10));
const bulk=call("lib@x","rosterBulk",{text:LINES});
must(bulk.ok===3&&bulk.made===3&&bulk.badN===1,"한꺼번에 등록: 3명 성공 · 1줄 문제("+bulk.bad.join(" / ")+")");
must(T["명단"].map(x=>x["학번"]).join()===T["명단"].map(x=>x["학번"]).slice().sort().join(),"한꺼번에 등록해도 학번순");
const b1=T["명단"].find(x=>x["학번"]==="1201");
must(b1&&b1["비고"]==="도서부 지원"&&b1["등록방법"]==="선생님","비고·등록방법이 채워짐");
