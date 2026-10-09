/* 상품권 배부·수령 확인, 도서부 명단, 선생님 문장·건의함(2026-09-28 회장님 지시)
   - 도서부 '배부 확인'에는 대상자가 늘 보이고, 배부 단추(clubMark)는 수령 기간에만
   - 수령 기간 7일 전부터 대상 학생에게 안내, 도서부가 배부를 누르면 학생 화면에 확인 창 → '확인'
   - 배부·수령 확인은 수령대상 시트에 같이 남는다
   - 선생님도 라벨·문장 둘 다, 선생님도 건의함 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-09-20T03:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"",uid:()=>"u"+Math.random().toString(36).slice(2,8),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};
const db={replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
db.setConf("금요수령판","1");db.setConf("상품권당별","2");   /* 이 시험은 옛 규칙(별 2개 = 1매, 달마다 수령)으로 잰다 — 금요일 규칙은 gift_friday.js */
const C=()=>Core.make(db,env);C().maintain();
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
db.setConf("상품권공개","Y");
T["수령기간"]=[{"시작":"2026-10-05","끝":"2026-10-08","메모":"10월 수령"}];

T["교사"].push({"이름":"사서","담당":"관리자"},{"이름":"과학","담당":"교사"});
const kids=[["3103","가온","Y"],["3101","두리",""],["3102","세인",""],["3104","네온",""]];
kids.forEach(([h,n,club])=>T["명단"].push({"학번":h,"이름":n,"반":"3-1","동의":"y","도서부":club}));
const tok={};
kids.forEach(([h,n],i)=>{tok[h]=C().api("login",{role:"student",hakbun:h,name:n,agree:true,newPin:"41820"+i}).token;});
["사서","과학"].forEach((n,i)=>{tok[n]=C().api("login",{role:"teacher",name:n,newPin:"71390"+i}).token;});
const as=(who,op,p)=>{try{return C().api(op,Object.assign({_t:tok[who]},p||{}));}catch(x){return {ERR:x.message};}};
/* 별 4개(도장 20개) 3101, 별 2개 3102, 별 0개 3104 — 선생님 도장(만능)으로 채운다 */
function stamps(hb,n){for(let i=0;i<n;i++)T["도장"].push({"id":"d"+hb+i,"시각":"2026-09-0"+(1+i%9)+" 10:"+String(i).padStart(2,"0")+":00","주":"2026-08-31","학번":hb,"이름":"","반":"3-1","사유":"선생님 도장","교사":"과학","취소":""});}
stamps("3101",20);stamps("3102",10);

/* ── 기간 한참 전: 명단은 보이되 배부 단추는 없다 ── */
let dk=as("3103","state").giftDesk;
must(dk&&!dk.none&&dk.state==="soon"&&!dk.open,"기간 전에도 도서부 배부 확인에 다음 기간(예정)이 보인다");
must(dk.rows.map(r=>r.hakbun).join()==="3101,3102","대상자 명단이 학번 순(별 2개 이상만): "+dk.rows.map(r=>r.hakbun).join());
must(/배부 기간이 아닙니다/.test(as("3103","clubMark",{ids:["3101"],on:true}).ERR||""),"기간 밖에는 배부 표시를 못 한다");
must(!as("3101","state").giftNotice,"수령 기간 7일 전보다 이르면 학생 안내는 아직 없다");

/* ── 7일 전: 대상 학생에게 안내 ── */
NOW=new Date("2026-09-28T03:00:00Z");
const gn=as("3101","state").giftNotice;
must(gn&&!gn.open&&gn.mine.vouchers===2&&gn.from==="2026-10-05","7일 전부터 대상 학생에게 수령 안내(2매)");
must(/점심/.test(gn.place)&&/도서관/.test(gn.place),"안내에 장소(도서관 · 점심시간)가 함께 간다");
const gn4=as("3104","state").giftNotice;
must(!gn4||!gn4.mine.vouchers,"대상이 아닌 학생에게는 받을 매수가 없다");

/* ── 기간 중: 도서부가 배부 → 학생 확인 창 → 확인 ── */
NOW=new Date("2026-10-06T03:30:00Z");
dk=as("3103","state").giftDesk;
must(dk.open&&dk.rows.length===2,"기간 중에는 배부 단추가 열린다");
must(!(as("3101","state").giftAck||[]).length,"배부 전에는 확인 창이 없다");
must(!as("3103","clubMark",{ids:["3101"],on:true}).ERR,"도서부가 3101 배부");
const ack=as("3101","state").giftAck||[];
must(ack.length===1&&ack[0].n===2&&/도서부/.test(ack[0].who),"배부되면 학생 화면에 확인 창(2매 · 누가 배부)");
let rs=T["수령대상"].find(r=>r["학번"]==="3101");
must(rs&&rs["배부"]==="배부 완료"&&rs["수령확인"]==="확인 전","시트: 배부 완료 · 수령확인 '확인 전'");
must(as("3101","giftAck",{from:"2026-10-05"}).n===1,"학생이 확인을 누른다");
must(!(as("3101","state").giftAck||[]).length,"확인하면 창이 다시 뜨지 않는다");
rs=T["수령대상"].find(r=>r["학번"]==="3101");
must(rs["수령확인"]==="확인"&&rs["확인시각"].slice(0,10)==="2026-10-06","시트: 수령확인 '확인'과 확인 시각");
must(T["지급"].find(r=>r["학번"]==="3101")["수령확인"]==="확인","지급 시트에도 수령 확인");
dk=as("3103","state").giftDesk;
must(dk.rows.find(r=>r.hakbun==="3101").ack===true,"도서부 화면에 '수령 확인 ✓'");
const g=as("사서","state").gifts.rows["2026-10-05"].find(r=>r.hakbun==="3101");
must(g&&g.paid&&g.ack,"관리자 상품권 표에도 수령 확인");
must(as("3102","giftAck",{}).n===0,"배부받지 않은 학생의 확인은 아무것도 바꾸지 않는다");
must(as("사서","giftAck",{}).ERR,"확인은 학생만");
/* 잘못 눌러 되돌리면 확인도 지워지고, 다시 배부하면 다시 확인 */
as("3103","clubMark",{ids:["3101"],on:false});
must(T["지급"].find(r=>r["학번"]==="3101")["수령확인"]==="","배부를 되돌리면 수령 확인도 지운다");
as("3103","clubMark",{ids:["3101"],on:true});
must((as("3101","state").giftAck||[]).length===1,"다시 배부하면 학생이 다시 확인");

