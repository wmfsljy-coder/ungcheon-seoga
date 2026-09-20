/* 로그인 점검(2026-09-20): 인증번호·토큰·기기·권한의 구멍 찾기 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-06T03:00:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
let MAIL=[],QUOTA=100,SEQ=0;
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>"u"+(++SEQ)+"x".repeat(9),hmac:s=>"H("+s+")",http:()=>{throw 1},
  mail:(to,s,b)=>{if(QUOTA<=0)throw new Error("quota");QUOTA--;MAIL.push({to:to,body:b});},mailQuota:()=>QUOTA};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();T["주제"].length=0;
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const err=f=>{try{f();return "";}catch(e){return e.message;}};
T["교사"].push({"이메일":"lib@school.kr","이름":"사서","담당":"관리자"},{"이메일":"","이름":"새샘","담당":"2학년"},{"이메일":"g1@school.kr","이름":"일담","담당":"1학년"});
[["1101","가온"],["1102","나리"],["2101","두리"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+h[1],"이메일":"","동의":"","도서부":""}));
const code=email=>{const r=T["인증"].find(x=>x["이메일"]===email);const m=MAIL.filter(x=>x.to===email).pop();return (m&&(m.body.match(/\b(\d{6})\b/)||[])[1])||"";};
function bump(sec){NOW=new Date(NOW.getTime()+(sec||40)*1000);}
const start=p=>{bump(40);return C().api("authStart",p);};   /* 30초 재요청 간격을 넘기며 */
const verify=p=>C().api("authVerify",p);

