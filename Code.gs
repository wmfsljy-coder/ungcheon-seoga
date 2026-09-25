/* 웅천 서가 — 구글 시트 연결부.
   로그인은 구글 계정입니다. 웹 앱은 반드시
     실행: 나(배포한 사람) / 액세스: [학교 도메인] 내 모든 사용자
   로 배포해야 접속한 사람의 이메일을 읽을 수 있습니다.
   처음 한 번: 편집기에서 setup 함수를 실행(또는 시트 메뉴 [웅천 서가 > 처음 설정]). */

var SHEET_ID="1VXcAbIQPTyUC1eIDFvVh5ZWLYLyatSeTEUH_a-IeBYg";
function ss_(){
  var a=null;try{a=SpreadsheetApp.getActiveSpreadsheet();}catch(e){}
  return a||SpreadsheetApp.openById(SHEET_ID);
}
/* 알림 창(alert)은 누가 '확인'을 누를 때까지 실행을 붙잡으므로 쓰지 않는다.
   실행 기록(로그)에 남기고, 시트가 열려 있으면 오른쪽 아래에 잠깐 띄운다 */
function say_(msg){
  console.log(msg);
  try{var a=SpreadsheetApp.getActiveSpreadsheet();if(a)a.toast(String(msg).slice(0,380),"웅천 서가",20);}catch(e){}
}

function onOpen(){
  /* 시트에 딸린 스크립트가 아니어도 뜨도록 onOpen 시계를 걸어 두는데,
     딸린 경우에는 둘 다 불려 메뉴가 두 벌 생긴다. 20초 안의 두 번째는 건너뛴다 */
  try{var c=CacheService.getUserCache();if(c.get("menu"))return;c.put("menu","1",20);}catch(e){}
  SpreadsheetApp.getUi().createMenu("웅천 서가")
    .addItem("지금 백업하기 (사본 만들기)","backupNow")
    .addItem("처음 설정 (시트 만들기)","setup")
    .addItem("지난달 상품권 메일 지금 보내기","giftMailNow")
    .addItem("독서로 소장·대출 지금 확인","libDaily")
    .addItem("이번 달 추천 도서 다시 뽑기","rotateNow")
    .addItem("이번 주 북퀴즈 빈자리 채우기","quizNow")
    .addItem("시트 고친 것 지금 반영","refreshNow")
    .addItem("시트 쓰는 법 다시 쓰기 (안내 탭)","sheetDocNow")
    .addItem("독서로 연결 시험","libTest")
    .addToUi();
}