/* ── 기간이 끝난 뒤: 명단은 남고 단추는 닫힌다 ── */
NOW=new Date("2026-10-12T03:00:00Z");
dk=as("3103","state").giftDesk;
must(dk&&!dk.open&&dk.rows.length>=1,"기간이 끝나도 명단은 보인다");
must((as("3101","state").giftAck||[]).length===1,"기간이 끝나도 확인하지 않은 배부는 확인 창이 남는다");

/* ── 선생님: 라벨·문장 둘 다 ── */
must(!as("과학","staffLabel",{kind:"quote",title:"아몬드",author:"손원평",text:"사람은 누구나 자기만의 속도로 자란다고 믿고 싶었다.",page:"52쪽"}).ERR,"선생님이 문장을 올린다");
must(!as("과학","staffLabel",{title:"아몬드",author:"손원평",text:"감정을 모르는 아이가 친구를 만나 조금씩 달라진다. 첫 장만 읽어도 멈출 수 없다."}).ERR,"선생님이 라벨을 올린다");
must(/글자 수/.test(as("과학","staffLabel",{kind:"quote",title:"책",text:"짧다"}).ERR||""),"문장도 글자 수를 지킨다");
const tq=T["글"].find(r=>r["종류"]==="quote"&&r["반"]==="선생님");
must(tq&&tq["쪽수"]==="52쪽"&&tq["상태"]==="posted","선생님 문장이 게시판에 올라간다(쪽수 함께)");
const my=as("과학","state").myLabels||[];
must(my.some(x=>x.kind==="quote")&&my.some(x=>x.kind==="label"),"내가 쓴 글에 라벨·문장 둘 다");
must((as("3101","state").board||[]).some(x=>x.kind==="quote"&&/과학 선생님/.test(x.by)),"학생 게시판에 선생님 문장이 보인다");

/* ── 선생님 건의함 ── */
must(!as("과학","ideaAdd",{text:"청소년 과학 교양서를 더 들여 주세요."}).ERR,"선생님이 건의를 보낸다");
const ti=T["건의"].find(r=>r["이름"]==="과학");
must(ti&&ti["반"]==="선생님"&&ti["학번"]==="","건의 시트: 반 '선생님'");
must((as("과학","state").ideas||[]).length===1,"선생님 건의함에 내 건의가 보인다");
must(!as("3101","ideaAdd",{text:"만화책도 더 들여 주세요."}).ERR&&(as("3101","state").ideas||[]).length===1,"학생 건의는 학생 것만 보인다");
const all=as("사서","state").ideas||[];
must(all.length===2&&all.some(x=>x.cls==="선생님"),"관리자는 학생·선생님 건의를 모두 본다");
as("사서","ideaReply",{id:ti["id"],text:"다음 달 구입 목록에 넣겠습니다."});
must((as("과학","state").ideas||[])[0].reply,"관리자 답이 선생님 건의함에 보인다");

/* ── 북퀴즈 2권 이내 · 투표 5표(2026-09-28) ── */
const cf=k=>(T["설정"].find(r=>r["항목"]===k)||{})["값"];
must(cf("퀴즈책수")==="2","설정: 북퀴즈는 2권 이내");
must(cf("주간투표")==="5"&&as("3101","state").voteL.per===5&&as("과학","state").voteL.per===5,"설정: 학생·선생님 모두 부문마다 한 주 5표");
db.setConf("퀴즈책수","3");C().maintain();
must(cf("퀴즈책수")==="3","관리자가 시트에서 다시 3으로 바꾸면 그대로 둔다");

/* ── 관리자도 배부 확인(2026-09-28) ── */
NOW=new Date("2026-10-07T03:00:00Z");
const adk=as("사서","state").giftDesk;
must(adk&&adk.open&&adk.rows.some(r=>r.hakbun==="3102"),"관리자 화면에도 배부 확인 명단");
must(!as("사서","clubMark",{ids:["3102"],on:true}).ERR,"관리자가 배부를 누른다");
must(/관리자 사서/.test(T["지급"].find(r=>r["학번"]==="3102")["처리자"]),"누가 배부했는지 '관리자 사서'로 남는다");
must(!!as("과학","clubMark",{ids:["3102"],on:false}).ERR,"교과 선생님은 배부를 누를 수 없다");
