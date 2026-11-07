# Logotipo do Sabiá sem a moldura da foto: separa o desenho (cabelo e rosto) do fundo verde do original
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
SRC, OUT, LADO = sys.argv[1], sys.argv[2], int(sys.argv[3])
N = 1600
im = Image.open(SRC).convert("RGB").crop((110, 30, 1300, 1220)).resize((N, N), Image.LANCZOS)
p = np.asarray(im, float); R, G, B = p[..., 0], p[..., 1], p[..., 2]
bg0 = np.array([7, 63, 60], float)
a = np.clip(1 - (G - R) / 56.0, 0, 1)
a = ndi.gaussian_filter(a, 0.8)
a = np.clip((a - 0.15) / 0.65, 0, 1); a = a * a * (3 - 2 * a)
# tira ilhas soltas (manchas do papel) e fecha buracos pequenos dentro do desenho
m = a > 0.5
lab, n = ndi.label(m); tam = ndi.sum(m, lab, range(1, n + 1))
grande = np.isin(lab, 1 + np.flatnonzero(tam >= 0.02 * tam.max()))
grande = ndi.binary_fill_holes(ndi.binary_closing(grande, iterations=3))
a = a * ndi.gaussian_filter(grande.astype(float), 1.5)
# cor sem o verde que vazava nas bordas
g = np.clip((p - (1 - a[..., None]) * bg0) / np.maximum(a[..., None], 0.08), 0, 255)
cinza = g.mean(-1, keepdims=True); g = np.clip(0.85 * cinza + 0.15 * g, 0, 255)   # tinta preta e papel claro, sem tom verde
rgba = np.dstack([g, a * 255]).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")
bb = img.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
img = img.crop(bb); w, h = img.size; L = max(w, h)
quad = Image.new("RGBA", (L, L), (0, 0, 0, 0)); quad.paste(img, ((L - w) // 2, L - h))   # encosta embaixo (ombros na base)
quad.resize((LADO, LADO), Image.LANCZOS).save(OUT, optimize=True)
print(OUT, bb, (w, h))
