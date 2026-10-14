"""Create the self-contained preview and a source + production delivery ZIP."""
from pathlib import Path
import base64, json, mimetypes, re, zipfile
root = Path(__file__).resolve().parent.parent
output = root.parent
assets = root / 'public' / 'assets'

def data_uri(path):
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    if path.suffix == '.woff2': mime = 'font/woff2'
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

media = {}
for p in assets.iterdir():
    if p.name == 'logo.png' or p.name.startswith(('client-', 'mark-')) or p.suffix == '.webp':
        media[p.name] = data_uri(p)
fonts = (assets / 'fonts.css').read_text()
fonts = re.sub(r'url\(/assets/([^)]+)\)', lambda m: 'url("'+data_uri(assets/m.group(1))+'")', fonts)
built = root/'dist'
html = (built/'index.html').read_text()
js_path = next((built/'assets').glob('index-*.js'))
css_path = next((built/'assets').glob('style-*.css'))
html = html.replace('<html lang="th">', '<html lang="th" data-standalone="true">')
html = re.sub(r'<script[^>]+src="/assets/[^\"]+"[^>]*></script>', '', html)
html = re.sub(r'<link[^>]+href="/assets/[^\"]+"[^>]*>', '', html)
html = html.replace('href="/favicon.svg"', 'href="'+data_uri(root/'public'/'favicon.svg')+'"')
html = html.replace('</head>', '<style>\n'+fonts+'\n'+css_path.read_text()+'\n</style>\n</head>')
js = js_path.read_text().replace('</script','<\\/script')
bootstrap = '<script>window.__PLAY_ASSETS__='+json.dumps(media,separators=(',',':'))+';</script>'
html = html.replace('</body>',bootstrap+'\n<script type="module">'+js+'</script>\n</body>')
preview = output/'Play-Digital-Preview.html'
preview.write_text(html)
# Build output in the ZIP remains available even though dist itself is ephemeral.
archive = output/'Play-Digital-Website.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    for name in ['README.md','package.json','package-lock.json','index.html','vite.config.ts','tsconfig.json','.gitignore']:
        z.write(root/name, 'play-digital/'+name)
    for directory in ['src','public','scripts']:
        for p in (root/directory).rglob('*'):
            if p.is_file():z.write(p,'play-digital/'+p.relative_to(root).as_posix())
    for p in built.rglob('*'):
        if p.is_file():z.write(p,'play-digital/production/'+p.relative_to(built).as_posix())
    z.write(preview, 'Play-Digital-Preview.html')
print('Self-contained preview:', preview, round(preview.stat().st_size/1024/1024,2),'MB')
print('Source + production ZIP:', archive, round(archive.stat().st_size/1024/1024,2),'MB')
