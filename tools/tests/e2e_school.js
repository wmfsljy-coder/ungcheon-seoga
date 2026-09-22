/* 가짜 학교 한 달: 학생 626명(3학년×7반), 교사(관리자·학년 담당·교사), 도서부.
   글쓰기·공감·북퀴즈·문제 내기·투표·학년 담당 범위·글 내리기·교사 추천·상품권·도서부 배부·인쇄·독서 기록을 돌리고 규칙이 지켜지는지 본다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;Core.CONF0.forEach(function(r){if(r[0]==='로그인방식')r[1]='구글';});");
let NOW=new Date("2026-10-05T00:30:00Z"),EMAIL="";
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};const pick=a=>a[Math.floor(rnd()*a.length)];
const ok=x=>({code:200,text:JSON.stringify({status:"OK",data:x})});
const http=reqs=>reqs.map(q=>{
  if(q.body&&q.body.searchKeyword){const t=q.body.searchKeyword;return ok({totalCount:1,bookList:[{bookKey:"x",title:t,author:"추천 지은이 지음",callNo:"813.6 추1",isbn:"9791100000000",categoryInfo:{lcode:"001000000"}}]});}
  return ok({status:"대출가능"});});
const env={now:()=>NOW,email:()=>EMAIL,uid:()=>Math.floor(rnd()*1e12).toString(36)+Math.floor(rnd()*1e6).toString(36),hmac:s=>s,http,mail:()=>{}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
db.setConf("이달","2026-09");db.setConf("상품권공개","Y");db.setConf("상품권배부","2026-11-02~2026-11-05");
/* 학생·교사 */
const STU=[];for(let g=1;g<=3;g++)for(let c=1;c<=7;c++)for(let n=1;n<=(g===2?28:30);n++){if(STU.length>=626)break;const hb=""+g+c+String(n).padStart(2,"0");STU.push(hb);
  T["명단"].push({"학번":hb,"이름":"학생"+hb,"반":g+"-"+c,"이메일":"s"+hb+"@x","동의":"y","도서부":(hb==="2301"||hb==="1105")?"Y":""});}
T["교사"].push({"이메일":"lib@x","이름":"사서","담당":"관리자"},{"이메일":"g1@x","이름":"일학년","담당":"1학년"},{"이메일":"g2@x","이름":"이학년","담당":"2학년"},{"이메일":"g3@x","이름":"삼학년","담당":"3학년"},{"이메일":"sub@x","이름":"과학쌤","담당":"교사"});
/* 이번 기간 추천 도서 40권(소개·핵심어·청구기호) */
const TOP=["우정","기억","바다","용기","도시","시간","가족","숲","별","편지","전쟁","음악","요리","로봇","우주","식물","고양이","철도","섬","시장","의사","법정","화산","사막","빙하","곤충","새벽","골목","극장","편의점","등대","공룡","미로","라디오","정원","카메라","지도","자전거","시계탑","눈사람"];
Core.GENRES.forEach((g,gi)=>{for(let k=0;k<(gi<8?3:2);k++){const i=T["도서"].length;if(i>=40)return;
  T["도서"].push({"id":"m"+i,"제목":"추천책 "+i+"호","지은이":"지은이"+i,"영역":g[1],"출처":"자동","월":"2026-09","소장":"Y","청구기호":(800+i)+".6 가"+i,"ISBN":"97911"+i,
    "소개":"예시 소개입니다. 주인공 "+i+"번은 "+TOP[i]+"에 얽힌 오래된 약속을 따라 먼 길을 떠난다. 여정 끝에서 그는 "+TOP[(i*7+3)%40]+"의 진짜 의미를 깨닫게 된다.","핵심어":TOP[i]+","+TOP[(i*7+3)%40],"숨김":"","대출가능":"1","권수":"2"});}});
