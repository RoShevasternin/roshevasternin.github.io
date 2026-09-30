# A picture → WebP for the site: python3 tools/webp.py <source> <assets/…/name.webp> [width] [quality]
# (new game icons: width 192; banners: 1024; the Lewydo heart: its full size). Keeps transparency.
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 0
q = int(sys.argv[4]) if len(sys.argv) > 4 else 86
im = Image.open(src)
im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
if w and im.width != w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
im.save(dst, 'WEBP', quality=q, method=6)
print(dst, im.size, round(__import__('os').path.getsize(dst) / 1024, 1), 'KB')
