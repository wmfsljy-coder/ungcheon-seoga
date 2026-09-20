"""웅천 서가: 고친 코드를 Apps Script 에 올리고 같은 주소로 새 버전 배포.
   사용: python tools/deploy.py "무엇을 고쳤는지"
   1) 판 표시(CODE_VERSION) 갱신  2) 문법 검사·시험  3) clasp push  4) 기존 웹 앱 배포를 새 버전으로  5) 앱 주소를 한 번 열어 뒷정리(firstRun) 예약"""
import re,sys,subprocess,datetime,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parent.parent
def run(cmd,check=True):
    p=subprocess.run(cmd,cwd=root,shell=True,capture_output=True,text=True,encoding="utf-8",errors="replace")
    out=(p.stdout or "")+(p.stderr or "")
    if check and p.returncode!=0:
        print(out);sys.exit("실패: "+cmd)
    return out
desc=(sys.argv[1] if len(sys.argv)>1 else "업데이트")[:90]
ver=datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

# 1. 판 표시
g=root/"Code.gs";t=g.read_text(encoding="utf-8")
t=re.sub(r'var CODE_VERSION="[^"]*";','var CODE_VERSION="'+ver+'";',t,count=1);g.write_text(t,encoding="utf-8")

# 2. 문법 검사 + 시험
run('node -e "const fs=require(\'fs\');new Function(fs.readFileSync(\'core.gs\',\'utf8\'));new Function(fs.readFileSync(\'Code.gs\',\'utf8\'));'
    'const s=fs.readFileSync(\'index.html\',\'utf8\');new Function(s.slice(s.lastIndexOf(\'<script>\')+8,s.lastIndexOf(\'</script>\')));"')
for f in sorted((root/"tools"/"tests").glob("*.js")):
    out=run('node "'+str(f)+'"',check=False)
    if "Error" in out and "at " in out:print(out[-1500:]);sys.exit("시험 실패: "+f.name)
print("문법·시험 통과")
run("python tools/build_demo.py")

# 3. 올리기
print(run("clasp push -f").strip().splitlines()[-1])

# 4. 같은 주소로 새 버전
deps=run("clasp deployments")
ids=[m.group(1) for m in re.finditer(r"-\s+(AKfy[\w-]+)\s+@(\d+)",deps)]
if ids:
    dep=ids[-1];run('clasp deploy -i '+dep+' -d "'+ver+' '+desc.replace('"',"'")+'"')
else:
    out=run('clasp deploy -d "'+ver+' '+desc.replace('"',"'")+'"');dep=re.search(r"(AKfy[\w-]+)",out).group(1)
url="https://script.google.com/macros/s/"+dep+"/exec"
print("배포:",ver,url)

# 5. 앱을 한 번 열어 뒷정리 예약(액세스가 '모든 사용자'일 때)
try:
    code=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=60).status
    print("앱 열기:",code)
except Exception as e:
    print("앱 열기 실패(로그인 필요한 배포일 수 있음):",e)
(root/"tools"/"last_deploy.txt").write_text(ver+"\n"+url+"\n"+desc+"\n",encoding="utf-8")