const errs={};const call=(e,n,p)=>{EMAIL=e;try{return C().api(n,p||{});}catch(x){errs[n+":"+x.message]=(errs[n+":"+x.message]||0)+1;return {ERR:x.message};}};
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const text=n=>"이 책은 정말 좋았다. ".repeat(Math.ceil(n/12)).slice(0,n);
const books=()=>C().api.call?T["도서"].filter(b=>b["숨김"]!=="Y"&&b["월"]==="2026-09").map(b=>b.id):[];
/* 한 달(4주) */
let posts=0,answered=0,votes=0,likes=0;
for(let w=0;w<4;w++){
  NOW=new Date(Date.parse("2026-10-05T00:30:00Z")+w*7*864e5);
  C().ensureWeeklyQuiz();
  const st=call("s"+STU[0]+"@x","state");
  must(st.quiz&&st.quiz.items.length===5&&st.quiz.books.length<=3,w+1+"주차 북퀴즈 5문제 · 책 "+(st.quiz&&st.quiz.books.length)+"권");
  for(let d=0;d<5;d++){
    NOW=new Date(Date.parse("2026-10-05T01:00:00Z")+(w*7+d)*864e5);
    for(let k=0;k<70;k++){const hb=pick(STU),rev=rnd()<0.3;
      const r=call("s"+hb+"@x","submit",{kind:rev?"review":"label",bookId:pick(books()),text:text(rev?320:60),why:"도서관에서 빌려 읽었다",page:rev?"45쪽":"",head:rev?"한 줄 머리":""});
      if(!r.ERR)posts++;}
    /* 열심히 하는 30명: 한 주에 라벨 3 · 독후감 1 · 북퀴즈 1 (별 1개에 세 종류가 다 필요) */
    if(d!==2)STU.slice(400,430).forEach((hb,j)=>{const rev=d===1;
      const r=call("s"+hb+"@x","submit",{kind:rev?"review":"label",bookId:books()[(w*5+d+j)%40],text:text(rev?320:60),why:"매일 조금씩 읽는다",page:rev?"45쪽":"",head:rev?"한 줄 머리":""});if(!r.ERR)posts++;});
    if(d===2)STU.slice(400,430).forEach(hb=>{const s2=call("s"+hb+"@x","state");if(!s2.quiz||s2.quiz.done!=null)return;
      const ans={};s2.quiz.items.forEach(q=>{const row=T["퀴즈"].find(x=>x.id===q.id);ans[q.id]=Number(row["정답"])-1;});
      if(!call("s"+hb+"@x","quizAnswer",{answers:ans}).ERR)answered++;});
    for(let k=0;k<60;k++){const b=T["글"].filter(x=>x["상태"]==="posted");if(!b.length)break;const r=call("s"+pick(STU)+"@x","like",{id:pick(b).id});if(!r.ERR)likes++;}
    if(d===2)for(let k=0;k<120;k++){const hb=pick(STU),s=call("s"+hb+"@x","state");if(!s.quiz||s.quiz.done!=null)continue;
      const ans={};s.quiz.items.forEach(q=>{const row=T["퀴즈"].find(x=>x.id===q.id);ans[q.id]=rnd()<0.7?Number(row["정답"])-1:0;});
      const r=call("s"+hb+"@x","quizAnswer",{answers:ans});if(!r.ERR)answered++;}
    if(w===0&&d<3)for(let k=0;k<80;k++){const hb=pick(STU),s=call("s"+hb+"@x","state");if(!s.voteL||!s.voteL.list.length||!s.voteL.left)continue;
      const r=call("s"+hb+"@x","vote",{kind:"label",id:s.voteL.list[0].id});if(!r.ERR)votes++;}
  }
  if(w===0){NOW=new Date("2026-10-07T03:00:00Z");const q=call("s2105@x","quizSubmit",{book:"추천책 3호",page:"45쪽",q:"45쪽에서 주인공이 처음 만난 사람은 누구인가요?",o1:"할머니",o2:"선장",o3:"친구",o4:"우체부",ans:2,why:"45쪽 첫 문단"});must(q.score>=6,"학생 문제 품질 "+q.score+"/10");}
}
/* 이달의 투표: 새 달 1~7일에 지난달 글로 (2026-11-03) */
NOW=new Date("2026-11-03T02:00:00Z");
const QHB=STU[3];   /* 투표권 시험용 학생은 대량 투표에서 뺀다 */
for(let k=0;k<200;k++){const hb=pick(STU);if(hb===QHB)continue;const s2=call("s"+hb+"@x","state");
  if(!s2.voteL||!s2.voteL.list.length||!s2.voteL.left)continue;
  if(!call("s"+hb+"@x","vote",{kind:"label",id:s2.voteL.list[0].id}).ERR)votes++;}