/* 배포할 때마다 tools/deploy.py 가 바꾸는 판 표시. 새 판이 처음 열리면 뒷정리(firstRun)를 한 번 예약한다 */
var CODE_VERSION="20260925-120909";
/* tools/.testkey 의 열쇠인지 (해시만 코드에 둔다) */
function keyOk_(v){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(v),Utilities.Charset.UTF_8)
    .map(function(b){return ("0"+((b+256)%256).toString(16)).slice(-2);}).join("")===TEST_KEY_HASH;
}
function doGet(e){
  try{
    var props=PropertiesService.getScriptProperties();
    /* 새 판이 처음 열리면 10분 제한 없이 바로 뒷정리를 예약(판마다 한 번) */
    if(props.getProperty("codeVer")!==CODE_VERSION&&props.getProperty("kickVer")!==CODE_VERSION){props.setProperty("kickVer",CODE_VERSION);props.deleteProperty("kickAt");kick_();}
  }catch(x){}
  /* 올린 판으로 시트를 바로 갈아 준다(시계가 돌기를 1~2분 기다리지 않게).
     tools/deploy.py 가 올린 직후 한 번 부른다 */
  if(e&&e.parameter&&e.parameter.migrate){
    var m={};
    if(!keyOk_(e.parameter.migrate))m={error:"열쇠가 맞지 않습니다."};
    else{
      var t0=Date.now();
      try{installTrigger_();}catch(x){m.시계=x.message;}
      try{applySheetUi_();}catch(x){m.시트모양=x.message;}
      try{Core.make(makeDb_(),makeEnv_()).maintain();}catch(x){m.정리=x.message;}
      try{tidySheets_();}catch(x){}   /* 옮기고 비운 옛 탭을 그 자리에서 정리 */
      try{PropertiesService.getScriptProperties().setProperty("codeVer",CODE_VERSION);}catch(x){}
      m.codeVer=CODE_VERSION;m.ms=Date.now()-t0;
    }
    return ContentService.createTextOutput(JSON.stringify(m)).setMimeType(ContentService.MimeType.JSON);
  }
  /* 사본(백업) 만들기. 드라이브 권한이 승인됐는지도 여기서 드러난다 */
  if(e&&e.parameter&&e.parameter.backup){
    var b={};
    if(!keyOk_(e.parameter.backup))b={error:"열쇠가 맞지 않습니다."};
    else{
      try{b.name=backupMonthly_(true);b.where=backupFolderUrl_();}catch(x){b.error=String(x&&x.message||x);}
      /* 드라이브 권한이 실제로 왔는지, 지금 어느 계정으로 도는지 확인용 */
      try{DriveApp.getRootFolder().getName();b.drive="ok";}catch(x2){b.drive=String(x2&&x2.message||x2).slice(0,120);}
      try{b.asUser=Session.getEffectiveUser().getEmail();}catch(x3){b.asUser="(알 수 없음)";}
      /* 폴더에 실제로 무엇이 들어 있는지 */
      try{
        var db9=makeDb_(),want9="";
        db9.rows("설정").forEach(function(r){if(String(r["항목"]).trim()==="백업폴더")want9=String(r["값"]);});
        var fd=backupFolder_(want9),fi=fd.getFiles(),names=[];
        while(fi.hasNext()&&names.length<30)names.push(fi.next().getName());
        names.sort();b.folder=fd.getName();b.files=names;
      }catch(x4){b.files=String(x4&&x4.message||x4).slice(0,120);}
      if(BACKUP_ERR)b.copyErr=BACKUP_ERR;
      if(e.parameter.keep){try{
        var dbK=makeDb_(),wantK="";
        dbK.rows("설정").forEach(function(r){if(String(r["항목"]).trim()==="백업폴더")wantK=String(r["값"]);});
        tidyBackups_(backupFolder_(wantK),ss_().getId(),Number(e.parameter.keep));
      }catch(x6){b.keepErr=String(x6&&x6.message||x6).slice(0,120);}}
      /* 지금 토큰에 실제로 어떤 권한이 붙어 있는지(승인 화면에서 무엇이 빠졌는지 바로 보인다) */
      try{
        var ti=UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?access_token="+encodeURIComponent(ScriptApp.getOAuthToken()),{muteHttpExceptions:true});
        var js=JSON.parse(ti.getContentText()||"{}");
        b.scopes=String(js.scope||"").split(" ").map(function(x){return x.replace("https://www.googleapis.com/auth/","");}).sort();
      }catch(x5){b.scopes=String(x5&&x5.message||x5).slice(0,100);}
    }
    return ContentService.createTextOutput(JSON.stringify(b)).setMimeType(ContentService.MimeType.JSON);
  }
  /* 한눈에 보기 자료만 뽑아 보기(읽기만, 열쇠 필요) */
  if(e&&e.parameter&&e.parameter.overview){
    var ov={};
    if(!keyOk_(e.parameter.overview))ov={error:"열쇠가 맞지 않습니다."};
    else{try{
      var core1=Core.make(makeDb_(),makeEnv_());
      ov=core1.overview({role:"admin",kind:"admin",grade:"",name:"점검"},Number(e.parameter.weeks)||8,Number(e.parameter.days)||14);
    }catch(x){ov={error:String(x&&x.message||x)};}}
    return ContentService.createTextOutput(JSON.stringify(ov)).setMimeType(ContentService.MimeType.JSON);
  }
  /* 실제 데이터 점검(읽기만). tools/.testkey 의 열쇠가 있어야 열린다 */
  if(e&&e.parameter&&e.parameter.selftest){
    var res;
    if(!keyOk_(e.parameter.selftest))res={error:"열쇠가 맞지 않습니다."};
    else{try{var db0=makeDb_(),env0=makeEnv_(),s0=Date.now();Core.make(db0,env0).api;var core0=Core.make(db0,env0);var tl=Date.now();res=core0.selfTest(200000);res.timing.loadMs=tl-s0;}catch(x){res={error:String(x&&x.stack||x)};}}
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  }
  if(e&&e.parameter&&e.parameter.status){
    var st={};
    try{st=Core.make(makeDb_(),makeEnv_()).status();}catch(x){st={error:String(x&&x.message||x)};}
    st.code=CODE_VERSION;st.codeVer=PropertiesService.getScriptProperties().getProperty("codeVer")||"";
    var trg=ScriptApp.getProjectTriggers();
    st.firstRunPending=trg.some(function(t){return t.getHandlerFunction()==="firstRun";});
    st.triggers=trg.map(function(t){return t.getHandlerFunction();}).sort().join(",");
    try{st.sheets=SpreadsheetApp.getActive().getSheets().map(function(sh){return sh.getName()+":"+sh.getLastRow();});}catch(x){}
    return ContentService.createTextOutput(JSON.stringify(st)).setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("웅천 서가")
    .addMetaTag("viewport","width=device-width, initial-scale=1");
}

/* 화면에서 부르는 단 하나의 입구 */
/* 오래 걸리는 작업(독서로 확인·추천 도서 뽑기·퀴즈 채우기)은 한 번에 하나만.
   스크립트 잠금은 학생 제출에도 쓰이므로 잠깐만 잡고 '작업 중' 표시(10분 유효)를 남긴다 */
function job_(fn){
  var lock=LockService.getScriptLock(),props=PropertiesService.getScriptProperties(),now=Date.now();
  lock.waitLock(20000);
  try{
    var busy=Number(props.getProperty("jobAt")||0);
    if(busy&&now-busy<10*60*1000)throw new Error("다른 독서로 확인이 진행 중입니다. 1~3분 뒤 다시 해 주세요.");
    props.setProperty("jobAt",String(now));
  }finally{lock.releaseLock();}
  try{return fn();}finally{props.deleteProperty("jobAt");}
}
/* 새 판을 붙여넣은 뒤 처음 열리면: 새 방식 추천 도서 뽑기를 곧바로 한 번 예약한다(다음 7·15·0시를 기다리지 않게) */
function kick_(){
  var props=PropertiesService.getScriptProperties(),at=Number(props.getProperty("kickAt")||0);
  if(Date.now()-at<10*60*1000)return;
  if(ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==="firstRun";}))return;
  props.setProperty("kickAt",String(Date.now()));
  ScriptApp.newTrigger("firstRun").timeBased().after(5000).create();
}
function api(name,json){
  var p={};try{p=JSON.parse(json||"{}");}catch(e){}
  var want=!!p._state&&name!=="state";delete p._state;
  /* 독서로 전체 확인은 20~40초 걸려서, 그동안 학생 제출을 막지 않도록 잠그지 않는다 */
  var write=["state","libRefresh","libSearch","rotate","catalogNow"].indexOf(name)<0;
  var lock=write?LockService.getScriptLock():null,db=null,env=null,out,err=null;
  try{
    if(lock)lock.waitLock(20000);
    db=makeDb_();env=makeEnv_();
    var run=function(){return Core.make(db,env).api(name,p);};
    out=["libRefresh","rotate","quizAuto","catalogNow"].indexOf(name)>=0?job_(run):run();
  }catch(e){err=String(e&&e.message||e);}
  finally{if(lock)try{lock.releaseLock();}catch(e){}}
  if(err)return JSON.stringify({error:err});
  if(out==null)out={ok:true};
  var st=name==="state"?out:null;
  if(want){try{st=Core.make(db,env).api("state",{_t:p._t,as:p._as});out={r:out,state:st};}catch(e){}}
  if(st&&st.conf&&st.conf.upToDate===false)try{kick_();}catch(e){}
  return JSON.stringify(out);
}

/* 캐시 키는 250자 제한이 있어 해시로 */
function key_(k){
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,k,Utilities.Charset.UTF_8));
}
function makeEnv_(){
  var props=PropertiesService.getScriptProperties(),key=props.getProperty("SECRET");
  if(!key){key=Utilities.getUuid()+Utilities.getUuid();props.setProperty("SECRET",key);}
  return {
    now:function(){return new Date();},
    /* 독서로 요청은 4분 30초까지만(Apps Script 한 번 실행은 6분이 한도) */
    deadline:Date.now()+270000,
    email:function(){return Session.getActiveUser().getEmail();},
    mail:function(to,subject,body){MailApp.sendEmail({to:to,subject:subject,body:body,name:"웅천 서가"});},
    appUrl:function(){try{return ScriptApp.getService().getUrl();}catch(e){return "";}},
    mailQuota:function(){try{return MailApp.getRemainingDailyQuota();}catch(e){return -1;}},
    cacheGet:function(k){return CacheService.getScriptCache().get(key_(k));},
    cachePut:function(k,v,sec){CacheService.getScriptCache().put(key_(k),v,sec||600);},
    /* 요청 묶음을 한 번에 보낸다. [{url,method,body}] → [{code,text}] */
    http:function(reqs){
      var rs=UrlFetchApp.fetchAll(reqs.map(function(q){
        var o={url:q.url,method:q.method||"get",muteHttpExceptions:true,headers:{"Accept":"application/json"}};
        /* 한글 검색어가 깨지지 않게 UTF-8 바이트로 보낸다 */
        if(q.body){o.contentType="application/json; charset=utf-8";o.payload=Utilities.newBlob(JSON.stringify(q.body)).getBytes();}
        return o;}));
      return rs.map(function(r){return {code:r.getResponseCode(),text:r.getContentText("UTF-8")};});
    },
    uid:function(){return Utilities.getUuid().replace(/-/g,"").slice(0,10);},
    hmac:function(s){
      return Utilities.computeHmacSha256Signature(s,key).map(function(b){
        return ("0"+((b+256)%256).toString(16)).slice(-2);}).join("");
    }
  };
}

