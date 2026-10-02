# Round 4 preview page: fills preview4.template.html with the kit's pictures (brand/kit/webp), the round-4 sounds
# (make_sound4.py → *.mp3 in the given folder; their first heartbeat sits at PRE4 = 0.40 s) and the current sound D
# (brand/kit/sound/lewydo-heartbeat.mp3, its first heartbeat at 0.03 s).
#   python3 tools/sonic/preview4.py <folder with K/L/M/N mp3> <out.html>      (from the repo root)
import base64, json, sys
src, out = sys.argv[1], sys.argv[2]
uri = lambda p, t: f"data:{t};base64," + base64.b64encode(open(p, 'rb').read()).decode()
s = open('tools/sonic/preview4.template.html', encoding='utf-8').read()
for k, f in {'BACK': 'brand_back', 'FRONT': 'brand_front', 'NAME': 'lewydo', 'SLOGAN': 'slogan', 'LINE': 'brand_line'}.items():
    s = s.replace(f'%{k}%', uri(f'brand/kit/webp/{f}.webp', 'image/webp'))
files = {'SN': 'N_heart_chord', 'SK': 'K_dawn', 'SM': 'M_strings', 'SL': 'L_tada'}
for k, f in files.items():
    s = s.replace(f'%{k}%', uri(f'{src}/{f}.mp3', 'audio/mpeg'))
pre = json.load(open(f'{src}/timing4.json'))['pre']
s = s.replace('%SD%', uri('brand/kit/sound/lewydo-heartbeat.mp3', 'audio/mpeg'))
s = s.replace('%PRE%', json.dumps({'N': pre, 'K': pre, 'M': pre, 'L': pre, 'D': 0.03}))
open(out, 'w', encoding='utf-8').write(s)
print('ok', out, len(s) // 1024, 'KB')