console.log("글",posts,"편 · 공감",likes,"· 퀴즈 응답",answered,"· 투표",votes);
must(votes>50,"이달의 투표(11월 3일): "+votes+"표");
{const s3=call("s"+STU[5]+"@x","state");must(s3.voteL.list.every(l=>l.date.slice(0,7)==="2026-10"),"후보는 지난달(10월) 글");}
/* 주마다 라벨 2표·독후감 2표, 같은 글에 두 번은 안 됨 */
{const hb=QHB;let s5=call("s"+hb+"@x","state");
 const ids=s5.voteL.list.slice(0,3).map(x=>x.id);
 const r1=call("s"+hb+"@x","vote",{kind:"label",id:ids[0]}),r2=call("s"+hb+"@x","vote",{kind:"label",id:ids[1]});
 const dup=call("s"+hb+"@x","vote",{kind:"label",id:ids[1]}),over=call("s"+hb+"@x","vote",{kind:"label",id:ids[2]});
 must(!r1.ERR&&!r2.ERR&&/이미 뽑은/.test(dup.ERR||"")&&/2표/.test(over.ERR||""),"한 주 라벨 2표까지, 같은 글 중복 금지");
 s5=call("s"+hb+"@x","state");must(s5.voteL.left===0&&s5.voteR.left===2,"독후감 표는 따로 2표 남음");
 NOW=new Date("2026-11-10T02:00:00Z");   /* 다음 주 */
 s5=call("s"+hb+"@x","state");must(s5.voteL.left===2,"다음 주가 되면 표가 새로 생김");}
NOW=new Date("2026-11-09T02:00:00Z");
{
 const rk=call("lib@x","state").result;must(rk.mon==="2026-10"&&rk.voting.label.length&&rk.voting.label[0].votes>0,"월간 집계: 10월 글 득표 순위 1위 "+(rk.voting.label[0]||{}).votes+"표");
 must(!call("lib@x","award",{id:rk.voting.label[0].id}).ERR,"이달의 글 수상 처리");}
NOW=new Date("2026-10-30T03:00:00Z");
must(T["퀴즈"].some(q=>q["학번"]==="2105"&&q["상태"]==="출제"),"학생이 낸 문제가 다음 주 북퀴즈에 뽑힘");
/* 도장 규칙: 한 주 자리 다섯 칸(자리마다 한 번). 주제·이벤트 덤은 그 위에 따로 얹힌다 */
NOW=new Date("2026-10-30T03:00:00Z");
let over=0,dup=0,maxM=0;STU.slice(0,626).forEach(hb=>{const s=call("s"+hb+"@x","state");
  if(s.week){const own=s.week.stamps.filter(x=>!x.extra),seen={};
    if(own.length>5)over++;
    own.forEach(x=>{if(seen[x.slot])dup++;seen[x.slot]=1;});}
  maxM=Math.max(maxM,s.thisMonth?s.thisMonth.count:0);});
