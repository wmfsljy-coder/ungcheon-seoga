"""시연본을 GitHub Pages 로 내보낸다(docs/ 폴더).

  python tools/build_demo.py && python tools/build_pages.py

Pages 는 docs/index.html 을 그대로 띄운다. demo.html 은 구글 시트 대신
브라우저 localStorage 를 쓰므로 서버 없이 그대로 돈다.
학생 개인정보는 들어가지 않는다(demo_server.js 의 가짜 명단만 쓴다).
"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
demo = root / "demo.html"
if not demo.exists():
    sys.exit("demo.html 이 없습니다. 먼저 python tools/build_demo.py 를 돌리세요.")

html = demo.read_text(encoding="utf-8")

# 공개 저장소로 나가므로 실제 시트·스크립트 주소가 섞이지 않았는지 확인한다.
for bad in ("SHEET_ID", "docs.google.com/spreadsheets", "script.google.com"):
    if bad in html:
        sys.exit(f"시연본에 '{bad}' 가 들어 있습니다. 공개 배포를 멈춥니다.")

docs = root / "docs"
docs.mkdir(exist_ok=True)
(docs / "index.html").write_text(html, encoding="utf-8")
(docs / ".nojekyll").write_text("", encoding="utf-8")   # _ 로 시작하는 이름도 그대로 올리기
print(f"docs/index.html {len(html):,}자 · docs/.nojekyll")
