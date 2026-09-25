/* 통째로 다시 쓰기 경합(2026-09-25 점검): 묵은 사본으로 정리하는 사이 들어온 로그인·PIN·문제를 지우지 않는다 */
const fs=require("fs");eval(fs.readFileSync(__dirname+"/../../core.gs","utf8")+";global.Core=Core;");
let NOW=new Date("2026-10-07T22:00:00Z");   /* 한국 아침 7시 */
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
const env={now:()=>NOW,email:()=>"",uid:()=>Math.random().toString(36).slice(2,10),hmac:s=>"h"+s,http:()=>{throw 1},mail:()=>{}};

/* 시트(진짜)와, 실행이 들고 있는 사본(묵을 수 있음)을 나눠 둔다 */
function makeWorld(){
  const SHEET={};Object.keys(Core.HEAD).forEach(t=>SHEET[t]=[]);
  const clone=t=>SHEET[t].map(r=>Object.assign({},r));
  let SNAP={};   /* 이 실행이 처음 읽은 사본 */
  const row=(t,o)=>{const r={};Core.HEAD[t].forEach(h=>r[h]=o[h]==null?"":String(o[h]));return r;};
  const db={
    rows:t=>{if(!SNAP[t])SNAP[t]=clone(t);return SNAP[t];},
    add:(t,o)=>{const r=row(t,o);SHEET[t].push(r);db.rows(t).push(Object.assign({},r));},
    addMany:(t,l)=>l.forEach(o=>db.add(t,o)),
    set:(t,k,v,p)=>{[SHEET[t],db.rows(t)].forEach(L=>L.forEach(r=>{if(String(r[k]).trim()===String(v))Object.keys(p).forEach(c=>r[c]=String(p[c]))}));},
    setMany:(t,k,m)=>{[SHEET[t],db.rows(t)].forEach(L=>L.forEach(r=>{const p=m[String(r[k])];if(p)Object.keys(p).forEach(c=>r[c]=String(p[c]))}));},
    setConf:(k,v)=>{const h=SHEET["설정"].find(r=>r["항목"]===k);if(h)h["값"]=v;else SHEET["설정"].push({"항목":k,"값":v});SNAP["설정"]=null;},
    replace:(t,l)=>{SHEET[t]=l.map(o=>row(t,o));SNAP[t]=clone(t);},
    /* 진짜 어댑터처럼: 잠근 채 시트에서 새로 읽어 거르고 다시 쓴다 */
    rewrite:(t,fn)=>{const out=fn(clone(t));if(out){SHEET[t]=out.map(o=>row(t,o));SNAP[t]=clone(t);}return !!out;},
    prune:(t,keep)=>{let n=0;db.rewrite(t,rows=>{const l=rows.filter(keep);n=rows.length-l.length;return n?l:null;});return n;}
  };
  return {SHEET,db,forget:()=>{SNAP={};}};
}

/* ── ① 아침 정리 중에 로그인한 기기가 살아남는다 ── */
{
  const W=makeWorld(),C=()=>Core.make(W.db,env);
  C().maintain();W.forget();
  W.SHEET["기기"].push({"토큰":"old","계정":"s:1101","만료":"2026-10-01","해제":""},   /* 만료된 것 */
                     {"토큰":"live","계정":"s:1102","만료":"2027-01-01","해제":""});
  W.db.setConf("정리일","2026-10-07");            /* 어제 정리함 */
  W.forget();
  W.db.rows("기기");                               /* 이 실행이 기기 사본을 먼저 읽어 둠 */
  W.SHEET["기기"].push({"토큰":"justnow","계정":"s:1103","만료":"2027-01-01","해제":""});   /* 그 사이 누가 로그인 */
  C().maintain();
  const toks=W.SHEET["기기"].map(r=>r["토큰"]);
  must(toks.indexOf("old")<0,"만료된 기기는 지운다");
  must(toks.indexOf("live")>=0,"살아 있는 기기는 남긴다");
  must(toks.indexOf("justnow")>=0,"정리하는 사이 새로 로그인한 기기가 지워지지 않는다");
}

/* ── ② 명단 정렬 중에 정한 PIN 이 살아남는다 ── */
{
  const W=makeWorld(),C=()=>Core.make(W.db,env);
  C().maintain();W.forget();
  W.SHEET["명단"].push({"학번":"1102","이름":"나","반":"1-1"},{"학번":"1101","이름":"가","반":"1-1"});   /* 학번순이 아님 */
  W.forget();
  W.db.rows("명단");                               /* 사본을 먼저 읽어 둠(핀 없음) */
  W.SHEET["명단"].find(r=>r["학번"]==="1101")["핀"]="h방금정한핀";   /* 그 사이 1101 이 PIN 을 정함 */
  C().maintain();
  must(W.SHEET["명단"].map(r=>r["학번"]).join()==="1101,1102","명단이 학번순으로 정리된다");
  must(W.SHEET["명단"].find(r=>r["학번"]==="1101")["핀"]==="h방금정한핀","정렬하는 사이 정한 PIN 이 지워지지 않는다");
}

/* ── ③ 미리 만든 문제를 정리하는 사이 학생이 낸 문제가 살아남는다 ── */
{
  const W=makeWorld(),C=()=>Core.make(W.db,env);
  C().maintain();W.db.setConf("이달","2026-10");W.forget();
  W.SHEET["퀴즈"].push({"id":"pre","상태":"예비","출처":"자동","월":"2026-11"});   /* 다음 달치 미리 만든 것 */
  W.forget();
  W.db.rows("퀴즈");
  W.SHEET["퀴즈"].push({"id":"stu","상태":"대기","출처":"학생","학번":"1101"});   /* 그 사이 학생이 문제를 냄 */
  C().ensureWeeklyQuiz();
  const ids=W.SHEET["퀴즈"].map(r=>r["id"]);
  must(ids.indexOf("pre")<0,"미리 만든 다음 달 문제는 지운다");
  must(ids.indexOf("stu")>=0,"정리하는 사이 학생이 낸 문제가 지워지지 않는다");
}
