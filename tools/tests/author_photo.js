/* 작가 얼굴 채우기(2026-10-11 회장님 "작가 얼굴 업뎃"): 한국어 위키백과에 사진이 없으면
   위키데이터 대표 사진(P18, 공용) → 영어 위키백과 공용 사진 차례로. 공정 이용 사진·손으로 넣은 사진은 건드리지 않는다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-11T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const J=o=>({code:200,text:JSON.stringify(o)});
let calls=[],wdFail=false,rawPipe=false;   /* Apps Script(UrlFetchApp)는 주소에 | 가 그대로 있으면 거부한다 */
const http=reqs=>reqs.map(q=>{
  if(/\|/.test(q.url))rawPipe=true;
  const u=decodeURIComponent(q.url);calls.push(u);
  if(/wbgetentities/.test(u)){
    if(wdFail)return {code:500,text:""};
    const ts=/titles=(.+)$/.exec(u)[1].split("|"),ent={};
    const W={"한강 (작가)":{q:"Q1",p18:"Han Kang 2017.jpg"},"조지 오웰":{q:"Q2",en:"George Orwell"},"무라카미 하루키":{q:"Q3",en:"Haruki Murakami"},"이름만":{q:"Q4"}};
    ts.forEach(t=>{const w=W[t];if(!w)return;
      ent[w.q]={claims:w.p18?{P18:[{mainsnak:{datavalue:{value:w.p18}}}]}:{},sitelinks:Object.assign({kowiki:{title:t}},w.en?{enwiki:{title:w.en}}:{})};});
    return J({entities:ent});
  }
  let m=/en\.wikipedia\.org\/api\/rest_v1\/page\/summary\/(.+)$/.exec(u);
  if(m){if(m[1]==="George_Orwell")return J({thumbnail:{source:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Orwell.jpg/320px-Orwell.jpg"}});
    if(m[1]==="Haruki_Murakami")return J({thumbnail:{source:"https://upload.wikimedia.org/wikipedia/en/a/aa/Murakami_fairuse.jpg"}});
    return {code:404,text:"{}"};}
  return {code:404,text:"{}"};});
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,8),hmac:s=>s,http,mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const C=()=>Core.make(db,env);C().maintain();
const A=(n,o)=>db.add("작가",Object.assign({"이름":n,"소개":n+"는 작가이다.","확인":"2026-10-01"},o||{}));
A("한강",{"출처":"https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B0%95_(%EC%9E%91%EA%B0%80)"});   /* 문서 이름이 '한강 (작가)' */
A("조지 오웰");A("채만식");A("정세랑");A("무라카미 하루키");A("이름만");
A("박경리",{"사진":"https://upload.example/pk.jpg"});
A("숨긴 사람",{"숨김":"Y"});A("소개 없음",{"소개":""});
const ph=n=>T["작가"].find(r=>r["이름"]===n)["사진"];
const r=C().fillPhotos(true);
must(/Special:FilePath\/Han_Kang_2017\.jpg\?width=320$/.test(ph("한강")),"위키데이터 대표 사진(문서 이름이 달라도 출처 주소로 찾음)");
must(/wikipedia\/commons\//.test(ph("조지 오웰")),"영어 위키백과 공용 사진");
must(ph("무라카미 하루키")==="","영어 위키백과 '공정 이용' 사진은 안 씀");
must(ph("이름만")==="","사진이 어디에도 없으면 빈칸 그대로");
must(ph("박경리")==="https://upload.example/pk.jpg","이미 있는 사진은 그대로");
must(r.checked===6&&r.filled===4&&r.left===2,"숨김·소개 없는 줄은 안 봄(6명 중 4명 채움)");
must(ph("정세랑")==="https://image.aladin.co.kr/Author/Photo/1720627/1720627_4.jpg","주소로 지정한 사진은 그대로(알라딘 작가 사진)");
must(/Special:FilePath\/%D0%A7/.test(ph("채만식")),"눈으로 확인해 지정한 사진(채만식)");
const cf=k=>(T["설정"].find(x=>x["항목"]===k)||{})["값"];
must(cf("작가사진")==="2026-10-11|4|2","설정에 오늘·채운 수·남은 수");
calls=[];must(C().fillPhotos(false)===null&&calls.length===0,"같은 날 두 번째는 묻지 않음");
NOW=new Date("2026-10-12T03:00:00Z");wdFail=true;
const r2=C().fillPhotos(false);
must(r2.failed===1&&cf("작가사진").startsWith("2026-10-11"),"위키데이터가 막히면 기록을 안 남겨 다음에 다시");
/* 학생 화면 작가 이야기에 사진이 나온다 */
T["교사"].push({"이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y"});
const tok=C().api("login",{role:"student",hakbun:"3101",name:"가온",agree:true,newPin:"418207"}).token;
let f;try{f=C().api("authorFind",{_t:tok,q:"조지 오웰"});}catch(x){f={ERR:x.message};}
must(f&&f.list&&f.list[0]&&/commons/.test(f.list[0].photo),"작가 찾기에 새 사진이 나온다");
must(!rawPipe,"주소에 | 를 그대로 넣지 않는다(%7C)");
/* 김수현 바로잡기(드라마 작가로 잘못 받힌 줄) */
T["설정"]=T["설정"].filter(x=>x["항목"]!=="작가고침판");
db.add("작가",{"이름":"김수현","직업":"대한민국의 드라마 작가","생몰":"1943~","소개":"김수현은 드라마 작가이다.","확인":"2026-10-01"});
C().maintain();
const ks=T["작가"].find(x=>x["이름"]==="김수현");
must(/나는 나로 살기로 했다/.test(ks["소개"])&&/aladin/.test(ks["사진"])&&ks["생몰"]==="","김수현 소개를 학교 책 지은이로 바로잡음");
ks["소개"]="선생님이 고쳐 쓴 소개";C().maintain();
must(ks["소개"]==="선생님이 고쳐 쓴 소개","한 번만(그 뒤 고친 것은 그대로)");
