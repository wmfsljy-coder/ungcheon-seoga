/* 시연본 전용: 구글 시트 대신 이 브라우저의 localStorage 를 표로 쓴다.
   로직은 core.gs 를 그대로 돌리므로, 여기서 되는 것은 시트에서도 같게 돈다. */
window.DemoServer=(function(){
  var KEY="ungcheon-seoga-demo-v5",WHO="ungcheon-seoga-demo-who";
  var ACCOUNTS=[["@pin","PIN 로그인 체험 (학번·이름으로 들어가 보세요)"],
    ["s3201@school.kr","학생 (김서준 · 3-2)"],["s3101@school.kr","동의 전 학생 (박하늘)"],["s2101@school.kr","학생 (강다온 · 2-1)"],
    ["lib@school.kr","담당 교사"],["lee@school.kr","3학년 담당 (이정민)"],["sci@school.kr","교사 (최과학)"],["s3202@school.kr","도서부 학생 (이도윤)"]];
  function h32(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ("0000000"+(h>>>0).toString(16)).slice(-8);}
  var env={
    now:function(){return new Date();},
    email:function(){try{return localStorage.getItem(WHO)||ACCOUNTS[0][0];}catch(e){return ACCOUNTS[0][0];}},
    uid:function(){return Math.random().toString(36).slice(2,12);},
    hmac:function(s){return h32("a|"+s)+h32("b|"+s)+h32(s+"|c");},
    mail:function(){},demo:true,
    /* 가짜 독서로: 제목마다 0~5권, 사본 넷 중 하나쯤은 대출 중 */
    http:function(reqs){
      return reqs.map(function(q){
        if(q.method==="post"&&q.body.categoryCode){
          /* 분류 조회: 영역마다 예시 도서 60권 */
          var ai=0;Core.GENRES.forEach(function(g,i){if(g[0]===q.body.categoryCode)ai=i;});
          var area=Core.GENRES[ai][1],all=[];
          for(var n2=1;n2<=60;n2++)all.push({bookKey:"c"+ai+"-"+n2,speciesKey:"c"+ai+"-"+n2,title:area+" 예시 도서 "+n2+"번",author:"예시 지은이 "+n2+" 지음",
            publisher:"예시출판",pubYear:String(2010+n2%16),pubFormCode:"MA",appendixYn:"N",categoryInfo:{mdesc:area,mcode:Core.GENRES[ai][0].slice(0,3)+"00"+(n2%3)+"000"},
            isbn:"979"+String(1e9+ai*1000+n2),callNo:(800+(ai*7+n2)%100)+".6 예"+n2+" c.1"});
          var pg=q.body.page||1;
          return {code:200,text:JSON.stringify({status:"OK",data:{totalCount:60,bookList:all.slice((pg-1)*50,pg*50)}})};
        }
        if(/detail\/info\/isbn/.test(q.url)){
          /* 책 상세: 예시 소개글·핵심어 */
          var isbn=/isbn=(\d+)/.exec(q.url)[1],k=Number(isbn.slice(-3)),g=Math.floor(Number(isbn.slice(-7))/1000)%Core.GENRES.length,topic=["우정","기억","바다","용기","도시","시간","가족","숲","별","편지"][k%10];
          return {code:200,text:JSON.stringify({status:"OK",data:{description:"예시 소개글입니다. "+(k%7+2)+"년 만에 고향에 돌아온 주인공이 "+topic+"에 얽힌 비밀을 따라가며 조금씩 달라지는 한 해를 그린다. 마지막 장에서 밝혀지는 진실은 처음 장면을 다시 읽게 만든다.",
            keywordList:[topic,"예시"+k]}})};
        }
        if(/category\/list/.test(q.url))return {code:200,text:JSON.stringify({status:"OK",data:{categoryList:Core.GENRES.map(function(g){return {lCategoryCode:g[0]};})}})};
        if(q.method==="post"){
          var kw=q.body.searchKeyword,h=parseInt(h32(kw),16),n=h%7>4?0:h%6,bk=Core.seedBooks().filter(function(b){return b["제목"]===kw;})[0],ex=/예시 도서 (\d+)번$/.exec(kw);
          if(ex)n=1+h%3;
          var list=[];for(var i=1;i<=n;i++)list.push({bookKey:h32(kw)+"-"+i,title:kw,author:(ex?"예시 지은이 "+ex[1]:bk?bk["지은이"]:"예시 지은이")+" 지음",speciesKey:h32(kw),publisher:"예시출판",pubYear:"2020",
            callNo:(800+h%100)+".6 "+kw.charAt(0)+(h%90+10)+"ㄱ c."+i,locationName:"자료실"});
          return {code:200,text:JSON.stringify({status:"OK",data:{totalCount:n,bookList:q.body.page===1?list:[]}})};
        }
        var key=/bookKey=([^&]+)/.exec(q.url)[1],out=parseInt(h32(key),16)%4===0;
        var d=new Date(Date.now()+5*86400000),due=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
        return {code:200,text:JSON.stringify({status:"OK",data:{status:out?"대출중":"대출가능",returnPlanDate:out?due:""}})};
      });
    }
  };
  function seed(){
    var wk=Core.weekKey(new Date(),0),pw=Core.weekKey(new Date(),-1),ppw=Core.weekKey(new Date(),-2),T={};
    Object.keys(Core.HEAD).forEach(function(t){T[t]=[];});
    T["설정"]=Core.CONF0.map(function(r){return {"항목":r[0],"값":r[1]};});
    /* 시연: 상품권 안내를 켜고, 이번 주에 지난달 상품권 배부, 공지 하나 */
    (function(){var d=new Date(),mon=new Date(d.getFullYear(),d.getMonth(),1),f=function(x){return x.getFullYear()+"-"+("0"+(x.getMonth()+1)).slice(-2)+"-"+("0"+x.getDate()).slice(-2);};
      var a=new Date(d.getTime()+2*864e5),b=new Date(d.getTime()+5*864e5);
      T["설정"].forEach(function(r){if(r["항목"]==="상품권공개")r["값"]="Y";if(r["항목"]==="상품권배부")r["값"]=f(a)+"~"+f(b);});
      T["공지"]=[{"id":"n1","시작":f(d),"끝":f(b),"제목":"도서관 점심시간 개방","내용":"이번 주는 점심시간에도 도서관을 열어요. 읽고 싶은 책을 빌려 가세요.","대상":"학생","숨김":"","시각":""}];})();
    T["도서"]=Core.seedBooks();
    [["3101","박하늘","3-1"],["3102","최민재","3-1"],["3201","김서준","3-2"],["3202","이도윤","3-2"],["3203","정유나","3-2"],["3204","서하람","3-2"],
     ["3301","한지우","3-3"],["3501","오세린","3-5"],["3502","문가온","3-5"],["2101","강다온","2-1"]].forEach(function(r){
      T["명단"].push({"학번":r[0],"이름":r[1],"반":r[2],"도서부":r[0]==="3202"?"Y":"","이메일":r[0]==="3203"||r[0]==="3204"?"":"s"+r[0]+"@school.kr",
        /* 3-2 는 네 명 모두 PIN 을 정한 반(전원 가입 → 반 전원 만능 도장) */
        "핀":r[2]==="3-2"||r[0]==="3501"?"(정함)":"", "핀설정":r[2]==="3-2"?wk+" 0"+(r[0]==="3204"?"9":"8")+":30:00":(r[0]==="3501"?pw+" 08:00:00":""),
        "동의":r[0]==="3203"||r[0]==="3101"?"":wk+" 08:00:00"});});
    T["교사"]=[{"이메일":"lib@school.kr","이름":"박서가","담당":"전체"},{"이메일":"lee@school.kr","이름":"이정민","담당":"3학년"},{"이메일":"sci@school.kr","이름":"최과학","담당":"교사"}];
    T["글"].push({"id":"gt1","시각":pw+" 09:00:00","주":pw,"차수":"1","종류":"label","학번":"","이름":"박서가","반":"선생님","도서id":"free",
      "책제목":"죽음의 수용소에서","지은이":"빅터 프랭클","머리글":"","본문":"스무 살에 읽고 서른에 다시 읽었다. 얇지만 읽을 때마다 밑줄 긋는 곳이 달라진다. 1부만 읽어도 된다.",
      "계기":"교사 라벨","쪽수":"","상태":"posted","메모":"","인쇄":"","수상":"","확인":"Y"});
    T["반응"].push({"시각":wk,"갈래":"공감","부문":"","주":"","글id":"g1","누구":env.hmac("like|2101|g1")});
    function post(id,week,kind,hb,name,cls,title,author,text,head,printed){
      T["글"].push({"id":id,"시각":week+" 10:00:00","주":week,"차수":"1","종류":kind,"학번":hb,"이름":name,"반":cls,"도서id":"free",
        "책제목":title,"지은이":author,"머리글":head||"","본문":text,"계기":"추석 연휴에 도서관에서 빌려 읽음","쪽수":kind==="label"?"":"132쪽",
        "상태":"posted","메모":"","인쇄":printed?"Y":"","수상":"","확인":printed?"Y":""});
    }
    post("g1",pw,"label","3202","이도윤","3-2","아몬드","손원평","표지 보고 무거울 줄 알았는데 하루 만에 읽었다. 읽고 나니까 내가 요즘 뭘 느꼈는지가 선명해졌다.","",true);
    post("g2",pw,"label","3501","오세린","3-5","프로젝트 헤일메리","앤디 위어","수시 끝나고 아무거나 집었는데 3일 만에 다 봤다. 화학 시간에 배운 게 여기서 이렇게 쓰이는구나 싶었다.","",true);
    post("g3",pw,"label","3101","박하늘","3-1","공정하다는 착각","마이클 샌델","노력하면 된다는 말이 왜 누구한테는 폭력이 되는지 알게 됐다. 다 동의하진 않지만 친구랑 두 시간 떠들었다.");
    post("g4",pw,"review","3301","한지우","3-3","도둑맞은 집중력","요한 하리",
      "3학년 올라오고 나서 책상에 앉아 있는 시간은 늘었는데 머리에 남는 게 없다는 느낌이 계속 있었다. 이 책은 그게 개인의 의지 문제가 아니라 설계의 문제라고 말한다.\n\n가장 기억에 남는 건 하루에 확인하는 알림의 수를 세어 보는 대목이었다. 나는 세다가 중간에 포기했다. 저자는 집중력이 사라진 게 아니라 다른 곳으로 옮겨 갔다고 말하는데, 이게 변명처럼 들리지 않았던 건 대안을 같이 내놓기 때문이다.\n\n다만 후반부의 해법은 좀 이상적이다. 학교 다니는 사람이 휴대폰을 통째로 없애기는 어렵다. 그래도 알림을 끄는 것부터 해 봤고 2주째인 지금은 확실히 다르다. 시험 기간에 스스로가 답답했던 친구들에게 권하고 싶다.",
      "집중이 안 되는 게 내 탓만은 아니었다");
    post("g5",wk,"label","3502","문가온","3-5","불편한 편의점","김호연","편의점 알바를 해 본 사람이면 첫 장에서 웃는다. 가볍게 시작했는데 마지막엔 우리 동네 편의점이 달라 보였다.");
    post("g6",wk,"label","3203","정유나","3-2","떨림과 울림","김상욱","물리 포기자인데 끝까지 읽었다. 수식이 하나도 없고 문장이 시 같아서 밤에 읽기 좋다.");
    post("g7",wk,"quote","3501","오세린","3-5","데미안","헤르만 헤세","새는 알에서 나오려고 투쟁한다. 알은 세계다.");
    post("g8",wk,"quote","3202","이도윤","3-2","아몬드","손원평","내 머릿속에는 아몬드가 있다. 당신에게도 있다.");
    post("g9",wk,"review","3502","문가온","3-5","불편한 편의점","김호연",
      "처음에는 가볍게 읽히는 소설이라고 생각했다. 편의점에서 일하는 사람들의 하루가 차례로 지나가는데, 읽다 보니 우리 동네 편의점 아저씨 얼굴이 자꾸 떠올랐다.\n\n가장 오래 남은 장면은 손님이 아니라 직원끼리 주고받는 짧은 말들이었다. 큰 사건이 없는데도 끝까지 읽게 되는 건 그 말들이 진짜 같아서다. 독서를 오래 쉬었던 친구에게 첫 책으로 권하고 싶다.",
      "작은 말들이 오래 남는다");
    [["g2","3101"],["g2","3102"],["g2","3301"],["g3","3501"],["g3","3202"],["g1","3502"]].forEach(function(v){
      T["반응"].push({"시각":wk,"갈래":"투표","부문":"label","주":wk,"글id":v[0],"누구":env.hmac("vote|"+v[1]+"|"+wk+"|label")});});
    /* 김서준: 이번 주 다섯 자리를 모두 채운 학생(만능 도장은 지난 두 주에 모은 책갈피 5장) */
    var lm=Core.prevMonth(wk.slice(0,7));
    function seoJun(week,rows){rows.forEach(function(r,i){
      post("d"+week.slice(5).replace("-","")+i,week,r[0],"3201","김서준","3-2",r[1],r[2],r[3],r[4]||"");
      T["글"][T["글"].length-1]["시각"]=week+" 0"+(i+1)+":00:00";});}
    /* 지난 두 주: 자리가 차서 남은 글이 책갈피 넉 장으로 */
    [ppw,pw].forEach(function(week,n){
      var rows=[
        ["label",n?"데미안":"코스모스",n?"헤르만 헤세":"칼 세이건","아무 장이나 펴서 읽어도 되는 책. 두께 보고 겁먹지 말 것, 문장이 아름답다.",""],
        ["quote",n?"1984":"파친코",n?"조지 오웰":"이민진","역사가 우리를 저버렸지만 그래도 상관없다.",""],
        ["review",n?"연금술사":"하얼빈",n?"파울로 코엘료":"김훈","읽기 시작하면 멈출 수 없다. 이번 주에 읽은 책 가운데 가장 오래 남았다. 문장이 짧아서 금방 읽히는데, 다 읽고 나면 한 문장씩 다시 읽게 된다. 시험 기간에 스스로가 답답했던 친구들에게 권하고 싶다.","오래 남는 책"]];
      if(n)rows.push(["review","칼의 노래","김훈","두 번째 독후감. 같은 주에 또 썼더니 자리는 찼고 책갈피가 한 장 늘었다. 그래도 읽은 게 어디 가지는 않는다. 다섯 장이면 만능 도장이 된다고 하니 그때까지 모아 볼 생각이다.","책갈피로 남은 글"]);
      seoJun(week,rows);});
    /* 이번 주: 라벨 한 칸 + 문장(다섯 번째 책갈피 → 만능 도장) + 독후감 한 칸 */
    seoJun(wk,[
      ["label","불편한 편의점","김호연","편의점 알바를 해 본 사람이면 첫 장에서 웃는다. 가볍게 시작했는데 마지막엔 우리 동네 편의점이 달라 보였다.",""],
      ["quote","아몬드","손원평","나는 내가 아는 것보다 조금 더 오래 기다릴 수 있는 사람이었다.",""],
      ["review","떨림과 울림","김상욱","물리 포기자인데 끝까지 읽었다. 수식이 하나도 없고 문장이 시 같아서 밤에 읽기 좋다. 읽고 나면 창밖의 소리가 조금 다르게 들린다. 과학책을 처음 잡는 친구에게 권하고 싶다.","시 같은 물리책"]]);
    T["퀴즈"].push({"id":"qs1","시각":wk+" 08:00:00","차수":"1","주":"","상태":"대기","책제목":"떨림과 울림","쪽수":"31쪽",
      "문제":"31쪽에서 저자가 떨림이라고 부른 것은 무엇인가요?","보기1":"물질을 이루는 입자의 진동","보기2":"바다의 조수","보기3":"별의 밝기","보기4":"지구의 자전",
      "정답":1,"해설":"31쪽에 나옵니다.","학번":"3201","반":"3-2","품질":"8","출처":"학생"});
    T["퀴즈응답"].push({"주":wk,"학번":"3201","점수":"4","시각":wk+" 12:00:00","차수":"1","문항수":"5"});
    /* 선생님이 손으로 찍어 준 도장(자리와 상관없는 만능) */
    T["도장"].push({"id":"t1","시각":pw+" 13:00:00","주":pw,"학번":"3201","이름":"김서준","반":"3-2",
      "사유":"독서 토론에서 좋은 질문","교사":"최과학","취소":""});
    [["넛지","리처드 세일러"],["완득이","김려령"],["침묵의 봄","레이첼 카슨"],["여행의 이유","김영하"],["사피엔스","유발 하라리"]].forEach(function(b,i){
      post("p"+i,lm+"-0"+(i+2),i===1?"review":"label","3201","김서준","3-2",b[0],b[1],"지난달에 읽은 책. 생각보다 훨씬 재밌었고 친구에게도 권했다. 꼭 읽어 봐.",i===1?"지난달의 책":"");});
    T["퀴즈응답"].push({"주":lm+"-07","학번":"3201","점수":"4","시각":lm+"-08 10:00:00","차수":"1","문항수":"5"});
    [["아몬드","","『아몬드』의 주인공 윤재에 대한 설명으로 작품에 나오는 것은?",["편도체가 작아 감정을 잘 느끼지 못한다","색을 구분하지 못한다","소리를 듣지 못한다","기억을 오래 유지하지 못한다"],1,"윤재는 편도체가 작아 공포나 분노 같은 감정을 느끼기 어려운 인물로 그려집니다."],
     ["팩트풀니스","차례","『팩트풀니스』가 경계하라고 말하는 본능에 해당하지 않는 것은?",["간극 본능","부정 본능","직선 본능","확증 회피 본능"],4,"책이 다루는 열 가지 본능에 '확증 회피 본능'은 없습니다."]
    ].forEach(function(q,i){
      T["퀴즈"].push({"id":"q"+(i+1),"시각":wk+" 09:00:00","차수":"1","주":wk,"상태":"출제","책제목":q[0],"쪽수":q[1],"문제":q[2],
        "보기1":q[3][0],"보기2":q[3][1],"보기3":q[3][2],"보기4":q[3][3],"정답":q[4],"해설":q[5],"학번":"","반":"교사"});});
    T["퀴즈"].push({"id":"q9","시각":wk+" 11:00:00","차수":"1","주":"","상태":"대기","책제목":"하얼빈","쪽수":"첫 장","문제":"첫 장에서 안중근이 머무는 도시는?",
      "보기1":"블라디보스토크","보기2":"상하이","보기3":"도쿄","보기4":"베이징","정답":1,"해설":"시연용 예시 문제입니다.","학번":"3202","반":"3-2"});
    return T;
  }
  var T;
  try{T=JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){}
  if(!T)T=seed();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(T));}catch(e){}}
  var db={
    rows:function(t){return T[t]||(T[t]=[]);},
    add:function(t,o){var r={};Core.HEAD[t].forEach(function(h){r[h]=o[h]==null?"":String(o[h]);});db.rows(t).push(r);save();},
    addMany:function(t,list){list.forEach(function(o){var r={};Core.HEAD[t].forEach(function(h){r[h]=o[h]==null?"":String(o[h]);});db.rows(t).push(r);});save();},
    set:function(t,k,v,patch){db.rows(t).forEach(function(r){if(String(r[k]).trim()===String(v))Object.keys(patch).forEach(function(c){r[c]=String(patch[c]);});});save();},
    setMany:function(t,k,map){db.rows(t).forEach(function(r){var p=map[String(r[k]).trim()];if(p)Object.keys(p).forEach(function(c){r[c]=p[c]==null?"":String(p[c]);});});save();},
    setConf:function(k,v){var hit=db.rows("설정").filter(function(r){return r["항목"]===k;})[0];if(hit)hit["값"]=v;else db.rows("설정").push({"항목":k,"값":v});save();}
  };
  if(!db.rows("설정").some(function(r){return r["항목"]==="도서확인";}))Core.make(db,env).tick();
  return {
    accounts:ACCOUNTS,
    current:function(){return env.email();},
    switchTo:function(e){try{localStorage.setItem(WHO,e);}catch(x){}location.reload();},
    api:function(name,json){
      /* 시연: '메일 로그인 체험'을 고르면 메일 방식, 나머지 계정은 계정 바꾸기로 바로 들어오는 구글 방식 */
      try{var mode=env.email()==="@pin"?"핀":"구글";db.rows("설정").forEach(function(r){if(r["항목"]==="로그인방식")r["값"]=mode;});
        var pp=JSON.parse(json||"{}"),want=pp._state&&name!=="state";delete pp._state;
        var out=Core.make(db,env).api(name,pp);
        if(want){out={r:out==null?{ok:true}:out,state:Core.make(db,env).api("state",{_t:pp._t,as:pp._as})};}return JSON.stringify(out==null?{ok:true}:out);}
      catch(e){return JSON.stringify({error:String(e&&e.message||e)});}
    },
    reset:function(){try{localStorage.removeItem(KEY);localStorage.removeItem(WHO);}catch(e){}location.reload();}
  };
})();
