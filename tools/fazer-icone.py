# Ícone do Sabiá: reforça os contornos do desenho e dá relevo ao fundo verde.
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage as ndi

SRC, OUT = sys.argv[1], sys.argv[2]
N = 2048                      # tamanho de trabalho
PETROL = np.array([14, 74, 72], float)   # #0E4A48 da identidade do Sabiá
rng = np.random.default_rng(7)

im = Image.open(SRC).convert("RGB")
im = im.crop((110, 30, 1300, 1220)).resize((N, N), Image.LANCZOS)
p = np.asarray(im, float)
R, G, B = p[..., 0], p[..., 1], p[..., 2]
bg0 = np.array([7, 63, 60], float)

# 1) separa o desenho do fundo: quanto mais "verde-azulado" o pixel, mais fundo
a = np.clip(1 - (G - R) / 56.0, 0, 1)
a = ndi.gaussian_filter(a, 0.6)
a = np.clip((a - 0.12) / 0.70, 0, 1)         # bordas das mechas mais nítidas
a = a * a * (3 - 2 * a)
g = (R - (1 - a) * bg0[0]) / np.maximum(a, 0.08)
g = np.clip(g, 0, 255)

# 2) contornos mais fortes: foco, linhas um pouco mais grossas e pretos mais fundos
bl = ndi.gaussian_filter(g, 1.6)
g = np.clip(g + 1.1 * (g - bl), 0, 255)                     # unsharp
g = 0.62 * g + 0.38 * ndi.minimum_filter(g, 3)              # engrossa o traço
t = g / 255.0
t = np.clip((t - 0.10) / 0.80, 0, 1)                         # preto mais preto, branco limpo
t = t * t * (3 - 2 * t)
t = 0.5 * t + 0.5 * t * t * (3 - 2 * t) if False else t
art = t * 255
# papel levemente quente nas áreas claras, sem sujeira
paper = np.stack([art * 0.995 + 1.2, art * 0.99 + 1.0, art * 0.965 + 0.8], -1)
paper = np.clip(paper, 0, 255)

# contorno escuro fino na silhueta do cabelo (ajuda a destacar do fundo)
sil = ndi.gaussian_filter(a, 2.0)
edge = np.clip(ndi.gaussian_filter(ndi.maximum_filter(a, 9), 2.2) - a, 0, 1)
edge = np.clip(edge * 1.15, 0, 1) * 0.55

# 3) fundo em relevo: altura = ruído em várias escalas + trama + medalhão
def ruido(s, amp):
    r = ndi.gaussian_filter(rng.standard_normal((N, N)), s)
    return amp * r / r.std()
H = ruido(48, 1.0) + ruido(18, 0.55) + ruido(6, 0.28) + ruido(1.6, 0.10)
yy, xx = np.mgrid[0:N, 0:N].astype(float)
trama = np.sin((xx + yy) * 0.20) * np.sin((xx - yy) * 0.20)         # tecido fino em diagonal
H += 0.10 * ndi.gaussian_filter(trama, 0.7)
cx, cy = N * 0.50, N * 0.47
d = np.hypot(xx - cx, yy - cy) / (N * 0.47)
disco = 1 / (1 + np.exp((d - 1.0) * 14))                            # medalhão elevado
anel = np.exp(-((d - 1.0) / 0.035) ** 2)                            # anel em relevo na borda
H = H * 0.55 + 7.0 * ndi.gaussian_filter(disco, 10) + 0.9 * anel
Hs = ndi.gaussian_filter(H, 1.2)
gy, gx = np.gradient(Hs)
luz = (-gx * 0.70 - gy * 0.72)                                      # luz de cima, à esquerda
luz = luz / np.percentile(np.abs(luz), 99)
sombra_base = 0.92 + 0.27 * np.clip(luz, -1.4, 1.4)
vinheta = 1.10 - 0.42 * np.clip((np.hypot(xx - N / 2, yy - N * 0.45) / (N * 0.78)), 0, 1) ** 1.7
fundo = PETROL[None, None, :] * (sombra_base * vinheta)[..., None]
fundo += np.array([1.2, 2.4, 2.0])[None, None, :] * np.clip(luz, 0, 1.4)[..., None] * 5   # brilho leve nos topos

# 4) sombra do desenho caindo no fundo (dá profundidade)
sh = ndi.shift(ndi.gaussian_filter(a, 16), (22, 16), order=1)
fundo *= (1 - 0.50 * np.clip(sh, 0, 1) * (1 - a))[..., None]

# 5) monta
a3 = a[..., None]
fundo = fundo * (1 - edge[..., None])  # contorno escuro por fora das mechas
out = paper * a3 + fundo * (1 - a3)
out = np.clip(out, 0, 255).astype(np.uint8)
Image.fromarray(out).save(OUT + "-grande.png")
Image.fromarray(out).resize((1024, 1024), Image.LANCZOS).save(OUT + "-1024.png")
