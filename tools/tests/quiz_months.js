const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]===\"로그인방식\")r[1]=\"구글\";});");
let NOW=new Date("2026-09-21T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
T["문장"]=Core.QUOTES.slice(0,52).map(q=>({"문장":q[0],"출처":q[1],"종류":q[2],"숨김":""}));
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const TOP=["우정","기억","바다","용기","도시","시간","가족","숲","별","편지","전쟁","음악","요리","로봇","우주","식물","고양이","철도","섬","시장"];
const http=reqs=>reqs.map(q=>{
  if(/category\/list/.test(q.url))return ok({categoryList:Core.GENRES.map(g=>({lCategoryCode:g[0]}))});
  if(/detail\/info\/isbn/.test(q.url)){const n=Number(/isbn=(\d+)/.exec(q.url)[1].slice(-6));const t=TOP[n%20],u=TOP[(n*7+3)%20];
    return ok({description:"예시 책 소개입니다. 주인공은 "+t+"에 얽힌 오래된 비밀을 따라가며 한 해 동안 조금씩 달라진다. 끝에서 밝혀지는 진실은 "+u+"에 대한 생각을 바꾸게 만든다.",keywordList:[t,u,"예시"+n]});}
  if(q.body&&q.body.categoryCode){const g=q.body.categoryCode.slice(0,3),pg=q.body.page;
    return ok({totalCount:q.body.display===1?700:300,bookList:Array.from({length:50},(_,k)=>({bookKey:"k"+g+pg+k,title:"책"+g+"-"+pg+"-"+String.fromCharCode(44032+k),author:"지은이"+g+pg+k+" 지음",pubFormCode:"MA",appendixYn:"N",pubYear:"2020",
      isbn:"979"+String(1e9+Number(g)*10000+pg*100+k),callNo:(100+(Number(g)*37+k*11)%800)+".6 가"+k+" c.2",categoryInfo:{mcode:g+"00"+(k%3)+"000",mdesc:"중분류"+(k%3)}}))});}
  if(q.body){const t=q.body.searchKeyword;return ok({totalCount:/^책/.test(t)?1:0,bookList:/^책/.test(t)?[{bookKey:"z"+t,title:t,author:"지은이 지음",callNo:"813.6 가1",isbn:""}]:[]});}
  return ok({status:"대출가능"});});
const env={now:()=>NOW,email:()=>"lib@x",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>s,http};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"전체"});
T["명단"].push({"학번":"30201","이름":"김","반":"3-2","이메일":"s@x","동의":"y"});
const C=()=>Core.make(db,env);
const conf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
let r=C().tick();
console.log("문장 시트",T["문장"].length,"줄 | 문장판",conf("문장판"));
const shelf=()=>C().api("state").books;
console.log("9월 서가",shelf().length,"권 | 이달",conf("이달"),"| 은행(9월 예비)",T["퀴즈"].filter(q=>q["월"]==="2026-09"&&q["상태"]==="예비").length+"+출제"+T["퀴즈"].filter(q=>q["월"]==="2026-09"&&q["상태"]==="출제").length);
const kinds={};T["퀴즈"].filter(q=>q["월"]==="2026-09").forEach(q=>kinds[q["품질근거"]]=(kinds[q["품질근거"]]||0)+1);console.log("  은행 종류",JSON.stringify(kinds));
/* 둘째 주에 쓸 좋은 학생 문제 하나(서가 책) */
const sb=shelf()[7];
T["퀴즈"].push({"id":"stu1","시각":"2026-09-22 10:00:00","주":"","상태":"대기","책제목":sb.t,"쪽수":"12쪽","문제":"12쪽에서 주인공이 처음 한 말은?","보기1":"a","보기2":"b","보기3":"c","보기4":"d","정답":"2","해설":"12쪽","학번":"30201","반":"3-2","출처":"학생","품질":"9","품질근거":"","월":""});
const weeks=[];
for(let d=0;d<50;d++){
  NOW=new Date(Date.parse("2026-09-21T01:00:00Z")+d*864e5);
  const res=C().tick();
  if(res.next&&res.next.picked)console.log("  "+NOW.toISOString().slice(0,10)+" 다음 달 미리 뽑음:",res.next.month,res.next.picked,"권 · 은행",res.next.bank,"문제 | 학생 서가",shelf().length,"권(이달 "+conf("이달")+")");
  if(res.rotate&&res.rotate.activated)console.log("  "+NOW.toISOString().slice(0,10)+" 미리 뽑은 책으로 바뀜:",res.rotate.month,res.rotate.picked,"권");
}
const live=T["퀴즈"].filter(q=>q["상태"]==="출제");
const byWk={};live.forEach(q=>(byWk[q["주"]]=byWk[q["주"]]||[]).push(q));
Object.keys(byWk).sort().forEach(w=>{const q=byWk[w],bk=[...new Set(q.map(x=>x["책제목"]))];
  console.log(w,q.length+"문제",bk.length+"권",q.map(x=>(x["출처"]==="학생"?"학생":x["품질근거"].replace("자동:",""))).join(","),"| 월",[...new Set(q.map(x=>x["월"]||"-"))].join(","));});
const texts=live.map(q=>q["문제"]);console.log("겹친 문제",texts.length-new Set(texts).size,"| 3권 넘은 주",Object.values(byWk).filter(q=>new Set(q.map(x=>x["책제목"])).size>3).length,"| 학생 문제 출제 주",(T["퀴즈"].find(q=>q.id==="stu1")||{})["주"]);
const st=C().api("state");console.log("11월 서가",st.books.length,"권 | 이번 주 퀴즈 책(교사 화면)",JSON.stringify(st.weekBooks),"| next",st.next&&st.next.month);
T["퀴즈"].filter(q=>q["주"]==="2026-10-26").forEach(q=>console.log("DBG",q["책제목"],q["월"],q["상태"],q["시각"],T["도서"].filter(b=>b["제목"]===q["책제목"]).map(b=>b["월"]+"/"+b["숨김"]).join(";")));
