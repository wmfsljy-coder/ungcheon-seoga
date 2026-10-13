/* 캐시 속도 장치(2026-10-13 회장님 '반응속도 최대한'): 표 한 번에 미리 읽기(preload) · 잠근 쓰기의 캐시 바로 올리기(flush) · 미리 채우기(warm) */
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.resolve(__dirname,"../..");
function Sheet(name){this.name=name;this.cells=[];}
Sheet.prototype.getLastRow=function(){for(var r=this.cells.length;r>0;r--){if((this.cells[r-1]||[]).some(v=>v!==""&&v!=null))return r;}return 0;};
Sheet.prototype.getMaxRows=function(){return Math.max(1000,this.cells.length);};
Sheet.prototype.getLastColumn=function(){return this.cells.reduce((m,r)=>Math.max(m,(r||[]).length),0);};
Sheet.prototype.getRange=function(r,c,nr,nc){return new Range(this,r,c,nr||1,nc||1);};
let READS=0;Sheet.prototype.getDataRange=function(){READS++;return new Range(this,1,1,Math.max(1,this.getLastRow()),Math.max(1,this.getLastColumn()));};
Sheet.prototype.appendRow=function(v){this.cells[this.getLastRow()]=v.slice();return this;};
Sheet.prototype.insertRowsAfter=function(){};Sheet.prototype.getMaxColumns=function(){return 30;};Sheet.prototype.setFrozenRows=function(){};
function Range(sh,r,c,nr,nc){this.sh=sh;this.r=r;this.c=c;this.nr=nr;this.nc=nc;}
Range.prototype.getValues=function(){var o=[];for(var i=0;i<this.nr;i++){var row=[];for(var j=0;j<this.nc;j++){var v=(this.sh.cells[this.r-1+i]||[])[this.c-1+j];row.push(v==null?"":v);}o.push(row);}return o;};
Range.prototype.setValues=function(v){for(var i=0;i<this.nr;i++){this.sh.cells[this.r-1+i]=this.sh.cells[this.r-1+i]||[];for(var j=0;j<this.nc;j++)this.sh.cells[this.r-1+i][this.c-1+j]=v[i][j];}return this;};
Range.prototype.setValue=function(v){return this.setValues([[v]]);};
Range.prototype.clearContent=function(){for(var i=0;i<this.nr;i++){var row=this.sh.cells[this.r-1+i];if(row)for(var j=0;j<this.nc;j++)row[this.c-1+j]="";}return this;};
["setNumberFormat","setFontWeight","setBackground"].forEach(m=>Range.prototype[m]=function(){return this;});
const BOOK={};
const SS={getSheetByName:n=>BOOK[n]||null,insertSheet:n=>(BOOK[n]=new Sheet(n)),getSheets:()=>Object.values(BOOK)};
global.SpreadsheetApp={getActiveSpreadsheet:()=>SS,openById:()=>SS};
const props={};global.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>{props[k]=v;},getProperties:()=>Object.assign({},props),deleteProperty:k=>{delete props[k];}})};
let CALLS=0;const cache={};global.CacheService={getScriptCache:()=>({get:k=>{CALLS++;return cache[k]||null;},put:(k,v)=>{cache[k]=v;},remove:k=>{delete cache[k];},
  getAll:ks=>{CALLS++;const o={};ks.forEach(k=>{if(cache[k]!=null)o[k]=cache[k];});return o;},putAll:m=>{Object.assign(cache,m);}})};
global.Utilities={base64EncodeWebSafe:b=>Buffer.from(b.map(x=>x&255)).toString("base64url"),formatDate:d=>String(d),
  computeDigest:(a,s)=>Array.from(crypto.createHash("md5").update(s).digest()).map(b=>b>127?b-256:b),DigestAlgorithm:{MD5:1},Charset:{UTF_8:1}};
global.LockService={getScriptLock:()=>({waitLock(){},tryLock(){return true;},releaseLock(){}})};
(0,eval)(fs.readFileSync(path.join(root,"core.gs"),"utf8")+"\n"+fs.readFileSync(path.join(root,"Code.gs"),"utf8")+
  "\n;global.makeDb_=makeDb_;global.bumpSheet_=bumpSheet_;global.PRELOAD_=PRELOAD_;global.setLock=function(v){LOCK_HELD_=v;};global.dbTtl_=dbTtl_;global.recvMinute=recvMinute;");
