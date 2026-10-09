/* 도서 검색 탭(2026-10-09 회장님 지시): 청소년 권장도서(소장만) · 작가 이야기(짧은 열전·생일) · 이주의 인물
   위키백과는 가짜 응답으로 — 동음이의어(김영하), 다른 뜻(한강=강), 요청 막힘(429) 을 일부러 섞는다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-11-30T03:00:00Z");   /* 11/30(월)~12/6 주: 박경리 생일 12-02 */
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const seen=[];let block=true;
const S=(o)=>({code:200,text:JSON.stringify(o)});
const P={
  "박경리":{type:"standard",title:"박경리",description:"한국의 소설가",extract:"박경리(朴景利, 1926년 12월 2일 ~ 2008년 5월 5일)는 대한민국의 소설가이다. 대하소설 《토지》가 대표작이다.",wikibase_item:"Q1",thumbnail:{source:"https://upload.example/pk.jpg"},content_urls:{desktop:{page:"https://ko.wikipedia.org/wiki/박경리"}}},
  "김영하":{type:"disambiguation",title:"김영하",extract:"김영하는 다음 사람을 가리킨다."},
  "김영하_(소설가)":{type:"standard",title:"김영하 (소설가)",description:"대한민국의 소설가",extract:"김영하(1968년 11월 11일 ~ )는 대한민국의 소설가이다.",wikibase_item:"Q2",content_urls:{desktop:{page:"https://ko.wikipedia.org/wiki/김영하_(소설가)"}}},
  "한강":{type:"standard",title:"한강",description:"대한민국의 강",extract:"한강은 한반도 중부를 흐르는 강이다.",wikibase_item:"Q3"},
  "한강_(작가)":{type:"standard",title:"한강 (작가)",description:"대한민국의 소설가",extract:"한강(韓江, 1970년 11월 27일~)은 대한민국의 작가이다. 『소년이 온다』, 『채식주의자』를 썼다.",wikibase_item:"Q4",content_urls:{desktop:{page:"https://ko.wikipedia.org/wiki/한강_(작가)"}}}
};
const http=reqs=>reqs.map(q=>{
  const u=decodeURIComponent(q.url);seen.push(u);
  let m=/page\/summary\/(.+)$/.exec(u);
  if(m){if(m[1]==="조지_오웰"&&block)return {code:429,text:""};const x=P[m[1]];return x?S(x):{code:404,text:"{}"};}
  m=/srsearch=(.+)$/.exec(u);
  if(m){const s=m[1];if(/^김영하/.test(s))return S({query:{search:[{title:"김영하 (소설가)"},{title:"김영하 (정치인)"}]}});
    if(/^한강/.test(s))return S({query:{search:[{title:"한강"},{title:"한강 (작가)"}]}});return S({query:{search:[]}});}
  if(/wbgetentities/.test(u))return S({entities:{}});
  return {code:404,text:"{}"};});
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http,mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
/* 권장도서 시트를 작게: 우리 학교에 있는 책만 들어 있는 시트(뺌 Y 하나) */
T["권장도서"]=[];
[["토지","박경리","소설","813.6 박13ㅌ",3],["김약국의 딸들","박경리","소설","813.6 박13ㄱ",1],["살인자의 기억법","김영하 지음","소설","813.7 김67ㅅ",2],
 ["소년이 온다","한강","소설","813.7 한22ㅅ",2],["1984","조지 오웰","소설","843 오66",1],["빼 둔 책","아무개","인문","100",1,"Y"]]
 .forEach(([t,a,s,c,n,x])=>db.add("권장도서",{"제목":t,"지은이":a,"영역":s,"청구기호":c,"권수":n,"뺌":x||""}));
T["장서목록"]=[{"제목":"시장과 전장","지은이":"박경리 지음","청구기호":"813.6 박13ㅅ","권수":"1"}];
T["교사"].push({"이름":"사서","담당":"관리자"});
T["명단"].push({"학번":"3101","이름":"가온","반":"3-1","동의":"y"});
const tok=C().api("login",{role:"student",hakbun:"3101",name:"가온",agree:true,newPin:"418207"}).token;
const as=(op,p)=>{try{return C().api(op,Object.assign({_t:tok},p||{}));}catch(x){return {ERR:x.message};}};

