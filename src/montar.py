import sys
d=sys.argv[1]; r=lambda f: open(d+"/"+f,encoding="utf8").read()
h=r("src/index.html")
h=h.replace("/*__LIVE_CSS__*/",r("src/live.css")).replace("/*__EDIT_CSS__*/",r("src/editor.css")).replace("/*__EDIT_JS__*/",r("src/editor.js")).replace("/*__LIVE_JS__*/",r("src/live.js")).replace("/*__QR__*/",r("src/qrcode.js")).replace("__MODELOS__",r("modelos.json"))
open(d+"/dist/index.html","w",encoding="utf8").write(h)