const must=(c,m)=>{if(!c){console.log("✗",m);process.exitCode=1;}else console.log("✓",m);};
/* 시트 몇 장 */
PRELOAD_.forEach(t=>{const sh=SS.insertSheet(t);sh.cells[0]=Core.HEAD[t].slice();});
for(let i=0;i<30;i++)BOOK["반응"].cells.push(Core.HEAD["반응"].map((h,j)=>j===0?"r"+i:"값"+i));
BOOK["글"].cells.push(Core.HEAD["글"].map((h,j)=>j===0?"g1":"글값"));
const K0=Core.HEAD["반응"][0];   /* 반응 표의 첫 칸 */
/* 처음: 시트에서 읽어 캐시에 */
let db=makeDb_();PRELOAD_.forEach(t=>db.rows(t));
must(READS===PRELOAD_.length,"처음엔 시트에서 읽음("+READS+"장)");
/* 다음 요청: preload 한 번이면 캐시 두 번 부르고 시트는 안 읽음 */
READS=0;CALLS=0;db=makeDb_();db.preload(PRELOAD_);PRELOAD_.forEach(t=>db.rows(t));
must(READS===0,"preload 뒤 시트 읽기 0");
must(CALLS===2,"캐시는 두 번만 부름("+CALLS+") — 예전엔 표마다 두 번("+PRELOAD_.length*2+")");
must(db.rows("반응").length===30&&db.rows("글")[0]["id"]==="g1","내용 그대로");
/* 잠근 쓰기: 요청 끝(flush)에 새 판으로 캐시 → 다음 사람은 시트를 안 읽음 */
setLock(true);db.add("반응",{[K0]:"new1"});db.flush();setLock(false);
READS=0;db=makeDb_();db.preload(PRELOAD_);
must(db.rows("반응").length===31&&db.rows("반응").some(r=>r[K0]==="new1"),"방금 쓴 줄이 캐시에 있음");
must(READS===0,"쓴 뒤 다음 요청도 시트 읽기 0");
/* 내가 읽은 뒤 다른 실행이 판을 올렸으면 캐시에 안 올림(그쪽 변경을 덮지 않게) */
db=makeDb_();db.preload(PRELOAD_);db.rows("반응");
BOOK["반응"].cells.push(Core.HEAD["반응"].map((h,j)=>j===0?"other":"x"));bumpSheet_("반응");   /* 다른 실행(시계 작업)이 씀 */
setLock(true);db.add("반응",{[K0]:"mine"});db.flush();setLock(false);
READS=0;const db2=makeDb_();db2.preload(PRELOAD_);const ids=db2.rows("반응").map(r=>r[K0]);
must(READS===1&&ids.includes("other")&&ids.includes("mine"),"판이 엇갈리면 시트에서 새로 읽어 둘 다 보임");
/* 잠그지 않은 쓰기는 예전대로 판만 */
db=makeDb_();db.rows("글");db.add("글",{"id":"g2"});db.flush();
READS=0;db=makeDb_();must(db.rows("글").length===2&&READS===1,"잠그지 않은 쓰기는 캐시에 안 올림(다음에 시트에서)");
/* warm: 캐시가 비어도 시계가 미리 채움, 막 채운 것은 다시 안 읽음 */
Object.keys(cache).forEach(k=>delete cache[k]);
READS=0;const n1=makeDb_().warm(PRELOAD_);
must(n1===PRELOAD_.length&&READS===PRELOAD_.length,"비어 있으면 모두 시트에서 채움("+n1+")");
READS=0;const n2=makeDb_().warm(PRELOAD_);must(n2===0&&READS===0,"방금 채운 것은 건너뜀");
READS=0;db=makeDb_();db.preload(PRELOAD_);PRELOAD_.forEach(t=>db.rows(t));must(READS===0,"채운 뒤 첫 사람도 시트 읽기 0");
/* 수명의 60%가 지나면 다시 채움 */
const realNow=Date.now;Date.now=()=>realNow()+dbTtl_("글")*1000*0.7;
READS=0;const n3=makeDb_().warm(["글","설정","반응"]);Date.now=realNow;
must(n3===2,"수명 60% 지난 표(글·설정 30분)는 만료 전에 새로 채우고 6시간 표(반응)는 그대로");
/* 1분 시계에서 4분마다 */
props.warmAt="";Object.keys(cache).forEach(k=>delete cache[k]);READS=0;recvMinute();
must(READS>=PRELOAD_.length&&props.warmAt,"1분 시계가 캐시를 채움");
READS=0;recvMinute();must(READS===0,"4분 안에는 다시 안 함");
must(dbTtl_("설정")===1800&&dbTtl_("지급")===21600,"손 탭 30분·큰 탭 6시간");
/* 시트 고침: 칸 고침은 그 표만 판을 올리고 곧바로 캐시에, 모양 바뀜만 전부 */
(0,eval)("global.onSheetEdit=onSheetEdit;global.onSheetChange=onSheetChange;");
const before=Object.assign({},props);
onSheetChange({changeType:"EDIT"});
must(PRELOAD_.every(t=>props["sv|"+t]===before["sv|"+t]),"칸 고침(EDIT) 때 onSheetChange 는 판을 안 올림");
onSheetEdit({range:{getSheet:()=>({getName:()=>"설정"})}});
must(props["sv|설정"]!==before["sv|설정"]&&props["sv|글"]===before["sv|글"],"onSheetEdit 는 고친 표만 판을 올림");
READS=0;db=makeDb_();db.preload(PRELOAD_);db.rows("설정");must(READS===0,"고친 표도 곧바로 캐시에 있어 다음 사람은 시트를 안 읽음");
onSheetChange({changeType:"INSERT_ROW"});
must(PRELOAD_.every(t=>props["sv|"+t]!==before["sv|"+t]),"줄 넣기 같은 모양 바뀜은 모든 판을 올림");
READS=0;db=makeDb_();db.preload(PRELOAD_);PRELOAD_.forEach(t=>db.rows(t));must(READS===0,"그 뒤에도 미리 채워 둬서 시트 읽기 0");
