# Round 3 preview page: fills preview3.template.html with the kit's pictures (brand/kit/webp), the round-3 sounds
# (make_sound3.py → *.mp3 in the given folder) and the current sound D (brand/kit/sound/lewydo-heartbeat.mp3).
#   python3 tools/sonic/preview3.py <folder with G/H/I/J mp3> <out.html>      (from the repo root)
import base64, json, sys
src, out = sys.argv[1], sys.argv[2]
uri = lambda p, t: f"data:{t};base64," + base64.b64encode(open(p, 'rb').read()).decode()
s = open('tools/sonic/preview3.template.html', encoding='utf-8').read()
for k, f in {'BACK': 'brand_back', 'FRONT': 'brand_front', 'NAME': 'lewydo', 'SLOGAN': 'slogan', 'LINE': 'brand_line'}.items():
    s = s.replace(f'%{k}%', uri(f'brand/kit/webp/{f}.webp', 'image/webp'))
for k, f in {'SG': 'G_bum_bum', 'SH': 'H_tuk_tuk', 'SI': 'I_tuk_warm', 'SJ': 'J_warm_note'}.items():
    s = s.replace(f'%{k}%', uri(f'{src}/{f}.mp3', 'audio/mpeg'))
s = s.replace('%SD%', uri('brand/kit/sound/lewydo-heartbeat.mp3', 'audio/mpeg')).replace('%PRE%', json.dumps(0.03))
open(out, 'w', encoding='utf-8').write(s)
print('ok', out, len(s) // 1024, 'KB')
