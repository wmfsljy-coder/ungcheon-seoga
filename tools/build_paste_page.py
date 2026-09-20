"""Apps Script 에 옮겨 넣을 파일을 한 페이지에 담는다(복사 버튼 + 단계 안내).
코드를 고친 뒤 다시 돌려서 같은 경로로 다시 게시하면 된다.
사용: python tools/build_paste_page.py <출력 경로>"""
import html
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "tools" / "paste_page.html"
SCRIPT = "https://script.google.com/u/0/home/projects/1u4WxxQA3-tcbSXWdvnYd6lLv_m89dbniiQ7ZDdrIxVrcclkpoqcBG_c4/edit"
SHEET = "https://docs.google.com/spreadsheets/d/1VXcAbIQPTyUC1eIDFvVh5ZWLYLyatSeTEUH_a-IeBYg/edit"


def code(fid, name):
    text = (root / name).read_text(encoding="utf-8")
    lines = text.count("\n") + 1
    return (f'<div class="code"><div class="code-head"><span class="fname">{name}</span>'
            f'<span class="meta">{lines}줄</span>'
            f'<button class="copy" data-copy="{fid}" type="button">내용 전체 복사</button></div>'
            f'<textarea id="{fid}" readonly spellcheck="false" aria-label="{name} 내용">{html.escape(text)}</textarea></div>')


def chip(text):
    return f'<button class="chip" data-text="{html.escape(text)}" type="button" title="복사">{html.escape(text)}</button>'


steps = [
    ("프로젝트 열기",
     f'<p>아래 링크로 Apps Script 편집기를 엽니다. 학교 구글 계정(담당 선생님 계정)으로 로그인돼 있어야 합니다.</p>'
     f'<p class="links"><a href="{SCRIPT}" target="_blank" rel="noopener">Apps Script 프로젝트</a>'
     f'<a href="{SHEET}" target="_blank" rel="noopener">연결될 시트</a></p>'),
    ("Code.gs 바꾸기",
     '<p>왼쪽 파일 목록에서 <b>Code.gs</b>를 누릅니다. 편집 칸을 한 번 누르고 <kbd>Ctrl</kbd>+<kbd>A</kbd> → 아래 [내용 전체 복사] → '
     '편집 칸에 <kbd>Ctrl</kbd>+<kbd>V</kbd> → <kbd>Ctrl</kbd>+<kbd>S</kbd>.</p>' + code("f-code", "Code.gs")),
    ("core 스크립트 만들기",
     f'<p>파일 옆 <b>+</b> → <b>스크립트</b> → 이름 칸에 {chip("core")} 입력(.gs는 자동으로 붙습니다) → Enter. '
     '새 파일에 들어 있는 기본 내용을 <kbd>Ctrl</kbd>+<kbd>A</kbd>로 지우고 붙여넣은 뒤 <kbd>Ctrl</kbd>+<kbd>S</kbd>.</p>'
     + code("f-core", "core.gs")),
    ("index 화면 만들기",
     f'<p><b>+</b> → <b>HTML</b> → 이름 {chip("index")} (.html은 자동) → Enter. 기본 내용을 지우고 붙여넣은 뒤 저장.</p>'
     '<p class="note">이름이 정확히 <b>index</b>여야 합니다. Index, index.html.html 이면 화면이 안 뜹니다.</p>'
     + code("f-index", "index.html")),
    ("appsscript.json 바꾸기",
     '<p>왼쪽 맨 아래 <b>톱니바퀴(프로젝트 설정)</b> → <b>“편집기에서 ‘appsscript.json’ 매니페스트 파일 표시”</b> 체크 → '
     '왼쪽 <b>&lt; &gt;(편집기)</b>로 돌아오면 파일 목록에 <b>appsscript.json</b>이 생깁니다. 눌러서 내용을 바꾸고 저장.</p>'
     + code("f-json", "appsscript.json")),
    ("setup 한 번 실행",
     f'<p>편집기 위쪽 [▷ 실행] 옆 함수 선택 칸에서 {chip("setup")} 을 고르고 <b>실행</b>.</p>'
     '<ol class="sub">'
     '<li><b>권한 검토</b> → 선생님 계정 선택</li>'
     '<li>“Google에서 확인하지 않은 앱” 화면이 나오면 <b>고급</b> → <b>(프로젝트 이름)(으)로 이동</b></li>'
     '<li><b>허용</b></li></ol>'
     '<p>아래쪽 실행 로그에 “설정을 마쳤습니다”가 나오면 끝입니다. 시트에 탭 9개(설정·명단·교사·도서·글·투표·퀴즈·퀴즈응답·공감)가 생기고, '
     '선생님 계정이 <b>교사</b> 탭에 담당 교사로 들어갑니다. 이번 달 추천 도서 24권을 처음 뽑고, 매일 7시·15시·0시 자동 확인 시계도 이때 걸립니다(1분쯤 걸림).</p>'
     '<p class="note">이미 설치해 두셨다면 새 코드를 붙여넣은 뒤 <b>setup을 한 번 더</b> 실행하세요. 새 권한(외부 연결·캐시) 허용과 새 열 추가가 이때 됩니다. 기존 글·명단은 그대로입니다.</p>'),
    ("명단·교사 채우기",
     '<p>시트의 <b>명단</b> 탭에 학번 · 이름 · 반을 붙여넣습니다. 반은 <code>3-2</code> 형식, 이메일 칸은 비워 둡니다(학생이 처음 들어올 때 스스로 등록).</p>'
     '<p><b>교사</b> 탭에는 담임을 한 줄씩: 이메일 · 이름 · 담당(<code>3-2</code>). 담당이 <code>전체</code>면 담당 교사 권한입니다.</p>'),
    ("웹 앱으로 배포",
     '<p>편집기 오른쪽 위 <b>배포</b> → <b>새 배포</b> → 유형 선택 톱니바퀴 → <b>웹 앱</b>.</p>'
     '<dl class="kv">'
     f'<dt>설명</dt><dd>{chip("웅천 서가 1차")}</dd>'
     '<dt>다음 사용자 인증 정보로 실행</dt><dd><b>나</b> (선생님 계정)</dd>'
     '<dt>액세스 권한이 있는 사용자</dt><dd><b>모든 사용자</b> (메일 인증번호 로그인, 설정 로그인방식 = 메일)</dd></dl>'
     '<p>[배포]를 누르면 나오는 <b>웹 앱 URL</b>이 학생·교사 공용 주소입니다. 먼저 선생님이 열어 담당 화면이 뜨는지 확인하세요.</p>'
     '<p class="note">학생은 처음 한 번 메일 주소로 인증번호를 받아 들어오고, 같은 PC·브라우저에서는 다음부터 자동으로 들어옵니다. 인증번호 메일은 선생님 계정에서 나갑니다(학교 구글 계정 하루 1,500통).</p>'
     '<p class="note">이미 “도메인 내 모든 사용자”로 배포해 두셨다면 <b>배포 관리 → 연필 → 액세스: 모든 사용자</b>로 바꾸세요. 목록에 “모든 사용자”가 없으면 학교 구글 관리자가 막아 둔 것이니, 설정 시트 <b>로그인방식</b>을 <b>구글</b>로 바꾸고 “도메인 내 모든 사용자”로 배포하세요(학교 구글 계정으로 바로 들어오는 방식).</p>'
     '<p class="note">코드를 고친 뒤에는 <b>배포 → 배포 관리 → 연필 → 버전: 새 버전 → 배포</b>. 주소는 그대로입니다.</p>'),
]