must(over===0&&dup===0,"한 주 자리 도장은 다섯 칸까지, 자리마다 한 번(넘침 "+over+" · 중복 "+dup+")");console.log("  한 달 도장 최대 "+maxM+"개");
/* 하루 2편 */
NOW=new Date("2026-10-30T04:00:00Z");const hb0="3401";["label","review","label"].forEach((k,i)=>call("s"+hb0+"@x","submit",{kind:k,bookId:books()[i+10],text:text(k==="review"?320:60),why:"도서관에서 읽음",page:"3쪽"}));
must(T["글"].filter(r=>r["학번"]===hb0&&r["시각"].startsWith("2026-10-30")).length===2,"하루 2편 제한");
/* 학년 담당 범위 */
const g2=call("g2@x","state");must(g2.posts.every(p=>p.cls.startsWith("2-")),"2학년 담당은 2학년 글만 ("+g2.posts.length+"편)");
must(g2.readlog.every(x=>x.cls.startsWith("2-"))&&g2.readlog.length>0,"2학년 담당 독서 기록도 2학년만");
const p3=T["글"].find(r=>r["반"].startsWith("3-")&&r["상태"]==="posted"),p2=T["글"].find(r=>r["반"].startsWith("2-")&&r["상태"]==="posted");
must(call("g2@x","takedown",{id:p3.id}).ERR,"2학년 담당이 3학년 글 못 내림");
const before=call("s"+p2["학번"]+"@x","state").progress.total;call("g2@x","takedown",{id:p2.id,memo:"확인"});
must(call("s"+p2["학번"]+"@x","state").progress.total===before-1,"글 내리면 그 도장도 빠짐");
const sub=call("sub@x","state");must((sub.posts||[]).length===0&&(sub.readlog||[]).length===0,"교사는 학생 기록을 안 봄");
must(!call("sub@x","teacherBook",{subj:"과학",t:"새로운 과학책",a:"추천 지은이",q:"좋아요"}).ERR,"교사 추천 도서 넣기");
{const bk=call("s1101@x","state").books.filter(b=>b.t==="새로운 과학책")[0];
 must(bk&&/과학쌤 선생님/.test(bk.rec)&&bk.s==="과학","학생 서가에 ‘과학쌤 선생님 추천’ 과 분야가 보임("+(bk&&bk.rec)+" · "+(bk&&bk.s)+")");}