/* 시트 한 장 = 표 하나. 한 번 읽은 표는 요청이 끝날 때까지 다시 읽지 않고,
   요청 사이에는 CacheService 에 보관한다(시트마다 판 번호: 앱이 쓰거나 사람이 시트를 고치면 판이 올라가 다시 읽음) */
var DB_CHUNK=25000;
/* 사람이 손으로 고치는 탭은 짧게(시계가 놓쳐도 곧 따라오도록), 앱이 혼자 쓰는 큰 탭만 길게 */
var TTL_HAND=["설정","교사","명단","공지","도서","권장도서","주제","이벤트","수령기간","건의","도장","글","문장"];
function dbTtl_(t){return TTL_HAND.indexOf(t)>=0?300:21600;}
function bumpSheet_(t){PropertiesService.getScriptProperties().setProperty("sv|"+t,String(Date.now())+String(Math.floor(Math.random()*1000)));}
function makeDb_(){
  var ssObj=null,cache={},PR=PropertiesService.getScriptProperties(),CS=null,ver=null;
  function ssx(){return ssObj||(ssObj=ss_());}
  function cs(){if(!CS)try{CS=CacheService.getScriptCache();}catch(e){CS=false;}return CS||null;}
  function vers(){if(!ver){ver={};try{var all=PR.getProperties();Object.keys(all).forEach(function(k){if(k.indexOf("sv|")===0)ver[k.slice(3)]=all[k];});}catch(e){}}return ver;}
  function ckey(t){return "db|"+key_(t)+"|"+(vers()[t]||"0");}
  function fromCache(t){
    var C=cs();if(!C)return null;
    try{
      var k=ckey(t),meta=C.get(k);if(!meta)return null;
      var n=Number(meta),keys=[];for(var i=0;i<n;i++)keys.push(k+"|"+i);
      var parts=C.getAll(keys),s="";
      for(var j=0;j<n;j++){if(parts[keys[j]]==null)return null;s+=parts[keys[j]];}
      var o=JSON.parse(s),h=o.h;
      return {sh:null,head:h,rows:o.r.map(function(a){var r={_row:a[0]};for(var x=0;x<h.length;x++)r[h[x]]=a[x+1]==null?"":a[x+1];return r;})};
    }catch(e){return null;}
  }
  function toCache(t,T){
    var C=cs();if(!C)return;
    try{
      var s=JSON.stringify({h:T.head,r:T.rows.map(function(r){return [r._row].concat(T.head.map(function(h){return r[h];}));})});
      var k=ckey(t),n=Math.max(1,Math.ceil(s.length/DB_CHUNK)),m={};
      if(n>60)return;
      m[k]=String(n);for(var i=0;i<n;i++)m[k+"|"+i]=s.slice(i*DB_CHUNK,(i+1)*DB_CHUNK);
      C.putAll(m,dbTtl_(t));
    }catch(e){}
  }
  /* 앱이 쓴 뒤: 판을 올리고 지금 내용을 새 판으로 보관 */
  function wrote(t){
    try{var v=String(Date.now())+String(Math.floor(Math.random()*1000));PR.setProperty("sv|"+t,v);vers()[t]=v;toCache(t,cache[t]);}catch(e){}
  }
  function sheetOf(t,T){if(!T.sh)T.sh=ssx().getSheetByName(t);return T.sh;}
  function load(t){
    if(cache[t])return cache[t];
    var hit=fromCache(t);if(hit)return cache[t]=hit;
    var ss=ssx(),sh=ss.getSheetByName(t);
    /* 새 판에서 늘어난 시트는 그 자리에서 만든다(setup 을 다시 안 돌려도 앱이 멈추지 않게) */
    if(!sh&&Core.HEAD[t]){
      sh=ss.insertSheet(t);var h0=Core.HEAD[t];
      sh.getRange(1,1,sh.getMaxRows(),h0.length).setNumberFormat("@");
      sh.getRange(1,1,1,h0.length).setValues([h0]).setFontWeight("bold").setBackground("#F0E9D9");sh.setFrozenRows(1);
    }
    if(!sh)throw new Error("'"+t+"' 시트가 없습니다. Apps Script 편집기에서 setup 함수를 먼저 실행하세요.");
    /* 줄이 모자라기 전에 미리 늘리고 글자 서식으로 맞춘다(서식이 없으면 "3-2"·날짜 글자가 날짜 값으로 바뀐다) */
    if(sh.getMaxRows()-sh.getLastRow()<30){
      var m0=sh.getMaxRows();sh.insertRowsAfter(m0,500);
      sh.getRange(m0+1,1,500,Math.max(sh.getMaxColumns(),1)).setNumberFormat("@");
    }
    var v=sh.getDataRange().getValues(),head=v[0].map(String),rows=[];
    /* 새 판에서 늘어난 열은 제목 줄 끝에 자동으로 붙인다(기존 시트를 그대로 쓰도록) */
    var miss=(Core.HEAD[t]||[]).filter(function(h){return head.indexOf(h)<0;});
    if(miss.length){
      sh.getRange(1,head.length+1,sh.getMaxRows(),miss.length).setNumberFormat("@");
      sh.getRange(1,head.length+1,1,miss.length).setValues([miss]).setFontWeight("bold").setBackground("#F0E9D9");
      head=head.concat(miss);
    }
    for(var i=1;i<v.length;i++){
      var o={_row:i+1},any=false;
      for(var j=0;j<head.length;j++){o[head[j]]=cell_(v[i][j],head[j]);if(o[head[j]]!=="")any=true;}
      if(any)rows.push(o);
    }
    cache[t]={sh:sh,head:head,rows:rows};
    toCache(t,cache[t]);
    return cache[t];
  }
  return {
    rows:function(t){return load(t).rows;},
    add:function(t,obj){
      var T=load(t),sh=sheetOf(t,T);
      if(sh.getMaxRows()-sh.getLastRow()<5){var m0=sh.getMaxRows();sh.insertRowsAfter(m0,500);sh.getRange(m0+1,1,500,Math.max(T.head.length,1)).setNumberFormat("@");}
      sh.appendRow(T.head.map(function(h){return safe_(obj[h]);}));
      var o={_row:sh.getLastRow()};T.head.forEach(function(h){o[h]=obj[h]==null?"":String(obj[h]);});
      T.rows.push(o);wrote(t);
    },
    /* 여러 줄을 한 번에 붙인다(한 줄씩 appendRow 하면 수백 줄에 몇십 초) */
    addMany:function(t,list){
      if(!list.length)return;
      var T=load(t),sh=sheetOf(t,T),start=sh.getLastRow()+1,vals=list.map(function(o){return T.head.map(function(h){return safe_(o[h]);});});
      if(sh.getMaxRows()<start+vals.length){var m0=sh.getMaxRows();sh.insertRowsAfter(m0,vals.length+200);sh.getRange(m0+1,1,vals.length+200,T.head.length).setNumberFormat("@");}
      sh.getRange(start,1,vals.length,T.head.length).setValues(vals);
      list.forEach(function(o,i){var r={_row:start+i};T.head.forEach(function(h){r[h]=o[h]==null?"":String(o[h]);});T.rows.push(r);});
      wrote(t);
    },
    replace:function(t,list){
      var T=load(t),sh=sheetOf(t,T),last=sh.getLastRow();
      if(last>=2)sh.getRange(2,1,last-1,Math.max(sh.getLastColumn(),T.head.length)).clearContent();
      var vals=list.map(function(o){return T.head.map(function(h){return safe_(o[h]);});});
      if(vals.length){
        if(sh.getMaxRows()<vals.length+1)sh.insertRowsAfter(sh.getMaxRows(),vals.length+50);
        sh.getRange(2,1,vals.length,T.head.length).setValues(vals);
      }
      T.rows=list.map(function(o,i){var r={_row:i+2};T.head.forEach(function(h){r[h]=o[h]==null?"":String(o[h]);});return r;});
      wrote(t);
    },
    set:function(t,keyCol,keyVal,patch){
      var T=load(t),any=false;
      T.rows.forEach(function(r){
        if(String(r[keyCol]).trim()!==String(keyVal))return;
        Object.keys(patch).forEach(function(k){
          var c=T.head.indexOf(k);if(c<0)return;
          sheetOf(t,T).getRange(r._row,c+1).setValue(safe_(patch[k]));r[k]=String(patch[k]);any=true;
        });
      });
      if(any)wrote(t);
    },
    /* 여러 줄의 몇 칸을 한꺼번에: 바뀌는 열마다 한 번씩만 쓴다. map = {키값:{열:값}} */
    setMany:function(t,keyCol,map){
      var T=load(t),cols={};
      T.rows.forEach(function(r){
        var p=map[String(r[keyCol]).trim()];if(!p)return;
        Object.keys(p).forEach(function(k){if(T.head.indexOf(k)>=0){r[k]=p[k]==null?"":String(p[k]);cols[k]=true;}});
      });
      if(!Object.keys(cols).length)return;
      var sh=sheetOf(t,T),last=sh.getLastRow();if(last<2)return;
      Object.keys(cols).forEach(function(k){
        var c=T.head.indexOf(k)+1,vals=[],byRow={};
        T.rows.forEach(function(r){byRow[r._row]=r;});
        var cur=sh.getRange(2,c,last-1,1).getValues();
        for(var i=0;i<last-1;i++){var r=byRow[i+2];vals.push([r?safe_(r[k]):cur[i][0]]);}
        sh.getRange(2,c,last-1,1).setValues(vals);
      });
      wrote(t);
    },
    setConf:function(k,v){
      var T=load("설정"),sh=sheetOf("설정",T),hit=T.rows.filter(function(r){return String(r["항목"]).trim()===k;})[0];
      /* 설정 값은 글자로 쓴다("2026-09" 를 시트가 날짜로 바꾸지 않게) */
      if(hit){if(String(hit["값"])===String(v))return;sh.getRange(hit._row,2).setNumberFormat("@").setValue(String(v));hit["값"]=v;}
      else{sh.appendRow([k,v]);sh.getRange(sh.getLastRow(),2).setNumberFormat("@").setValue(String(v));var o={_row:sh.getLastRow(),"항목":k,"값":v};T.head.forEach(function(h){if(o[h]==null)o[h]="";});T.rows.push(o);}
      wrote("설정");
    }
  };
}
/* "3-2" 를 시트가 날짜로 바꿔 버린 경우까지 되돌린다 */
function cell_(v,h){
  if(v instanceof Date){
    var f=(h==="반"||h==="담당")?"M-d":(h==="주"||h==="시작"||h==="끝")?"yyyy-MM-dd":h==="월"?"yyyy-MM":"yyyy-MM-dd HH:mm:ss";
    return Utilities.formatDate(v,"Asia/Seoul",f);
  }
  return v==null?"":String(v);
}
/* 학생 글이 = 로 시작해도 수식으로 돌지 않게 */
function safe_(v){
  var s=v==null?"":String(v);
  return /^[=+\-@]/.test(s)?" "+s:s;
}