body = "".join(
    f'<section class="step" id="s{i}"><div class="num" aria-hidden="true">{i}</div>'
    f'<div class="step-body"><h2>{t}</h2>{c}</div></section>'
    for i, (t, c) in enumerate(steps, 1))

page = f"""<title>웅천 서가 설치</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Nanum+Gothic+Coding&display=swap">
<style>
:root{{
  --bark:#3A2A1E;--paper:#FAF7F0;--paper-2:#F0E9D9;--ink:#2B2320;--muted:#76685A;
  --gold:#A87C17;--gold-soft:rgba(181,137,31,.14);--red:#9E3B24;--line:rgba(43,35,32,.16);
  --code-bg:#FFFDF8;--on-bark:#F2E7D2;
}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{
  --bark:#150F0A;--paper:#191512;--paper-2:#231C16;--ink:#ECE4D8;--muted:#A6957F;
  --gold:#D9A93A;--gold-soft:rgba(217,169,58,.16);--red:#E07A5F;--line:rgba(236,228,216,.16);
  --code-bg:#120E0B;--on-bark:#F2E7D2;}}}}
:root[data-theme="dark"]{{
  --bark:#150F0A;--paper:#191512;--paper-2:#231C16;--ink:#ECE4D8;--muted:#A6957F;
  --gold:#D9A93A;--gold-soft:rgba(217,169,58,.16);--red:#E07A5F;--line:rgba(236,228,216,.16);
  --code-bg:#120E0B;--on-bark:#F2E7D2;}}
*{{box-sizing:border-box}}
body{{background:var(--paper);color:var(--ink);font:15px/1.7 'IBM Plex Sans KR','Malgun Gothic',system-ui,sans-serif;margin:0}}
header{{background:var(--bark);color:var(--on-bark)}}
.in{{max-width:860px;margin:0 auto;padding-inline:16px}}
header .in{{padding-block:26px 22px}}
h1{{font:700 26px/1.3 'Gowun Batang',serif;margin:0;text-wrap:balance}}
header p{{margin:6px 0 0;opacity:.78;font-size:14px;max-width:62ch}}
main.in{{padding-block:10px 64px}}
.step{{display:grid;grid-template-columns:34px minmax(0,1fr);gap:14px;padding-block:24px;border-bottom:1px solid var(--line)}}
.num{{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--gold);color:var(--gold);display:grid;place-items:center;
  font:700 16px 'Gowun Batang',serif;font-variant-numeric:tabular-nums}}
h2{{font:700 18px/1.4 'Gowun Batang',serif;margin:4px 0 8px}}
p{{margin:0 0 10px;max-width:68ch}}
kbd{{font:12.5px 'Nanum Gothic Coding',ui-monospace,monospace;border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;padding:0 5px;background:var(--paper-2)}}
code{{font:13.5px 'Nanum Gothic Coding',ui-monospace,monospace;background:var(--paper-2);padding:1px 5px;border-radius:3px}}
a{{color:var(--red)}}
.links{{display:flex;gap:18px;flex-wrap:wrap;font-weight:500}}
.note{{font-size:13.5px;color:var(--muted);border-left:2px solid var(--gold);padding-left:10px}}
ol.sub{{margin:0 0 10px;padding-left:20px}}
dl.kv{{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 16px;margin:4px 0 12px;font-size:14px}}
dl.kv dt{{color:var(--muted)}} dl.kv dd{{margin:0}}
.chip{{font:13.5px 'Nanum Gothic Coding',ui-monospace,monospace;color:var(--ink);background:var(--gold-soft);border:1px dashed var(--gold);
  border-radius:4px;padding:1px 8px;cursor:pointer}}
.chip.ok{{border-style:solid}}
.code{{border:1px solid var(--line);border-radius:6px;overflow:hidden;margin-top:12px;background:var(--code-bg)}}
.code-head{{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;background:var(--paper-2);border-bottom:1px solid var(--line)}}
.fname{{font:600 14px 'Nanum Gothic Coding',ui-monospace,monospace}}
.meta{{font-size:12.5px;color:var(--muted)}}
.copy{{margin-left:auto;background:var(--red);color:#fff;border:0;border-radius:4px;padding:7px 14px;font:500 13.5px inherit;font-family:inherit;cursor:pointer}}
.copy.ok{{background:var(--gold)}}
textarea{{display:block;width:100%;height:190px;border:0;resize:vertical;background:var(--code-bg);color:var(--ink);
  font:12.5px/1.55 'Nanum Gothic Coding',ui-monospace,monospace;padding:10px 14px;white-space:pre;overflow:auto}}
button:focus-visible,a:focus-visible,textarea:focus-visible{{outline:2px solid var(--gold);outline-offset:2px}}
@media (max-width:520px){{.step{{grid-template-columns:1fr}}.num{{width:30px;height:30px}}dl.kv{{grid-template-columns:1fr}}dl.kv dd{{margin-bottom:6px}}}}
</style>
<header><div class="in">
  <h1>웅천 서가 설치</h1>
  <p>Apps Script 편집기에 파일 4개를 옮겨 넣고 배포하는 순서입니다. 복사 버튼이 안 먹으면 코드 칸을 눌러 <kbd>Ctrl</kbd>+<kbd>A</kbd>, <kbd>Ctrl</kbd>+<kbd>C</kbd> 하세요.</p>
</div></header>
<main class="in">{body}</main>
<script>
(function(){{
  function copyText(t,done){{
    function fallback(){{
      var a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";
      document.body.appendChild(a);a.select();var ok=false;try{{ok=document.execCommand("copy");}}catch(e){{}}a.remove();done(ok);
    }}
    try{{if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(function(){{done(true);}},fallback);return;}}}}catch(e){{}}
    fallback();
  }}
  function flash(b,ok,label){{
    var old=b.textContent;b.textContent=ok?label:"칸을 눌러 Ctrl+A, Ctrl+C";b.classList.toggle("ok",ok);
    setTimeout(function(){{b.textContent=old;b.classList.remove("ok");}},1800);
  }}
  document.addEventListener("click",function(e){{
    var b=e.target.closest("button");if(!b)return;
    if(b.dataset.copy){{var ta=document.getElementById(b.dataset.copy);
      copyText(ta.value,function(ok){{if(!ok){{ta.focus();ta.select();}}flash(b,ok,"복사됨 ✓");}});}}
    else if(b.dataset.text){{copyText(b.dataset.text,function(ok){{flash(b,ok,"복사됨");}});}}
  }});
  document.addEventListener("focusin",function(e){{if(e.target.tagName==="TEXTAREA")e.target.select();}});
}})();
</script>
"""
out.write_text(page, encoding="utf-8")
print(out, len(page), "bytes")
