# Round 7 preview page: fills preview7.template.html with the kit's pictures (brand/kit/webp) and the round-7 sounds
# (make_sound7.py → *.mp3 + timing7.json in the given folder; D4_game.mp3 is the sound as the game plays it now).
#   python3 tools/sonic/preview7.py <folder with the round-7 mp3> <out.html>      (from the repo root)
import base64, json, re, sys
src, out = sys.argv[1], sys.argv[2]
uri = lambda p, t: f"data:{t};base64," + base64.b64encode(open(p, 'rb').read()).decode()
s = open('tools/sonic/preview7.template.html', encoding='utf-8').read()
for k, f in {'BACK': 'brand_back', 'FRONT': 'brand_front', 'NAME': 'lewydo', 'SLOGAN': 'slogan', 'LINE': 'brand_line'}.items():
    s = s.replace(f'%{k}%', uri(f'brand/kit/webp/{f}.webp', 'image/webp'))
for k, f in {'ST': 'T_guitar_heart', 'SU': 'U_like_the_song', 'SV': 'V_acoustic', 'SW': 'W_home', 'SD4': 'D4_game'}.items():
    s = s.replace(f'%{k}%', uri(f'{src}/{f}.mp3', 'audio/mpeg'))
t = json.load(open(f'{src}/timing7.json'))
s = s.replace('%PRE%', json.dumps({k: t[k] for k in ('T', 'U', 'V', 'W', 'D4')}))
assert not re.search(r'%[A-Z0-9]+%', s), 'a placeholder is left'
open(out, 'w', encoding='utf-8').write(s)
print('ok', out, len(s) // 1024, 'KB')
