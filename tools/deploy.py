"""웅천 서가: 고친 코드를 Apps Script 에 올리고 같은 주소로 새 버전 배포.
   사용: python tools/deploy.py "무엇을 고쳤는지"
   1) 판 표시(CODE_VERSION) 갱신  2) 문법 검사·시험  3) clasp push  4) 기존 웹 앱 배포를 새 버전으로  5) 앱 주소를 한 번 열어 뒷정리(firstRun) 예약"""
import re,sys,subprocess,datetime,urllib.request,json,time
from concurrent.futures import ThreadPoolExecutor
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
# 시험끼리는 서로 상관이 없으므로 한꺼번에 돌린다(가장 오래 걸리는 하나의 시간이면 끝난다)
t0=time.time()
files=sorted((root/"tools"/"tests").glob("*.js"))
def one(f):return f,run('node "'+str(f)+'"',check=False)
with ThreadPoolExecutor(max_workers=8) as ex:
    for f,out in ex.map(one,files):
        if ("Error" in out and "at " in out) or "✗" in out:
            print(out[-1500:]);sys.exit("시험 실패: "+f.name)
print("문법·시험 %d가지 통과 (%.0f초)"%(len(files),time.time()-t0))
run("python tools/build_demo.py")

# 3. 올리기
t1=time.time()
print(run("clasp push -f").strip().splitlines()[-1])

# 4. 같은 주소로 새 버전
deps=run("clasp deployments")
ids=[m.group(1) for m in re.finditer(r"-\s+(AKfy[\w-]+)\s+@(\d+)",deps)]
if ids:
    dep=ids[-1];run('clasp deploy -i '+dep+' -d "'+ver+' '+desc.replace('"',"'")+'"')
else:
    out=run('clasp deploy -d "'+ver+' '+desc.replace('"',"'")+'"');dep=re.search(r"(AKfy[\w-]+)",out).group(1)
url="https://script.google.com/macros/s/"+dep+"/exec"
print("배포: %s %s (올리기 %.0f초)"%(ver,url,time.time()-t1))

# 5. 앱을 한 번 열어 뒷정리 예약(액세스가 '모든 사용자'일 때)
try:
    code=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=60).status
    print("앱 열기:",code)
except Exception as e:
    print("앱 열기 실패(로그인 필요한 배포일 수 있음):",e)
(root/"tools"/"last_deploy.txt").write_text(ver+"\n"+url+"\n"+desc+"\n",encoding="utf-8")

# 6. 시트 갈이를 바로 시킨다(시계가 스스로 돌기를 1~2분 기다리지 않게)
key=(root/"tools"/".testkey");live=False
if key.exists():
    t3=time.time()
    try:
        m=json.loads(urllib.request.urlopen(urllib.request.Request(url+"?migrate="+key.read_text(encoding="utf-8").strip(),headers={"User-Agent":"Mozilla/5.0"}),timeout=300).read().decode("utf-8"))
        live=m.get("codeVer")==ver
        print("시트 갈이:",("끝 (%.0f초)"%(time.time()-t3)) if live else m)
    except Exception as ex:
        print("시트 갈이 부르기 실패(시계가 곧 대신 돕니다):",ex)

# 7. 새 판 표시가 바뀌었는지 확인
if not live and "--nowait" not in sys.argv:
    t2=time.time()
    for i in range(30):
        try:
            st=json.loads(urllib.request.urlopen(urllib.request.Request(url+"?status=1",headers={"User-Agent":"Mozilla/5.0"}),timeout=60).read().decode("utf-8"))
            if st.get("codeVer")==ver:
                print("새 판 확인: 시트 갈이 끝 (%.0f초)"%(time.time()-t2));break
        except Exception:
            pass
        time.sleep(10)
    else:
        print("아직 갈이 중입니다. 잠시 뒤 ?status=1 의 codeVer 를 확인하세요.")
