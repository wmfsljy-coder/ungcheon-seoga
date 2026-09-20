import sys,json,urllib.request
from concurrent.futures import ThreadPoolExecutor
reqs=json.loads(sys.stdin.buffer.read().decode("utf-8"))
def go(q):
    try:
        data=json.dumps(q["body"],ensure_ascii=False).encode() if q.get("body") else None
        h={"Accept":"application/json","User-Agent":"Mozilla/5.0"}
        if data:h["Content-Type"]="application/json"
        r=urllib.request.urlopen(urllib.request.Request(q["url"],data=data,headers=h,method=q.get("method","get").upper()),timeout=25)
        return {"code":r.status,"text":r.read().decode("utf-8")}
    except Exception as e:
        return {"code":0,"text":str(e)}
with ThreadPoolExecutor(8) as ex: out=list(ex.map(go,reqs))
sys.stdout.buffer.write(json.dumps(out,ensure_ascii=False).encode("utf-8"))
