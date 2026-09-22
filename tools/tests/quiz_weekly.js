/* 북퀴즈는 미리 내지 않는다(2026-09-22 회장님):
   그 달 추천 도서는 선생님 추천으로 계속 늘어나므로, 문제는 그 주에 와서 그때의 서가로 낸다.
   - 다음 달치 문제 은행을 미리 만들지 않는다
   - 시트에 남아 있던 '미리 만든 문제'는 지운다
   - 달 중간에 들어온 책도 문제 은행에 보충된다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T01:00:00Z");
const T={};Object.keys(Core.HEAD).forEach(t=>T[t]=[]);
const env={now:()=>NOW,email:()=>"lib@x",uid:()=>"u"+(env._n=(env._n||0)+1),hmac:s=>s,http:()=>{throw 1}};
const db={rows:t=>T[t],add:(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));T[t].push(r)},
  addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
  replace:(t,l)=>{T[t]=[];l.forEach(o=>db.add(t,o));},
  set:(t,k,v,p)=>T[t].forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setMany:(t,k,m)=>T[t].forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}),
  setConf:(k,v)=>{const h=T["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else T["설정"].push({"항목":k,"값":v})}};
const C=()=>Core.make(db,env);C().maintain();
db.setConf("이달","2026-10");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const wk=Core.weekKey(NOW,0);

/* 시트에 이미 들어 있던 것들을 흉내낸다 */
const q=(o)=>db.add("퀴즈",Object.assign({"id":"x"+(q._n=(q._n||0)+1),"문제":"문제"+(q._n),"출처":"자동","책제목":"책"+(q._n)},o));
q({"상태":"예비","월":"2026-10"});                 // 이번 달 은행 — 남아야 함
q({"상태":"예비","월":"2026-11"});                 // 다음 달치 미리 만든 것 — 지워야 함
q({"상태":"예비","월":"2026-12"});                 // 더 뒤 — 지워야 함
q({"상태":"출제","주":wk});                        // 이번 주 출제 — 남아야 함
q({"상태":"출제","주":"2026-10-19"});              // 관리자가 다음 주로 예약한 문제 — 남아야 함
q({"상태":"출제","주":"2026-09-28"});              // 지난 주 기록 — 남아야 함
q({"상태":"대기","월":"2026-11","출처":"학생","학번":"3101"});  // 학생이 낸 문제 — 건드리지 않음

const before=T["퀴즈"].length;
const dropped=C().dropPreMade();
must(dropped===2,"다음 달치로 미리 만든 문제 2건만 지웠다 (실제 "+dropped+")");
must(T["퀴즈"].length===before-2,"시트에서 실제로 빠졌다");
const has=(f)=>T["퀴즈"].some(f);
must(has(r=>r["상태"]==="예비"&&r["월"]==="2026-10"),"이번 달 은행은 남는다");
must(!has(r=>r["상태"]==="예비"&&r["월"]>"2026-10"),"다음 달치 은행은 사라졌다");
must(has(r=>r["상태"]==="출제"&&r["주"]===wk),"이번 주 출제 문제는 남는다");
must(has(r=>r["상태"]==="출제"&&r["주"]>wk),"관리자가 예약한 다음 주 문제는 지우지 않는다");
must(has(r=>r["상태"]==="출제"&&r["주"]==="2026-09-28"),"지난 주 기록은 남는다");
must(has(r=>r["상태"]==="대기"&&r["학번"]==="3101"),"학생이 낸 문제는 그대로 둔다");

/* 두 번 돌려도 더 지우지 않는다 */
must(C().dropPreMade()===0,"이미 정리된 뒤에는 아무것도 지우지 않는다");

/* maintain 도 정리한다 */
q({"상태":"예비","월":"2026-11"});
C().maintain();
must(!has(r=>r["상태"]==="예비"&&r["월"]==="2026-11"),"maintain 을 돌려도 미리 만든 문제가 정리된다");

/* prePickNext 는 문제 은행을 미리 만들지 않는다 */
must(/문제 은행은 미리 만들지 않는다/.test(fs.readFileSync(__dirname+"/../../core.gs","utf8")),
  "prePickNext 에서 다음 달 문제 은행 만들기를 뺐다");
