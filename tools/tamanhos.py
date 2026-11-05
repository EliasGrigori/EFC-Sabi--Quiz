from PIL import Image, ImageDraw
src=Image.open('ic-grande.png').convert('RGB')
def redond(im, r):
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,im.size[0]-1,im.size[1]-1),radius=int(im.size[0]*r),fill=255)
    o=im.convert('RGBA'); o.putalpha(m); return o
import os; os.makedirs('out',exist_ok=True)
for n,s,r in [('icon-512.png',512,0.2),('icon-192.png',192,0.2),('icon-maskable-512.png',512,0),('apple-touch-icon.png',180,0)]:
    im=src.resize((s,s),Image.LANCZOS)
    (redond(im,r) if r else im).save('out/'+n, optimize=True)
# comparação: original x novo e prévia pequena
o=Image.open('original.jpg').convert('RGB').crop((110,30,1300,1220)).resize((600,600),Image.LANCZOS)
n=src.resize((600,600),Image.LANCZOS)
c=Image.new('RGB',(1230,630),(246,244,240)); c.paste(o,(10,15)); c.paste(n,(620,15)); c.save('antes-depois.png')
