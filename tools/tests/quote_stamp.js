/* 문장 채집 · 선생님 도장 · 라벨 주 1편 (2026-09-22 회장님 지시) */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
db.setConf("이달","2026-10");

T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"일담","담당":"1학년"},{"이름":"과학","담당":"교사"});
[["1101","가온"],["1102","나리"],["2101","마루"]].forEach(([h,n])=>T["명단"].push({"학번":h,"이름":n,"반":h[0]+"-"+String(Number(h[1])),"동의":"y"}));
[1,2,3].forEach(i=>T["도서"].push({"id":"m"+i,"제목":"추천책 "+i+"호","지은이":"지은이"+i,"영역":"소설","출처":"자동","월":"2026-10","소장":"Y","권수":"2"}));
const tok={};
["가온","나리","마루"].forEach((n,i)=>{const hb=["1101","1102","2101"][i];
  tok[hb]=C().api("login",{role:"student",hakbun:hb,name:n,agree:true,newPin:"41820"+i}).token;});
["사서","일담","과학"].forEach((n,i)=>{tok[n]=C().api("login",{role:"teacher",name:n,newPin:"71390"+i}).token;});
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};
const text=n=>"이 책은 정말 좋았다. ".repeat(Math.ceil(n/12)).slice(0,n);
const label=(who,b)=>as(who,"submit",{kind:"label",bookId:b,text:text(60),why:"도서관에서 빌려 읽었다"});
const quote=(who,b,t)=>as(who,"quoteAdd",{bookId:b,page:"45쪽",text:t});

/* ── 라벨은 한 주에 한 편 ── */
must(!label("1101","m1").ERR,"라벨 한 편은 된다");
must(/한 주에 1편/.test(label("1101","m2").ERR||""),"같은 주 두 번째 라벨은 막힌다");
NOW=new Date("2026-10-14T01:00:00Z");
must(!label("1101","m2").ERR,"다음 주가 되면 다시 쓸 수 있다");
NOW=new Date("2026-10-07T02:00:00Z");

/* ── 문장 채집 ── */
must(!quote("1101","m1","살아야 할 이유를 아는 사람은 거의 모든 어려움을 견딘다.").ERR,"문장 채집");
must(/하루에 하나/.test(quote("1101","m2","두 번째로 옮겨 적는 문장입니다.").ERR||""),"문장 채집은 하루에 하나");
must(/다른 친구가 먼저/.test(quote("1102","m1","살아야 할 이유를 아는 사람은 거의 모든 어려움을 견딘다.").ERR||""),"남이 올린 같은 문장은 막힌다");
must(/10~140자/.test(quote("1102","m1","짧다").ERR||""),"너무 짧은 문장은 막힌다");
must(/쪽에서/.test(as("1102","quoteAdd",{bookId:"m1",text:"쪽수를 적지 않은 문장입니다 여기."}).ERR||""),"쪽수를 적어야 한다");

/* 문장은 게시판이 아니라 문장 벽으로 */
let s=as("1101","state");
must(s.board.every(x=>x.kind!=="quote"),"문장은 게시판 카드로 쌓이지 않는다");
must(s.quoteWall.length===1&&s.quoteWall[0].cls==="1-1"&&!s.quoteWall[0].name,"문장 벽에는 학급만, 이름은 없다");
must(s.myQuotes.length===1&&s.myQuotes[0].page==="45쪽","내가 올린 문장은 따로 보인다");
must(s.week.stamps.some(x=>x.k==="quote"),"문장 채집도 도장 하나");

/* 한 주에 문장 도장은 하나까지(더 모아도 벽에는 올라감) */
NOW=new Date("2026-10-08T02:00:00Z");
must(!quote("1101","m2","다음 날 옮겨 적은 또 다른 문장이 여기에 있습니다.").ERR,"다음 날 또 채집할 수 있다");
s=as("1101","state");
must(s.week.stamps.filter(x=>x.k==="quote").length===1,"문장 도장은 한 주에 하나");
must(s.quoteWall.length===2,"도장이 안 돼도 문장 벽에는 올라간다");