/* 1. 학생 첫 로그인: 동의 → 인증번호 → 토큰 */
let r=start({role:"student",hakbun:"1101",name:"가온",email:"gaon@gmail.com"});
must(r.need==="consent","동의 전에는 개인정보 동의부터");
r=start({role:"student",hakbun:"1101",name:"가온",email:"gaon@gmail.com",agree:true});
must(r.sent&&MAIL.length===1,"동의하면 인증번호 발송");
must(!/gaon@gmail\.com/.test(String(r.to))&&/\*/.test(String(r.to)),"화면에는 메일을 가려서 보여 준다("+r.to+")");
const cd=code("gaon@gmail.com");
must(/^\d{6}$/.test(cd),"인증번호는 6자리");
must(!T["인증"].some(x=>String(x["코드"])===cd),"시트에는 번호를 그대로 두지 않는다(해시)");
let tk=verify({email:"gaon@gmail.com",code:cd,remember:true});
must(tk.token&&C().api("state",{_t:tk.token}).me.id==="1101","토큰으로 들어간다");
must(!T["기기"].some(x=>String(x["토큰"])===tk.token),"기기 시트에도 토큰을 그대로 두지 않는다(해시)");
/* 2. 틀린 번호·재사용·만료 */
start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com",agree:true});
const cd2=code("nari@gmail.com");
for(let i=1;i<=5;i++){const e=err(()=>verify({email:"nari@gmail.com",code:"000000"}));if(i<5)must(/\d\/5/.test(e),"틀린 번호 "+i+"회: "+e);}
must(/더 쓸 수 없습니다/.test(err(()=>verify({email:"nari@gmail.com",code:cd2}))),"5번 틀리면 그 번호는 폐기");
start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com",agree:true});
const cd3=code("nari@gmail.com");
must(!!verify({email:"nari@gmail.com",code:cd3}).token,"번호를 다시 받으면 들어간다");
must(/먼저 받아/.test(err(()=>verify({email:"nari@gmail.com",code:cd3}))),"같은 번호를 두 번 쓸 수 없다");
start({role:"student",hakbun:"2101",name:"두리",email:"duri@gmail.com",agree:true});
const cd4=code("duri@gmail.com");const t0=NOW.getTime();NOW=new Date(t0+11*60*1000);
must(/시간\(10분\)이 지났/.test(err(()=>verify({email:"duri@gmail.com",code:cd4}))),"10분이 지나면 못 쓴다");
NOW=new Date(t0+12*60*1000);
/* 3. 사칭·중복 메일 */
must(/다른 메일/.test(err(()=>start({role:"student",hakbun:"1101",name:"가온",email:"nampeo@gmail.com",agree:true}))),"이미 등록된 학번을 남의 메일로 못 가져간다");
must(/다른 학생/.test(err(()=>start({role:"student",hakbun:"2101",name:"두리",email:"gaon@gmail.com",agree:true}))),"한 메일을 두 학생이 못 쓴다");
must(/선생님 계정/.test(err(()=>start({role:"student",hakbun:"2101",name:"두리",email:"lib@school.kr",agree:true}))),"선생님 메일로 학생 등록 못 한다");
must(/명단에 없는 학생/.test(err(()=>start({role:"student",hakbun:"9999",name:"없음",email:"no@gmail.com",agree:true}))),"명단에 없으면 관리자 확인 안내");
must(/명단에 없는 학생/.test(err(()=>start({role:"student",hakbun:"1101",name:"딴이름",email:"x@gmail.com",agree:true}))),"학번과 이름이 다르면 거부");
/* 4. 기기·로그아웃·등록 풀기 */
must(C().api("state",{_t:"아무거나"}).need==="login","엉터리 토큰은 로그인 화면");
C().api("logout",{_t:tk.token});
must(C().api("state",{_t:tk.token}).need==="login","로그아웃하면 그 기기 토큰이 죽는다");
let tk2=(start({role:"student",hakbun:"1101",name:"가온",email:"gaon@gmail.com"}),verify({email:"gaon@gmail.com",code:code("gaon@gmail.com")}));
must(C().api("state",{_t:tk2.token}).me.id==="1101","다시 로그인하면 새 토큰");
const g1=verify({email:"g1@school.kr",code:(start({role:"teacher",name:"일담",email:"g1@school.kr"}),code("g1@school.kr"))}).token;
C().api("resetAccount",{hakbun:"1101",_t:g1});
must(C().api("state",{_t:tk2.token}).need==="login","선생님이 등록을 풀면 그 학생의 모든 기기가 풀린다");
/* 5. 기억하지 않기 = 하루짜리 */
start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com"});
const tk3=verify({email:"nari@gmail.com",code:code("nari@gmail.com"),remember:false});
must(C().api("state",{_t:tk3.token}).me.id==="1102","기억하지 않기로도 그날은 들어간다");
const t1=NOW.getTime();NOW=new Date(t1+2*24*3600*1000);
must(C().api("state",{_t:tk3.token}).need==="login","기억하지 않기 토큰은 이틀 뒤 만료");
NOW=new Date(t1+3600*1000);
/* 6. 선생님 */
r=start({role:"teacher",name:"새샘",email:"saesam@gmail.com"});
must(r.sent,"교사 명단에 이름이 있으면(메일 비어 있음) 인증번호");
const tt=verify({email:"saesam@gmail.com",code:code("saesam@gmail.com")});
must(T["교사"].find(x=>x["이름"]==="새샘")["이메일"]==="saesam@gmail.com"&&C().api("state",{_t:tt.token}).me.label==="2학년 담당","확인하면 그 교사 줄에 메일이 붙는다");
r=start({role:"teacher",name:"모르는샘",email:"nobody@gmail.com"});
must(r.need==="approval"&&T["교사신청"].length===1,"명단에 없는 선생님은 관리자 승인 대기");
must(!MAIL.some(m=>m.to==="nobody@gmail.com"),"승인 전에는 인증번호를 보내지 않는다");
/* 7. 남의 화면 엿보기 */
const stTok=verify({email:"nari@gmail.com",code:(start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com"}),code("nari@gmail.com"))}).token;
must(C().api("state",{_t:stTok,as:"1101"}).me.id==="1102","학생이 as 를 붙여도 남의 화면은 못 본다");
must(/우리 학년/.test(err(()=>C().api("state",{_t:g1,as:"2101"}))),"1학년 담당은 2학년 학생 화면을 못 본다");
must(C().api("state",{_t:g1,as:"1102"}).me.id==="1102","자기 학년 학생 화면은 볼 수 있다");
/* 8. 요청 횟수·메일 한도 */
for(let i=0;i<5;i++)start({role:"student",hakbun:"2101",name:"두리",email:"duri@gmail.com",agree:true});
must(/너무 여러 번/.test(err(()=>start({role:"student",hakbun:"2101",name:"두리",email:"duri@gmail.com",agree:true}))),"1시간에 5번까지만 번호를 받는다");
QUOTA=0;
must(/오늘 보낼 수 있는 인증번호를 다 썼/.test(err(()=>start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com"}))),"메일 한도가 바닥나면 안내");
QUOTA=100;
/* 9. 선생님이 등록해 준 학생: 기본은 인증번호를 거친다 */
C().api("rosterAdd",{hakbun:"1102",name:"나리",email:"nari@gmail.com",_t:g1});
must(!start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com"}).skipped,"교사등록무인증 N: 그래도 인증번호");
db.setConf("교사등록무인증","Y");
must(start({role:"student",hakbun:"1102",name:"나리",email:"nari@gmail.com"}).skipped,"Y 로 바꾸면 바로 입장");