function setup(){
  var ss=ss_(),made=[];
  Object.keys(Core.HEAD).forEach(function(t){
    var sh=ss.getSheetByName(t);
    if(!sh){sh=ss.insertSheet(t);made.push(t);}
    var head=Core.HEAD[t];
    if(sh.getLastRow()===0){
      sh.getRange(1,1,sh.getMaxRows(),head.length).setNumberFormat("@");
      sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight("bold").setBackground("#F0E9D9");
      sh.setFrozenRows(1);
    }
  });
  var conf=ss.getSheetByName("설정");
  if(conf.getLastRow()<2)conf.getRange(2,1,Core.CONF0.length,2).setValues(Core.CONF0);
  /* 이미 있던 설정 시트에도 새 항목과 설명 칸을 채운다(아래 tick 의 maintain 이 한 번 더 확인) */
  Core.make(makeDb_(),makeEnv_()).maintain();
  conf.setColumnWidth(1,120);conf.setColumnWidth(2,200);conf.setColumnWidth(3,520);
  var books=ss.getSheetByName("도서");
  if(false){   /* 예전 '상시 추천 도서' 목록은 더 이상 깔지 않는다(서가는 이번 달 추천 도서만) */
    var rows=Core.seedBooks().map(function(b){return Core.HEAD["도서"].map(function(h){return b[h];});});
    books.getRange(2,1,rows.length,rows[0].length).setValues(rows);
  }
  var qs=ss.getSheetByName("문장");
  if(qs.getLastRow()<2){
    var qrows=Core.seedQuotes().map(function(q){return Core.HEAD["문장"].map(function(h){return q[h];});});
    qs.getRange(2,1,qrows.length,qrows[0].length).setValues(qrows);
    qs.setColumnWidth(1,560);qs.setColumnWidth(2,260);
  }
  var tch=ss.getSheetByName("교사"),msg="";
  if(tch.getLastRow()<2){
    var me=Session.getEffectiveUser().getEmail();
    tch.getRange(2,1,1,3).setValues([[me,"담당교사","전체"]]);
    msg="\n\n교사 시트에 "+me+" 를 담당 교사(전체 권한)로 넣었습니다. 이름은 시트에서 바꾸세요.\n담임은 이메일·이름·담당(3-2 형식)을 한 줄씩 추가합니다.";
    var dom=me.split("@")[1];
    if(dom&&dom!=="gmail.com"){
      var rows=conf.getDataRange().getValues();
      for(var r=1;r<rows.length;r++)if(rows[r][0]==="허용도메인"&&!rows[r][1])conf.getRange(r+1,2).setValue("@"+dom);
    }
  }
  makeEnv_();
  var trig=installTrigger_();
  /* 독서로 일(추천 도서 뽑기·대출 확인)은 시간이 걸려 setup 에서 기다리지 않고 30초 뒤 따로 돌린다 */
  ScriptApp.getProjectTriggers().forEach(function(t){if(t.getHandlerFunction()==="firstRun")ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger("firstRun").timeBased().after(30*1000).create();
  var lib="\n독서로 확인과 이번 달 추천 도서 뽑기는 30초 뒤 따로 시작해 1~3분 걸립니다. 끝나면 '설정' 탭 '도서확인' 칸에 시각이 찍힙니다(Apps Script 왼쪽 '실행' 메뉴에서 firstRun 기록도 볼 수 있음).";
  say_("설정을 마쳤습니다."+lib+(trig?"\n매일 7시·15시·0시에 독서로 소장·대출을 확인하고, 매달 1일에 이번 달 추천 도서를 새로 뽑습니다.":"")+(made.length?"\n만든 시트: "+made.join(", "):"")+msg+
    "\n\n다음: 명단 시트에 학번·이름·반(3-2 형식)을 붙여넣고(이메일 칸은 비워 두면 학생이 처음 들어올 때 스스로 등록), "+
    "[배포 > 새 배포 > 웹 앱]에서 실행: 나 / 액세스: 학교 도메인 내 모든 사용자 로 배포하세요.");
}

/* 하루 세 번(7시·15시·0시) 도는 일(setup 이 시계를 걸어 둔다).
   달이 바뀌었으면 이번 달 추천 도서를 새로 뽑고, 서가 책의 소장·대출 상태를 새로 받는다 */
/* setup 이 30초 뒤로 걸어 둔 첫 독서로 작업(한 번 돌고 자기 시계는 지운다) */
function firstRun(){
  ScriptApp.getProjectTriggers().forEach(function(t){if(t.getHandlerFunction()==="firstRun")ScriptApp.deleteTrigger(t);});
  /* setup 을 따로 돌리지 않아도 되게: 하루 세 번 시계를 확인하고, 새 설정·시트를 채운 뒤 독서로 확인 */
  try{installTrigger_();}catch(e){console.log("시계: "+e.message);}
  try{applySheetUi_();}catch(e){console.log("시트 모양: "+e.message);}
  try{Core.make(makeDb_(),makeEnv_()).maintain();}catch(e){console.log("정리: "+e.message);}
  /* 시트 갈이가 끝난 시점에 새 판으로 적는다. 독서로 확인(20~40초)은 그 뒤에 이어서 */
  PropertiesService.getScriptProperties().setProperty("codeVer",CODE_VERSION);
  libDaily();
}
/* 매월 1일 7시 이후 첫 확인 때 한 번: 지난달 상품권 대상 명단을 담당·담임 선생님께 메일로 */
/* 수령 기간 첫날 7시 이후 첫 확인 때 한 번: 대상 명단을 관리자·학년 담당 선생님께 */
function giftMailIfDue_(){
  var hour=Number(new Date(Date.now()+9*3600000).toISOString().slice(11,13));
  if(hour<7)return 0;
  var core=Core.make(makeDb_(),makeEnv_()),key=core.giftMailKey();if(!key)return 0;
  var props=PropertiesService.getScriptProperties();
  if(props.getProperty("giftMailed")===key)return 0;
  var n=sendGiftMail_();
  props.setProperty("giftMailed",key);
  return n;
}
function sendGiftMail_(){
  var list=Core.make(makeDb_(),makeEnv_()).giftMail(),n=0;
  list.forEach(function(m){try{MailApp.sendEmail(m.to,m.subject,m.body);n++;}catch(e){console.log("메일 실패 "+m.to+": "+e.message);}});
  return n;
}
function giftMailNow(){say_("오늘 시작하는 수령 기간 상품권 메일을 "+sendGiftMail_()+"통 보냈습니다.");}
/* 독서로가 구글 서버에서 되는지 직접 확인한다. 편집기에서 libTest 를 골라 실행하고 아래 '실행 로그'를 보세요 */
function libTest(){
  var core=Core.make(makeDb_(),makeEnv_()),p=core.libProbe();
  console.log("① 분류 조회: "+(p.ok?"정상 — 소설 "+p.count+"권":"실패 — "+p.why));
  var rs=makeEnv_().http([{url:"https://read365.edunet.net/alpasq/api/search",method:"post",
    body:{searchKeyword:"아몬드",page:1,display:5,neisCode:["S100000673"],provCode:"S10",schoolName:"웅천고등학교",coverYn:"N"}}]);
  console.log("② 제목 조회(아몬드): 코드 "+rs[0].code+" · "+rs[0].text.slice(0,200));
  say_(p.ok?"독서로 연결 정상":"독서로 연결 실패: "+p.why);
}
/* 달마다 한 번(그달 마지막 날) 시트 사본을 드라이브 '웅천 서가 백업' 폴더에 남긴다 */
/* 백업: 설정 '백업주기'가 '주'면 한 주에 한 번(그 주 첫 확인 때), '월'이면 그달 마지막 날 */
function backupMonthly_(force){
  var db=makeDb_(),conf={};
  db.rows("설정").forEach(function(r){conf[String(r["항목"]).trim()]=String(r["값"]);});
  var now=new Date(),tz="Asia/Seoul";
  var mon=Utilities.formatDate(now,tz,"yyyy-MM");
  var last=Utilities.formatDate(new Date(now.getFullYear(),now.getMonth()+1,0),tz,"yyyy-MM-dd");
  var today=Utilities.formatDate(now,tz,"yyyy-MM-dd");
  var cyc=String(conf["백업주기"]||"주")==="월"?"월":"주";
  /* 그 주 월요일 */
  var k9=new Date(now.getTime()+9*3600000),dow=(k9.getUTCDay()+6)%7;
  var wk=Utilities.formatDate(new Date(now.getTime()-dow*86400000),tz,"yyyy-MM-dd");
  var key=cyc==="주"?wk:mon;
  if(!force){
    if(cyc==="월"&&today!==last)return "";          /* 달마다면 그달 마지막 날에만 */
    if(String(conf["백업월"]||"")===key)return "";   /* 이번 주(달)에 이미 했으면 그만 */
  }
  var ss=ss_(),name=(conf["프로그램명"]||"웅천 서가")+" 백업 "+(force?Utilities.formatDate(now,tz,"yyyy-MM-dd HHmm"):key);
  /* ① 드라이브 권한이 있으면 '웅천 서가 백업' 폴더 안에 사본을 둔다.
     ② 권한이 아직이면 스프레드시트 기능만으로 사본을 만든다(내 드라이브 맨 위에 생김).
        둘 다 같은 사본이고, 권한을 한 번 승인하면 그때부터 폴더로 들어간다. */
  var url="",where="",folder=null;
  try{folder=backupFolder_(conf["백업폴더"]);}catch(e0){BACKUP_ERR="폴더: "+e0.message;}
  /* ① 폴더 안에 구글 시트 사본 그대로(드라이브 전체 권한이 있을 때) */
  if(folder)try{
    var copy=DriveApp.getFileById(ss.getId()).makeCopy(name,folder);
    url=copy.getUrl();where=folder.getName()+" 폴더";
    try{tidyBackups_(folder,ss.getId(),conf["백업보관"]);}catch(e2){console.log("사본 모으기: "+e2.message);}
  }catch(e){BACKUP_ERR=String(e&&e.message||e).slice(0,200);}
  /* ② 사본을 못 만들면 엑셀 파일로 내려받아 폴더에 넣는다(읽기 권한만 있어도 됨) */
  if(!url&&folder)try{
    var f2=backupExport_(folder,name);
    url=f2.getUrl();where=folder.getName()+" 폴더(엑셀)";
  }catch(e3){BACKUP_ERR=(BACKUP_ERR?BACKUP_ERR+" / ":"")+"엑셀: "+String(e3&&e3.message||e3).slice(0,120);}
  /* ③ 그래도 안 되면 내 드라이브에 시트 사본 */
  if(!url){
    var cp=SpreadsheetApp.openById(ss.getId()).copy(name);
    url=cp.getUrl();where="내 드라이브(폴더에 못 넣음)";
  }
  db.setConf("백업월",key);
  db.setConf("백업",Utilities.formatDate(now,tz,"yyyy-MM-dd HH:mm")+" · "+name+" · "+where+" · "+url+
    (where.indexOf("폴더에 못")>=0?" · 드라이브 ‘모든 파일 보기·수정’ 권한을 허용하면 백업폴더로 들어갑니다":""));
  return name;
}
var BACKUP_ERR="";
/* 시트를 엑셀로 내려받아 폴더에 넣는다(makeCopy 권한이 없을 때 쓰는 길) */
function backupExport_(folder,name){
  var id=ss_().getId();
  var url="https://www.googleapis.com/drive/v3/files/"+id+"/export?mimeType="+
    encodeURIComponent("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  var res=UrlFetchApp.fetch(url,{headers:{Authorization:"Bearer "+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  if(res.getResponseCode()!==200)throw new Error("내보내기 "+res.getResponseCode());
  return folder.createFile(res.getBlob().setName(name+".xlsx"));
}
/* 백업을 넣을 폴더: 설정 '백업폴더'(드라이브 주소나 ID) → 이름으로 찾기 → 새로 만들기 */
function backupFolder_(want){
  var id=String(want||"").trim();
  var m=/[-\w]{25,}/.exec(id);       /* 드라이브 주소에서 폴더 ID만 뽑는다 */
  if(m){try{return DriveApp.getFolderById(m[0]);}catch(e){console.log("백업폴더 ID 로 열지 못했습니다: "+e.message);}}
  var it=DriveApp.getFoldersByName("웅천 서가 백업");
  return it.hasNext()?it.next():DriveApp.createFolder("웅천 서가 백업");
}
/* 권한이 없던 동안 내 드라이브에 흩어져 만들어진 사본을 폴더로 모으고, 오래된 것은 정리한다 */
function tidyBackups_(folder,selfId,keep){
  var moved=0,names=[];
  var it=DriveApp.searchFiles('title contains "백업" and trashed = false');
  while(it.hasNext()&&moved<50){
    var f=it.next();
    if(f.getId()===selfId)continue;
    if(f.getName().indexOf("백업")<0)continue;
    var inFolder=false,ps=f.getParents();
    while(ps.hasNext()){if(ps.next().getId()===folder.getId()){inFolder=true;break;}}
    if(inFolder)continue;
    try{f.moveTo(folder);moved++;names.push(f.getName());}catch(e){}
  }
  if(moved)console.log("백업 사본 "+moved+"개를 폴더로 옮겼습니다: "+names.join(", "));
  /* 정한 개수가 넘으면 오래된 것부터 버린다(휴지통으로 — 30일 안에는 되살릴 수 있다) */
  var n=Number(keep)>0?Number(keep):12;
  var all=[],fi=folder.getFiles();
  while(fi.hasNext())all.push(fi.next());
  all.sort(function(x,y){return x.getDateCreated()<y.getDateCreated()?1:-1;});
  var gone=0;
  all.slice(n).forEach(function(f){try{f.setTrashed(true);gone++;}catch(e){}});
  if(gone)console.log("오래된 백업 "+gone+"개를 휴지통으로 보냈습니다(남긴 것 "+Math.min(n,all.length)+"개).");
  return moved;
}
/* 백업 폴더 주소(없으면 만든다) */
function backupFolderUrl_(){
  try{
    var db=makeDb_(),want="";
    db.rows("설정").forEach(function(r){if(String(r["항목"]).trim()==="백업폴더")want=String(r["값"]);});
    return backupFolder_(want).getUrl();
  }catch(e){return "";}
}
/* 메뉴·편집기에서 바로 눌러 만드는 백업(권한 확인도 이때 함께 물어봅니다) */
function backupNow(){
  var n=backupMonthly_(true);
  say_(n?("사본을 만들었습니다: "+n+" · 드라이브 ‘웅천 서가 백업’ 폴더"):"백업을 만들지 못했습니다.");
}
function libDaily(){
  try{var bk=backupMonthly_();if(bk)say_("달마다 백업: 드라이브 ‘웅천 서가 백업’ 폴더에 "+bk+" 을(를) 만들었습니다.");}catch(e){console.log("백업: "+e.message);}
  var sent=0;try{sent=giftMailIfDue_();}catch(e){console.log("상품권 메일: "+e.message);}
  if(sent)console.log("지난달 상품권 메일 "+sent+"통을 보냈습니다.");
  var r;
  try{r=job_(function(){return Core.make(makeDb_(),makeEnv_()).tick();});}
  catch(e){console.log("건너뜀: "+e.message);return;}
  if(r.down){say_("독서로 확인을 건너뛰었습니다: "+r.why+" (북퀴즈 채우기는 했습니다). 다음 정해진 시각에 다시 시도합니다.");return;}
  var msg="독서로 확인: "+r.lib.checked+"권 중 "+r.lib.found+"권 소장"+(r.lib.failed?", 조회 실패 "+r.lib.failed+"권":"");
  if(r.rotate&&!r.rotate.skipped)msg+="\n"+r.rotate.month+" 이번 달 추천 도서 "+(r.rotate.picked||0)+"권을 새로 뽑았습니다.";
  if(r.quiz&&r.quiz.added)msg+="\n이번 주 북퀴즈 "+r.quiz.added+"문제를 채웠습니다(학생 문제 "+r.quiz.student+", 자동 "+r.quiz.auto+").";
  say_(msg);
}
function quizNow(){
  var r=job_(function(){return Core.make(makeDb_(),makeEnv_()).ensureWeeklyQuiz();});
  say_(r.added?"이번 주 북퀴즈 "+r.added+"문제를 채웠습니다(학생 문제 "+r.student+", 자동 "+r.auto+").":"이번 주 북퀴즈는 이미 다 찼습니다.");
}
function rotateNow(){
  var r=job_(function(){return Core.make(makeDb_(),makeEnv_()).rotateMonth(true);});
  say_(r.picked?"이번 달 추천 도서 "+r.picked+"권을 새로 뽑았습니다.":"새로 뽑지 못했습니다. 독서로 응답을 확인해 주세요.");
}
var HOURS_=[7,15,0];
function onSheetEdit(e){try{bumpSheet_(e.range.getSheet().getName());}catch(x){}}
function onSheetChange(e){try{Object.keys(Core.HEAD).forEach(bumpSheet_);}catch(x){}}
function installEditTriggers_(){
  var have={};ScriptApp.getProjectTriggers().forEach(function(t){have[t.getHandlerFunction()]=true;});
  if(!have.onSheetEdit)ScriptApp.newTrigger("onSheetEdit").forSpreadsheet(SHEET_ID).onEdit().create();
  if(!have.onSheetChange)ScriptApp.newTrigger("onSheetChange").forSpreadsheet(SHEET_ID).onChange().create();
  if(!have.onOpen)ScriptApp.newTrigger("onOpen").forSpreadsheet(SHEET_ID).onOpen().create();
}
/* 시트 모양 정리: 교사 '담당' 칸 드롭다운(관리자·1학년·2학년·3학년·교사), 명단 '도서부' 칸 드롭다운(Y).
   예전 값 '전체'는 '관리자'로, '3-2' 같은 반은 '3학년'으로 바꿔 둔다 */
/* 시트 정리: 선생님이 볼 탭만 앞에 차례대로, 앱이 혼자 쓰는 탭은 숨김 */
var SHEET_ORDER=["안내","설정","명단","교사","도서","권장도서","주제","이벤트","글","도장","퀴즈","수령기간","수령대상","지급","공지","건의","문장","장서목록"];
/* 더 이상 쓰지 않는 탭(옛 메일 인증, 문장을 따로 두던 채집)은 숨겨만 둔다 — 지우지는 않는다 */
var SHEET_HIDE=["기기","반응","퀴즈응답"];
/* 판이 바뀌며 더 쓰지 않게 된 탭: 줄이 거의 없으면 지우고, 자료가 있으면 숨기기만 한다 */
var SHEET_DEAD=["인증","채집","공감","투표"];
function tidySheets_(){
  var ss=ss_();
  SHEET_ORDER.forEach(function(n,i){
    var sh=ss.getSheetByName(n);if(!sh)return;
    try{ss.setActiveSheet(sh);ss.moveActiveSheet(i+1);}catch(x){}
    try{if(sh.isSheetHidden())sh.showSheet();}catch(x){}
  });
  SHEET_HIDE.forEach(function(n){
    var sh=ss.getSheetByName(n);if(!sh)return;
    try{if(!sh.isSheetHidden())sh.hideSheet();}catch(x){}
  });
  SHEET_DEAD.forEach(function(n){
    var sh=ss.getSheetByName(n);if(!sh)return;
    try{
      if(sh.getLastRow()<=2&&ss.getSheets().length>1){ss.deleteSheet(sh);console.log("안 쓰는 탭 정리: "+n);}
      else if(!sh.isSheetHidden())sh.hideSheet();
    }catch(x){}
  });
  try{ss.setActiveSheet(ss.getSheetByName("설정")||ss.getSheets()[0]);}catch(x){}
}
/* 시트 쓰는 법을 '안내' 탭과 머리줄 메모에 적어 둔다(판이 바뀌면 다시 씀) */
function writeSheetDoc_(force){
  var ss=ss_(),D=Core.SHEET_DOC||{},order=SHEET_ORDER.concat(Object.keys(D)).filter(function(v,i,a){return a.indexOf(v)===i&&D[v];});
  /* 설명이 그대로고 안내 탭도 멀쩡하면 다시 쓰지 않는다(판만 올린 배포에서 20초 넘게 걸리던 일) */
  var props=PropertiesService.getScriptProperties(),key="";
  try{
    key=Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,JSON.stringify(D)+"|"+order.join(","),Utilities.Charset.UTF_8)
      .map(function(b){return ("0"+((b+256)%256).toString(16)).slice(-2);}).join("");
    var old=ss.getSheetByName("안내");
    if(!force&&key&&props.getProperty("docHash")===key&&old&&old.getLastRow()>5)return 0;
  }catch(e){}
  /* ① 머리줄 메모: 칸 이름 위에 마우스를 올리면 뜻과 예시가 보인다 */
  order.forEach(function(name){
    var sh=ss.getSheetByName(name);if(!sh||sh.getLastColumn()<1)return;
    var head=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
    var notes=head.map(function(h){
      var c=D[name].c[h];
      return c?(h+"\n"+c[0]+(c[1]?"\n예) "+c[1]:"")):"";
    });
    try{sh.getRange(1,1,1,head.length).setNotes([notes]);}catch(e){}
  });
  /* ② 안내 탭: 표 하나로 모아 보기 */
  var sh=ss.getSheetByName("안내")||ss.insertSheet("안내",0);
  sh.clear();
  var rows=[["탭","무엇을 담는 곳","칸","뜻","예시"]];
  order.forEach(function(name){
    var d=D[name],cols=Core.HEAD[name]||Object.keys(d.c);
    rows.push([name,d.d+" ("+d.edit+")","","",""]);
    cols.forEach(function(h){
      var c=d.c[h];if(!c)return;
      rows.push(["",""," "+h,c[0],c[1]||""]);
    });
  });
  sh.getRange(1,1,rows.length,5).setValues(rows);
  sh.getRange(1,1,1,5).setFontWeight("bold").setBackground("#F0E9D9");
  sh.setFrozenRows(1);
  sh.setColumnWidth(1,90);sh.setColumnWidth(2,420);sh.setColumnWidth(3,120);sh.setColumnWidth(4,420);sh.setColumnWidth(5,260);
  /* 탭 이름 줄은 굵게 */
  for(var i=2;i<=rows.length;i++){
    if(rows[i-1][0]){
      sh.getRange(i,1,1,5).setFontWeight("bold").setBackground("#FBF6EA");
    }
  }
  sh.getRange(1,1,rows.length,5).setVerticalAlignment("top").setWrap(true);
  try{if(key)props.setProperty("docHash",key);}catch(e){}
  return rows.length;
}
/* 시트에서 고친 내용을 앱이 바로 읽게 한다(시계가 놓쳤을 때를 위한 손잡이) */
function refreshNow(){
  Object.keys(Core.HEAD).forEach(bumpSheet_);
  try{Core.make(makeDb_(),makeEnv_()).maintain();}catch(e){console.log("정리: "+e.message);}
  say_("시트에서 고친 내용을 앱에 반영했습니다. 화면을 새로 고치면 바로 보입니다.");
}
function sheetDocNow(){var n=writeSheetDoc_(true);say_("‘안내’ 탭에 시트 쓰는 법 "+n+"줄을 적었습니다. 칸 이름 위에 마우스를 올려도 설명이 뜹니다.");}
function applySheetUi_(){
  try{writeSheetDoc_();}catch(x){console.log("안내 탭: "+x.message);}
  try{tidySheets_();}catch(x){}
  var ss=ss_(),t=ss.getSheetByName("교사");
  if(t&&t.getLastRow()>=1){
    var h=t.getRange(1,1,1,t.getLastColumn()).getValues()[0].map(String),c=h.indexOf("담당")+1;
    if(c>0){
      var n=Math.max(t.getMaxRows()-1,1),rg=t.getRange(2,c,n,1);
      rg.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["관리자","1학년","2학년","3학년","교사"],true).setAllowInvalid(false)
        .setHelpText("관리자 = 모든 권한(사서) / n학년 = 그 학년 담당(담임) / 교사 = 추천 도서·선생님 라벨").build());
      if(t.getLastRow()>=2){
        var r2=t.getRange(2,c,t.getLastRow()-1,1),v=r2.getValues(),ch=false;
        v.forEach(function(x){var s=String(x[0]).trim(),m;if(s==="전체"){x[0]="관리자";ch=true;}else if((m=/^(\d)(-\d+)?$/.exec(s))){x[0]=m[1]+"학년";ch=true;}});
        if(ch){r2.setValues(v);bumpSheet_("교사");}
      }
    }
  }
  var rv=ss.getSheetByName("수령기간");
  if(rv){
    var nr=Math.max(rv.getMaxRows()-1,1);
    rv.getRange(2,1,nr,2).setNumberFormat("yyyy-mm-dd").setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false)
      .setHelpText("날짜를 고르세요(두 번 누르면 달력). 이 기간 시작 전까지 모은 별로 상품권을 받고, 기간이 끝나면 안 받은 별은 사라집니다.").build());
    rv.setColumnWidth(1,110);rv.setColumnWidth(2,110);rv.setColumnWidth(3,240);
  }
  var rt=ss.getSheetByName("수령대상");
  if(rt){rt.getRange(1,1).setNote("앱이 자동으로 채우는 보기용 표입니다(하루 세 번, 배부 완료를 누를 때마다). 손으로 고쳐도 다음 정리 때 덮어씁니다. 배부 표시는 앱의 ‘배부 확인’·‘상품권’ 탭에서.");}
  var s=ss.getSheetByName("명단");
  if(s&&s.getLastRow()>=1){
    var hs=s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(String),cs=hs.indexOf("도서부")+1;
    if(cs>0)s.getRange(2,cs,Math.max(s.getMaxRows()-1,1),1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["Y"],true).setAllowInvalid(true).build());
  }
}
/* 명단 한 번 넣기: tools 에서 비밀 열쇠로 보낸다(열쇠 해시만 코드에 있고, 한 번 쓰면 끝) */
var IMPORT_KEY_HASH="";
var TEST_KEY_HASH="86b6d2c71c238bcd50e184593afe99e94cbf7135e38fdea3958e8c62cdf55079";
function doPost(e){
  var out={};
  try{
    var p=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties();
    var h=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(p.key||""),Utilities.Charset.UTF_8).map(function(b){return ("0"+((b+256)%256).toString(16)).slice(-2);}).join("");
    if(!IMPORT_KEY_HASH||h!==IMPORT_KEY_HASH||props.getProperty("importUsed|"+h))throw new Error("열쇠가 맞지 않습니다.");
    var lock=LockService.getScriptLock();lock.waitLock(30000);
    try{
      var db=makeDb_(),have={},add=[],upd={};
      db.rows("명단").forEach(function(r){have[String(r["학번"]).trim()]=r;});
      (p.rows||[]).forEach(function(x){
        var hb=String(x[0]).trim(),nm=String(x[1]).trim(),cls=String(x[2]).trim();
        if(!/^\d{4}$/.test(hb)||!nm)return;
        var r=have[hb];
        if(!r)add.push({"학번":hb,"이름":nm,"반":cls,"이메일":"","동의":"","도서부":""});
        else if(String(r["이름"]).trim()!==nm||String(r["반"]).trim()!==cls)upd[hb]={"이름":nm,"반":cls};
      });
      if(add.length)db.addMany("명단",add);
      if(Object.keys(upd).length)db.setMany("명단","학번",upd);
      props.setProperty("importUsed|"+h,String(Date.now()));
      out={ok:true,added:add.length,updated:Object.keys(upd).length,total:db.rows("명단").length};
    }finally{lock.releaseLock();}
    try{applySheetUi_();}catch(x){}
  }catch(err){out={error:String(err&&err.message||err)};}
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function installTrigger_(){
  try{installEditTriggers_();}catch(e){console.log("편집 감지: "+e.message);}
  var mine=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==="libDaily";});
  if(mine.length===HOURS_.length)return false;
  mine.forEach(function(t){ScriptApp.deleteTrigger(t);});
  HOURS_.forEach(function(h){ScriptApp.newTrigger("libDaily").timeBased().everyDays(1).atHour(h).inTimezone("Asia/Seoul").create();});
  return true;
}

function nextRound(){
  var db=makeDb_();
  var cur=db.rows("설정").filter(function(r){return r["항목"]==="차수";})[0];
  var n=(Number(cur&&cur["값"])||1)+1;
  try{
    var ui=SpreadsheetApp.getUi();
    if(ui.alert(n+"차를 시작할까요?","학생 낙엽판이 0칸에서 다시 시작합니다. 지난 글과 게시판은 그대로 남습니다.",ui.ButtonSet.OK_CANCEL)!==ui.Button.OK)return;
  }catch(e){}
  db.setConf("차수",String(n));
  say_(n+"차를 시작했습니다.");
}
