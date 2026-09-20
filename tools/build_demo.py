"""index.html + core.gs + demo_server.js 를 합쳐 서버 없이 열리는 demo.html 을 만든다."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
core = (root / "core.gs").read_text(encoding="utf-8")
demo = (root / "tools" / "demo_server.js").read_text(encoding="utf-8")
page = (root / "index.html").read_text(encoding="utf-8")

banner = ('<div class="demo">시연본 — 구글 로그인 대신 계정을 골라 보세요: <select id="demo-who" style="width:auto;padding:2px 6px;font-size:12.5px" onchange="DemoServer.switchTo(this.value)"></select> '
          '<a href="#" onclick="DemoServer.reset();return false">처음 상태로</a></div>'
          '<script>(function(){var s=document.getElementById("demo-who");DemoServer.accounts.forEach(function(a){'
          'var o=document.createElement("option");o.value=a[0];o.textContent=a[1];o.selected=a[0]===DemoServer.current();s.appendChild(o);});})();</scr'+'ipt>')
inject = "<script>\n" + core + "\n" + demo + "\n</script>\n" + banner
assert "<!--DEMO-->" in page
(root / "demo.html").write_text(page.replace("<!--DEMO-->", inject), encoding="utf-8")
print("demo.html", len(page) + len(inject), "bytes")

# Apps Script 편집기에 옮길 때 쓰는 복사 도우미
import json, html
files = [("Code.gs", "Code.gs (기본 파일 내용을 모두 지우고 붙여넣기)"),
         ("core.gs", "core.gs (+ > 스크립트 > 이름 core)"),
         ("index.html", "index.html (+ > HTML > 이름 index)"),
         ("appsscript.json", "appsscript.json (톱니바퀴 > 'appsscript.json 표시' 체크 후 교체)")]
data = {n: (root / n).read_text(encoding="utf-8") for n, _ in files}
rows = "".join('<p><button onclick="cp(%s,this)">복사</button> <b>%s</b></p>' % (html.escape(json.dumps(n)), html.escape(label)) for n, label in files)
(root / "붙여넣기.html").write_text("""<!DOCTYPE html><html lang="ko"><meta charset="utf-8"><title>웅천 서가 — 붙여넣기 도우미</title>
<style>body{font-family:'Malgun Gothic',sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.7}
button{padding:8px 18px;font-size:15px;cursor:pointer}ol{padding-left:20px}</style>
<h2>웅천 서가 — 붙여넣기 도우미</h2>
<p><a href="https://script.google.com/u/0/home/projects/1u4WxxQA3-tcbSXWdvnYd6lLv_m89dbniiQ7ZDdrIxVrcclkpoqcBG_c4/edit" target="_blank">Apps Script 프로젝트 열기</a>
 · <a href="https://docs.google.com/spreadsheets/d/1VXcAbIQPTyUC1eIDFvVh5ZWLYLyatSeTEUH_a-IeBYg/edit" target="_blank">시트 열기</a></p>
<p>파일마다 [복사]를 누르고, 편집기에서 Ctrl+A → Ctrl+V → Ctrl+S.</p>
""" + rows + """
<ol><li>네 파일을 다 넣고 저장</li><li>편집기 위쪽 함수 선택에서 <b>setup</b> 고르고 [실행] → 권한 허용</li>
<li>[배포] → [새 배포] → 유형 <b>웹 앱</b> → 실행: <b>나</b> / 액세스: <b>(학교 도메인) 내 모든 사용자</b> → 배포</li>
<li>나온 주소로 들어가 보기. 코드를 고친 뒤에는 [배포 관리] → 연필 → 버전: 새 버전</li></ol>
<script>var F=""" + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + """;
function cp(n,b){navigator.clipboard.writeText(F[n]).then(function(){b.textContent="복사됨 ✓";setTimeout(function(){b.textContent="복사";},1500);},
function(){var a=document.createElement("textarea");a.value=F[n];document.body.appendChild(a);a.select();document.execCommand("copy");a.remove();b.textContent="복사됨 ✓";});}
</script></html>""", encoding="utf-8")
print("붙여넣기.html")
