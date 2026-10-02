# Round 6 preview page: fills preview6.template.html with the kit's pictures (brand/kit/webp), the round-6 sounds
# (make_sound6.py → *.mp3 in the given folder; D's own timing: the first heartbeat 0.03 s in) and the current sound D
# (brand/kit/sound/lewydo-heartbeat.mp3, its first heartbeat at 0.03 s too).
#   python3 tools/sonic/preview6.py <folder with D0–D4 mp3> <out.html>      (from the repo root)
import base64, json, sys
src, out = sys.argv[1], sys.argv[2]
uri = lambda p, t: f"data:{t};base64," + base64.b64encode(open(p, 'rb').read()).decode()
s = open('tools/sonic/preview6.template.html', encoding='utf-8').read()
for k, f in {'BACK': 'brand_back', 'FRONT': 'brand_front', 'NAME': 'lewydo', 'SLOGAN': 'slogan', 'LINE': 'brand_line'}.items():
    s = s.replace(f'%{k}%', uri(f'brand/kit/webp/{f}.webp', 'image/webp'))
files = {'S0': 'D0_bum_bum', 'S1': 'D1_bum_glow', 'S2': 'D2_bum_phone', 'S3': 'D3_bum_deep', 'S4': 'D4_bum_soft'}
for k, f in files.items():
    s = s.replace(f'%{k}%', uri(f'{src}/{f}.mp3', 'audio/mpeg'))
pre = json.load(open(f'{src}/timing6.json'))['pre']
s = s.replace('%SD%', uri('brand/kit/sound/lewydo-heartbeat.mp3', 'audio/mpeg'))
s = s.replace('%PRE%', json.dumps({'D0': pre, 'D1': pre, 'D2': pre, 'D3': pre, 'D4': pre, 'D': 0.03}))
open(out, 'w', encoding='utf-8').write(s)
print('ok', out, len(s) // 1024, 'KB')
