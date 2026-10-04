# The site's own copy of its fonts (SIL Open Font License, see assets/fonts/OFL.txt), so no visitor's browser asks
# Google Fonts for anything: Nunito — the Lewydo brand font (all text), in the Latin, Cyrillic and Vietnamese subsets;
# Unbounded Black — only the letters of the ORBIT DASH wordmark; Inter Medium — only the letters of the loader credits on the brand
# page («Powered by LibGDX / Developed by Lewydo™ / Version 1.0.0»). Run once, or to update: python3 tools/fetch-fonts.py
import re, subprocess, pathlib, tempfile
OUT = pathlib.Path(__file__).resolve().parents[1] / 'assets' / 'fonts'
OUT.mkdir(parents=True, exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
get = lambda url: subprocess.run(['curl', '-sSf', '-m', '30', '-A', UA, url], check=True, capture_output=True, text=True).stdout
css = get('https://fonts.googleapis.com/css2?family=Nunito:wght@400..1000&display=swap')
KEEP = {'latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'}
out = ['/* Nunito (the Lewydo brand font), the ORBIT DASH letters of Unbounded and the loader credits\' letters of Inter — SIL OFL 1.1 (OFL.txt); tools/fetch-fonts.py */']
for sub, body in re.findall(r'/\* ([\w-]+) \*/\s*(@font-face \{.*?\})', css, re.S):
    if sub not in KEEP: continue
    url = re.search(r'url\((https://[^)]+\.woff2)\)', body).group(1)
    name = f'nunito-{sub}.woff2'
    subprocess.run(['curl', '-sSf', '-m', '60', '-A', UA, '-o', str(OUT / name), url], check=True)
    out.append(f'/* {sub} */\n' + re.sub(r'\n\s+', '\n  ', body.replace(url, name)))
# Unbounded 900: just O R B I T D A S H, a couple of KB
u = re.search(r"url\((https://[^)]+)\) format\('woff2'\)", get('https://fonts.googleapis.com/css2?family=Unbounded:wght@900&text=ORBITDASH')).group(1)
with tempfile.TemporaryDirectory() as t:
    src = pathlib.Path(t) / 'u.woff2'; subprocess.run(['curl', '-sSf', '-m', '60', '-A', UA, '-o', str(src), u], check=True)
    subprocess.run(['pyftsubset', str(src), '--text=ORBIT DASH', '--flavor=woff2', f'--output-file={OUT / "unbounded-orbitdash.woff2"}'], check=True)
out.append("/* Unbounded Black, only the ORBIT DASH letters */\n@font-face {\n  font-family: 'Unbounded';\n  font-style: normal;\n  font-weight: 900;\n  font-display: swap;\n  src: url(unbounded-orbitdash.woff2) format('woff2');\n}")
# Inter 500: just the letters of the loader credits (the Lewydo standard), a few KB
CREDITS = 'Powered by LibGDX Developed by Lewydo™ Version 0123456789.'
u = re.search(r"url\((https://[^)]+)\) format\('woff2'\)", get('https://fonts.googleapis.com/css2?family=Inter:wght@500&text=' + ''.join(sorted(set(CREDITS))).replace(' ', '%20').replace('™', '%E2%84%A2'))).group(1)
with tempfile.TemporaryDirectory() as t:
    src = pathlib.Path(t) / 'i.woff2'; subprocess.run(['curl', '-sSf', '-m', '60', '-A', UA, '-o', str(src), u], check=True)
    subprocess.run(['pyftsubset', str(src), f'--text={CREDITS}', '--flavor=woff2', f'--output-file={OUT / "inter-credits.woff2"}'], check=True)
out.append("/* Inter Medium, only the letters of the loader credits */\n@font-face {\n  font-family: 'Inter';\n  font-style: normal;\n  font-weight: 500;\n  font-display: swap;\n  src: url(inter-credits.woff2) format('woff2');\n}")
(OUT / 'fonts.css').write_text('\n'.join(out) + '\n', encoding='utf8')
print('\n'.join(sorted(p.name + ' ' + str(p.stat().st_size) for p in OUT.glob('*.woff2'))))