/* 관리자: 인쇄·모두 확인 */
const ad=call("lib@x","state");must(ad.printable.length>0,"인쇄할 라벨 "+ad.printable.length+"장");
call("lib@x","markPrinted",{ids:ad.printable.slice(0,12).map(x=>x.id)});must(T["글"].filter(r=>r["인쇄"]==="Y").length===12,"인쇄 표시 12장");
call("g1@x","ackAll");must(T["글"].filter(r=>r["반"].startsWith("1-")&&r["상태"]==="posted").every(r=>r["확인"]==="Y"),"1학년 담당 모두 확인");
/* 상품권: 10월 대상 → 11월 배부 기간에 도서부가 체크 */
NOW=new Date("2026-11-03T03:00:00Z");
const G=call("lib@x","state").gifts.rows["2026-11-02"]||[],elig=G.filter(x=>x.vouchers>0);
must(elig.length>=30,"11월 수령 상품권 대상 "+elig.length+"명 · "+elig.reduce((a,x)=>a+x.vouchers,0)+"매");
must(STU.slice(400,430).every(hb=>{const x=G.find(y=>y.hakbun===hb);return x&&x.vouchers===Math.min(2,Math.floor(x.stars/2))&&x.vouchers>=1;}),"매일 쓴 30명 모두 대상(별 "+STU.slice(400,430).map(hb=>(G.find(y=>y.hakbun===hb)||{}).stars).join(",")+")");
must(G.every(x=>x.vouchers<=2&&x.vouchers===Math.min(2,Math.floor(x.stars/2))),"매수 = 별÷2(최대 2매)");
const dk=call("s2301@x","state").giftDesk;must(dk&&dk.open&&dk.rows.length===elig.length,"도서부 배부 화면에 대상 "+(dk&&dk.rows.length)+"명");
must(!call("s2301@x","clubMark",{ids:[elig[0].hakbun],on:true}).ERR,"도서부 지급 확인");
must(call("s2302@x","clubMark",{ids:[elig[1].hakbun],on:true}).ERR,"도서부 아닌 학생은 못 함");
must(call("lib@x","state").gifts.rows["2026-11-02"].find(x=>x.hakbun===elig[0].hakbun).paid,"관리자 화면에 배부 완료");
must(call("s"+elig[0].hakbun+"@x","state").stars.shown===0,"받은 학생의 별이 사라짐");
const gs=call("s"+elig[0].hakbun+"@x","state");must(gs.giftNotice&&gs.giftNotice.mine.paid,"받은 학생 공지에 '수령했어요'");
/* 속도: 글이 쌓인 뒤 화면 계산 */
let t=Date.now();for(let i=0;i<50;i++)C().api("state",{});
EMAIL="s1101@x";t=Date.now();for(let i=0;i<50;i++)C().api("state",{});const sMs=(Date.now()-t)/50;
EMAIL="lib@x";t=Date.now();for(let i=0;i<10;i++)C().api("state",{});const aMs=(Date.now()-t)/10;
console.log("화면 계산(글 "+T["글"].length+"편): 학생 "+sMs.toFixed(1)+"ms · 관리자 "+aMs.toFixed(1)+"ms");
must(sMs<300&&aMs<1500,"화면 계산 시간 적당");
const bad=Object.keys(errs).filter(k=>!/하루에|같은 책으로|이미 눌렀|내 글에는|이미 투표|이미 뽑은|표를 다 썼|이미 풀었|투표할 수 없는|글을 찾을 수|도서부만|관리자\(사서/.test(k));
must(!bad.length,"예상 밖 오류 없음"+(bad.length?": "+bad.slice(0,5).join(" | "):""));
console.log("거절된 요청(정상 규칙):",JSON.stringify(Object.fromEntries(Object.entries(errs).filter(([k])=>!bad.includes(k)).map(([k,v])=>[k.split(":")[1].slice(0,20),v]))));
/* 이달의 한 줄 포스터·명예의 전당(학급만) */
NOW=new Date("2026-11-03T03:00:00Z");
const adm=call("lib@x","state"),Ls=adm.monthly.labels["2026-10"]||[],Rs=adm.monthly.reviews["2026-10"]||[];
must(Ls.length>=12&&Ls.every((l,i)=>i===0||Ls[i-1].likes>=l.likes),"10월 포스터 후보 "+Ls.length+"편, 읽고 싶어요 순");
must(Rs.length>0,"10월 우수 독후감 후보 "+Rs.length+"편");
must(!call("lib@x","honor",{id:Rs[0].id,mon:"2026-10"}).ERR,"명예의 전당에 올리기");
must(call("g2@x","honor",{id:Rs[0].id}).ERR,"관리자만 올릴 수 있음");
const hs=call("s1101@x","state").hall;
must(hs.length===1&&hs[0].mon==="2026-10"&&hs[0].list[0].id===Rs[0].id,"학생 게시판에 명예의 전당");
must(!("name" in hs[0].list[0])&&!("hakbun" in hs[0].list[0])&&hs[0].list[0].cls,"명예의 전당은 학급만(이름·학번 없음)");
/* 2026-09-20: 소개글도 '이달의 한 줄'로 시상해 명예의 전당에 올린다 */
must(!call("lib@x","honor",{id:Ls[0].id,mon:"2026-10"}).ERR,"소개글(라벨)도 이달의 한 줄로 시상");
const hs2=call("s1101@x","state").hall,lb=[].concat.apply([],hs2.map(g=>g.list)).filter(x=>x.kind==="label");
must(lb.length===1&&lb[0].id===Ls[0].id&&!("name" in lb[0])&&lb[0].cls,"이달의 한 줄도 학급만 보인다");