must(Core.make(db,env).authorKey("김영하 지음")==="김영하"&&Core.make(db,env).authorKey("글·그림 이수지")==="이수지"&&Core.make(db,env).authorKey("유발 하라리 지음 ; 조현욱 옮김")==="유발 하라리","지은이 칸에서 작가 이름만 뽑는다");
/* ── 청소년 권장도서: 소장(권장도서 시트, 뺌 제외)만 ── */
const fh=as("findHome");
must(fh.rec.length===5&&!fh.rec.some(b=>b.t==="빼 둔 책"),"청소년 권장도서는 시트의 소장 도서만(뺌 제외) 5권");
must(fh.rec.every(b=>b.call&&b.s),"권장도서 목록에 청구기호·영역");
must(fh.person===null,"작가 소개가 아직 없으면 이주의 인물도 없음");
/* ── 작가 소개 모으기 ── */
const n=C().fillAuthors(10);
const A=k=>T["작가"].find(r=>r["이름"]===k);
must(A("박경리")&&A("박경리")["생몰"]==="1926~2008"&&A("박경리")["생일"]==="12-02","박경리: 생몰 1926~2008 · 생일 12-02(첫 문장에서)");
must(A("김영하")&&/소설가/.test(A("김영하")["직업"])&&A("김영하")["생일"]==="11-11","동음이의어 문서면 검색해서 소설가 김영하를 찾는다");
must(A("한강")&&/작가/.test(A("한강")["소개"])&&!/강이다/.test(A("한강")["소개"]),"‘한강’은 강이 아니라 작가 한강");
must(!A("조지 오웰"),"요청이 막히면(429) 줄을 쓰지 않고 다음에 다시");
must(A("아무개")===undefined,"뺌 Y 인 책의 지은이는 받지 않는다");
block=false;C().fillAuthors(10);
must(A("조지 오웰")&&/없음/.test(A("조지 오웰")["확인"]),"다음 번에 다시 시도 — 위키백과에 없으면 '없음'으로 남긴다");
const before=seen.length;C().fillAuthors(10);
must(seen.length===before,"이미 받은 작가는 다시 받지 않는다");
A("박경리")["소개"]="사서 선생님이 고쳐 쓴 소개.";C().fillAuthors(10);
must(A("박경리")["소개"]==="사서 선생님이 고쳐 쓴 소개.","시트에서 고친 소개는 그대로 남는다");
/* ── 이주의 인물: 이번 주 생일 작가 먼저 ── */
let ph=as("findHome").person;
must(ph&&ph.name==="박경리"&&ph.isBday,"이번 주(12/2) 생일인 박경리가 이주의 인물");
must(ph.books.map(b=>b.t).join(",")==="토지,김약국의 딸들,시장과 전장","이주의 인물 카드에 우리 도서관 책(권장도서 먼저, 장서목록 다음)");
NOW=new Date("2026-12-14T03:00:00Z");
ph=as("findHome").person;
must(ph&&!ph.isBday,"생일 주간이 아니면 돌아가며 한 명");
A("김영하")["숨김"]="Y";A("한강")["숨김"]="Y";
must(as("findHome").person.name==="박경리","숨김 Y 인 작가는 이주의 인물에서 빠진다");
/* ── 작가 찾기 ── */
const af=as("authorFind",{q:"한강"});
must(af.list.length===0,"숨김 Y 인 작가는 찾기에도 안 나온다");
const af2=as("authorFind",{q:"박경"});
must(af2.list.length===1&&af2.list[0].books.length===3,"이름 일부로 찾아도 된다(책 3권)");
must(/두 글자/.test(as("authorFind",{q:"박"}).ERR||""),"한 글자는 안 된다");
const af3=as("authorFind",{q:"없는작가"});
must(af3.list.length===0,"우리 도서관에 책이 없는 작가는 위키백과에 묻지 않는다");

/* 학생 첫 화면 한 줄: 이주의 작가(가볍게 — 소개 없이, 책은 권장도서 두 권) */
NOW=new Date("2026-11-30T03:00:00Z");
const sw=as("state").weekAuthor;
must(sw&&sw.name==="박경리"&&sw.isBday&&!sw.bio&&sw.books.length===2,"학생 화면에 이주의 작가 한 줄(박경리 · 생일 주간 · 책 두 권)");

/* 주요 작가(소개 있는 작가, 권장도서 많은 순) · 교사 첫 화면 이주의 작가 */
A("김영하")["숨김"]="";
const mj=as("findHome").major||[];
must(mj.length>=2&&mj[0].name==="박경리"&&mj[0].n===2&&!mj.some(x=>x.name==="조지 오웰"),"주요 작가: 소개 있는 작가만, 권장도서 많은 순(박경리 2권 먼저)");
const ttok=C().api("login",{role:"teacher",name:"사서",newPin:"713900"}).token;
const tst=C().api("state",{_t:ttok});
must(tst.weekAuthor&&tst.weekAuthor.name==="박경리","선생님 첫 화면에도 이주의 작가");
