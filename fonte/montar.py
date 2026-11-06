"""Monta o Designar a partir das partes em src/.
   Saídas: saida/designacoes-vmc.html (versão de testes no Claude) e saida/site/ (o que vai para o GitHub Pages)."""
import os,shutil,json,subprocess,datetime,urllib.parse,sys
H=os.path.dirname(os.path.abspath(__file__));os.chdir(H)
def r(p):return open(os.path.join('src',p)).read()
agora=datetime.datetime.now(datetime.timezone.utc)-datetime.timedelta(hours=3)
VERSAO=os.environ.get('VERSAO') or agora.strftime('%Y.%m.%d-%H%M')
MARCA=r('marca.txt').strip()
def tok(s):return s.replace('%%MARCA%%',MARCA).replace('%%VERSAO%%',VERSAO)
js=[r('app/js/'+n) for n in r('app/js/ORDEM.txt').split()]
app=tok('\n'.join([r('app/00-cabecalho.html'),'<style>',r('app/01-estilo.css'),'</style>',r('app/02-corpo.html'),'<script>','\n'.join(js),'</script>','']))
boot=tok('\n'.join([r('entrada/libs.html'),'<script>',r('entrada/entrada.js'),'</script>','<style>',r('entrada/entrada.css'),'</style>','']))
os.makedirs('saida/site/lib/pdfjs',exist_ok=True)
open('saida/designacoes-vmc.html','w').write(app)
# bibliotecas no próprio site
L='../libs/node_modules/'
LIBS={'firebase-app-compat.js':L+'firebase/firebase-app-compat.js','firebase-auth-compat.js':L+'firebase/firebase-auth-compat.js','firebase-firestore-compat.js':L+'firebase/firebase-firestore-compat.js',
  'jspdf.umd.min.js':L+'jspdf/dist/jspdf.umd.min.js','jszip.min.js':L+'jszip/dist/jszip.min.js','xlsx.full.min.js':L+'xlsx/dist/xlsx.full.min.js',
  'pdfjs/pdf.min.js':L+'pdfjs-dist/build/pdf.min.js','pdfjs/pdf.worker.min.js':L+'pdfjs-dist/build/pdf.worker.min.js'}
for k,v in LIBS.items():shutil.copyfile(v,'saida/site/lib/'+k)
SUB=[('https://www.gstatic.com/firebasejs/10.14.1/','lib/'),('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/','lib/'),('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/','lib/'),
  ('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/','lib/'),('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/','lib/pdfjs/')]
s,b=app,boot
for a,c in SUB:s=s.replace(a,c);b=b.replace(a,c)
assert 'cdnjs' not in s and 'gstatic.com/firebasejs' not in b
CSP=("default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; "
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; "
  "img-src 'self' data: blob: https://*.googleusercontent.com https://www.gstatic.com https://www.google.com; "
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://apis.google.com https://fonts.googleapis.com https://fonts.gstatic.com; "
  "frame-src https://*.firebaseapp.com https://accounts.google.com https://apis.google.com; worker-src 'self' blob:; manifest-src 'self'; "
  "object-src 'none'; base-uri 'self'; form-action 'self'")
fav="data:image/svg+xml,"+urllib.parse.quote(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='#2F5249'/><path fill='white' transform='translate(4 4)' d='{MARCA}'/></svg>",safe="/:=' ")
head=f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Designar</title>
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<script>/* impede que o site seja aberto dentro de outra página (golpe de "clique falso") */if(window.top!==window.self){{document.documentElement.style.display='none';try{{window.top.location=window.self.location.href}}catch(e){{}}}}</script>
<meta name="theme-color" content="#2F5249">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Designar">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" href="{fav}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@1,300&display=swap">
<style>[hidden]{{display:none!important}}body{{margin:0}}img{{max-width:100%}}</style>
<script src="config.js"></script>
</head>
<body>
'''
open('saida/site/index.html','w').write(head+b+'\n'+s+'\n</body>\n</html>\n')
for f in ['404.html','sw.js','manifest.webmanifest','config.js']:open('saida/site/'+f,'w').write(tok(r('site/'+f)))
json.dump({'versao':VERSAO},open('saida/site/versao.json','w'))
shutil.copyfile('src/firestore.rules','saida/firestore.rules')
if os.path.exists('LEIAME.md'):shutil.copyfile('LEIAME.md','saida/site/LEIAME.md')
if '--sem-icones' not in sys.argv:subprocess.run(['node','icones_designar.js',os.path.abspath('saida/site')],check=True,cwd='../vmc')
# cópias para os testes antigos e para o artifact
V='../vmc/';open(V+'designacoes-vmc.html','w').write(app)
os.makedirs(V+'entrega/site',exist_ok=True)
for f in os.listdir('saida/site'):
    p='saida/site/'+f
    if os.path.isdir(p):shutil.copytree(p,V+'entrega/site/'+f,dirs_exist_ok=True)
    else:shutil.copyfile(p,V+'entrega/site/'+f)
print('versão',VERSAO,'| index',len(head+b+s),'bytes')