/* ── 선생님 도장 ── */
must(/한 마디/.test(as("과학","stampGive",{hakbun:"1101",reason:""}).ERR||""),"사유 없이는 못 찍는다");
must(!as("과학","stampGive",{hakbun:"1101",reason:"점심시간마다 읽는 모습"}).ERR,"교과 교사도 도장을 찍을 수 있다");
must(/이미 찍어/.test(as("과학","stampGive",{hakbun:"1101",reason:"오늘 또 한 번"}).ERR||""),"같은 학생에게 하루 한 번");
must(!as("일담","stampGive",{hakbun:"1101",reason:"독서 토론에서 좋은 질문"}).ERR,"다른 선생님은 따로 찍을 수 있다");
must(/명단에서 찾지/.test(as("과학","stampGive",{hakbun:"9999",reason:"없는 학생"}).ERR||""),"명단에 없는 학번은 막힌다");
s=as("1101","state");
const tst=s.week.stamps.filter(x=>x.k==="teacher");
must(tst.length===2,"선생님 도장 두 개");
must(tst.some(x=>x.fills==="review")||tst.some(x=>x.fills==="quiz"),"선생님 도장은 빠진 종류를 대신 채운다");
must(/과학 선생님/.test(tst[0].t)&&/점심시간/.test(tst[0].t),"도장에 사유와 선생님 이름이 함께");

/* 찾기·한도·무르기 */
const f=as("과학","stampFind",{q:"가온"});
must(f.list[0].hakbun==="1101"&&f.list[0].week===2&&f.list[0].got,"찾기 화면에 이번 주 받은 수와 오늘 내가 줬는지");
db.setConf("교사도장하루","1");
must(/오늘은 1개까지/.test(as("과학","stampGive",{hakbun:"1102",reason:"책을 챙겨 읽음"}).ERR||""),"하루 한도를 넘으면 막힌다");
const mine=as("과학","state").given;
must(mine.length===1&&mine[0].name==="가온"&&as("과학","state").givenToday===1,"내가 준 도장 목록");
must(/내가 찍은 도장만/.test(as("일담","stampUndo",{id:mine[0].id}).ERR||""),"남이 찍은 도장은 못 무른다");
must(!as("과학","stampUndo",{id:mine[0].id}).ERR&&as("1101","state").week.stamps.filter(x=>x.k==="teacher").length===1,"무르면 도장이 사라진다");
must(!as("사서","stampUndo",{id:as("일담","state").given[0].id}).ERR,"관리자는 아무 도장이나 무를 수 있다");

/* ── 별 세 종류: 문장으로도 '라벨 자리'가 채워진다 ── */
T["도장"].length=0;
NOW=new Date("2026-10-09T02:00:00Z");
db.setConf("교사도장하루","10");
as("2101","quoteAdd",{bookId:"m1",page:"12쪽",text:"마루가 옮겨 적은 첫 문장이 여기에 놓인다."});
as("2101","submit",{kind:"review",bookId:"m2",text:text(320),why:"수업에서 듣고 읽었다",page:"45쪽",head:"한 줄 머리"});
T["퀴즈응답"].push({"주":Core.weekKey(NOW,0),"학번":"2101","점수":"5","시각":"2026-10-09 11:00:00","문항수":"5"});
as("사서","stampGive",{hakbun:"2101",reason:"도서관 정리를 도와줌"});
as("일담","stampGive",{hakbun:"2101",reason:"아침마다 읽는 모습"});
const s2=as("2101","state");
must(s2.week.stamps.length===5,"한 주 도장 5개(문장·독후감·퀴즈·선생님 둘)");
must(s2.stars.shown===1,"라벨을 한 편도 안 써도 문장·선생님 도장으로 별 하나");

/* ── 선생님 화면: 문장 내리기·오늘의 문장 ── */
const q1=as("일담","state").quotes[0];
must(q1&&q1.cls==="1-1","학년 담당에게는 우리 학년 문장만");
const nq=T["문장"].length;
must(/관리자/.test(as("일담","quoteMark",{id:q1.id}).ERR||""),"오늘의 문장으로 올리는 것은 관리자만");
must(!as("사서","quoteMark",{id:q1.id}).ERR&&T["문장"].length===nq+1,"관리자가 오늘의 문장으로 올림");
must(!as("일담","quoteMark",{id:q1.id,down:true}).ERR&&as("1101","state").quoteWall.every(x=>x.id!==q1.id),"내린 문장은 벽에서 사라진다");
