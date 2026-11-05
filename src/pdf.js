/* ===== v0.5.0 · gerador de PDF próprio, SHA-256 e imagens (sem biblioteca, funciona sem internet) ===== */
const HELV = __HELV__;
const CP1252 = "€\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8dŽ\x8f\x90‘’“”•–—˜™š›œ\x9džŸ";
const baitePdf = ch => { const c = ch.charCodeAt(0); if (c >= 32 && c < 127) return c; if (c >= 160 && c <= 255) return c; const i = CP1252.indexOf(ch); return i >= 0 ? 128 + i : 63; };
const corPdf = h => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h || "#000000") || [0, "00", "00", "00"]; return [1, 2, 3].map(i => (parseInt(m[i], 16) / 255).toFixed(3)).join(" "); };
const num2 = n => (Math.round(n * 100) / 100).toString();

/* SHA-256 síncrono (texto UTF-8 ou bytes). Devolve hexadecimal. */
const SHA_K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256(entrada) {
  const dados = typeof entrada === "string" ? new TextEncoder().encode(entrada) : entrada;
  const n = dados.length, tot = (((n + 9 + 63) >> 6) << 6), b = new Uint8Array(tot);
  b.set(dados); b[n] = 0x80;
  const dv = new DataView(b.buffer); dv.setUint32(tot - 8, Math.floor(n / 0x20000000)); dv.setUint32(tot - 4, (n << 3) >>> 0);
  const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], w = new Uint32Array(64);
  const rr = (x, k) => (x >>> k) | (x << (32 - k));
  for (let o = 0; o < tot; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = rr(w[i-15], 7) ^ rr(w[i-15], 18) ^ (w[i-15] >>> 3), s1 = rr(w[i-2], 17) ^ rr(w[i-2], 19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0; }
    let [a, b2, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (hh + S1 + ch + SHA_K[i] + w[i]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b2) ^ (a & c) ^ (b2 & c), t2 = (S0 + mj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b2; b2 = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b2) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0; h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  return h.map(x => x.toString(16).padStart(8, "0")).join("");
}

/* JPEG em data URL: lê tamanho e componentes para embutir no PDF */
function lerJpeg(url) {
  const m = /^data:image\/jpe?g;base64,(.+)$/i.exec(url || ""); if (!m) return null;
  let bin; try { bin = atob(m[1]); } catch (e) { return null; }
  const by = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i);
  let i = 2;
  while (i + 9 < by.length) {
    if (by[i] !== 0xFF) { i++; continue; }
    const mk = by[i + 1];
    if (mk >= 0xC0 && mk <= 0xCF && mk !== 0xC4 && mk !== 0xC8 && mk !== 0xCC) return {bytes: by, h: (by[i + 5] << 8) | by[i + 6], w: (by[i + 7] << 8) | by[i + 8], comp: by[i + 9]};
    i += 2 + ((by[i + 2] << 8) | by[i + 3]);
  }
  return null;
}

/* Reduz qualquer imagem do aparelho para JPEG pequeno (fundo branco). Devolve data URL. */
function imagemJpeg(arquivo, maxLado, qualidade) {
  return new Promise((ok, falha) => {
    const u = URL.createObjectURL(arquivo), im = new Image();
    im.onload = () => {
      try {
        const k = Math.min(1, maxLado / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
        const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
        x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
        URL.revokeObjectURL(u); ok(c.toDataURL("image/jpeg", qualidade));
      } catch (e) { URL.revokeObjectURL(u); falha(e); }
    };
    im.onerror = () => { URL.revokeObjectURL(u); falha(new Error("imagem")); };
    im.src = u;
  });
}

/* ---------- o documento ---------- */
function novoPdf(titulo) {
  const W = 595.28, H = 841.89, M = 40;
  const d = {W, H, M, titulo, pgs: [], ops: null, y: M, imgs: [], imgMap: new Map(), rodape: null, cab: null};
  d.larg = (s, tam, neg) => { let t = 0; const tb = HELV[neg ? "b" : "r"]; for (const ch of String(s)) { const b = baitePdf(ch); t += b >= 32 ? tb[b - 32] : 0; } return t * tam / 1000; };
  d.quebra = (s, lg, tam, neg) => {
    const out = []; String(s ?? "").split(/\r?\n/).forEach(par => {
      let lin = "";
      par.split(/\s+/).filter(Boolean).forEach(pal => {
        let p = pal;
        while (d.larg(p, tam, neg) > lg) { // palavra maior que a linha: corta
          let k = p.length; while (k > 1 && d.larg(p.slice(0, k), tam, neg) > lg) k--;
          if (lin) { out.push(lin); lin = ""; }
          out.push(p.slice(0, k)); p = p.slice(k);
        }
        const t = lin ? lin + " " + p : p;
        if (d.larg(t, tam, neg) <= lg) lin = t; else { if (lin) out.push(lin); lin = p; }
      });
      out.push(lin);
    });
    return out;
  };
  d.corta = (s, lg, tam, neg) => { s = String(s ?? ""); if (d.larg(s, tam, neg) <= lg) return s; while (s.length > 1 && d.larg(s + "…", tam, neg) > lg) s = s.slice(0, -1); return s + "…"; };
  d.nova = () => { d.ops = []; d.pgs.push(d.ops); d.y = M; if (d.cab && d.pgs.length > 1) d.cab(d); };
  d.garante = h => { if (d.y + h > H - 54) d.nova(); };
  d.texto = (x, y, s, o = {}) => {
    const tam = o.tam || 10, neg = !!o.neg; let t = String(s ?? ""); if (!t) return;
    const w = d.larg(t, tam, neg); if (o.al === "dir") x = x - w; else if (o.al === "cen") x = x - w / 2;
    const bytes = Array.from(t).map(ch => { const b = baitePdf(ch); return (b < 32 ? 63 : b); });
    const lit = bytes.map(b => (b === 40 || b === 41 || b === 92) ? "\\" + String.fromCharCode(b) : b > 126 ? "\\" + b.toString(8).padStart(3, "0") : String.fromCharCode(b)).join("");
    d.ops.push(`BT /${neg ? "F2" : "F1"} ${num2(tam)} Tf ${corPdf(o.cor)} rg ${num2(x)} ${num2(H - y)} Td (${lit}) Tj ET`);
  };
  d.par = (x, y, s, lg, o = {}) => { const tam = o.tam || 10, ent = o.ent || tam * 1.35; const ls = d.quebra(s, lg, tam, o.neg); ls.forEach((l, i) => d.texto(x, y + tam + i * ent, l, o)); return ls.length * ent; };
  d.linha = (x1, y1, x2, y2, o = {}) => d.ops.push(`${num2(o.esp || .6)} w ${corPdf(o.cor || "#9aa8a7")} RG ${num2(x1)} ${num2(H - y1)} m ${num2(x2)} ${num2(H - y2)} l S`);
  d.ret = (x, y, w, h, o = {}) => {
    const p = [];
    if (o.fundo) p.push(`${corPdf(o.fundo)} rg ${num2(x)} ${num2(H - y - h)} ${num2(w)} ${num2(h)} re f`);
    if (o.borda) p.push(`${num2(o.esp || .6)} w ${corPdf(o.borda)} RG ${num2(x)} ${num2(H - y - h)} ${num2(w)} ${num2(h)} re S`);
    d.ops.push(p.join(" "));
  };
  d.img = (url, x, y, w, h) => {
    const j = lerJpeg(url); if (!j) return false;
    let n = d.imgMap.get(url); if (n === undefined) { n = d.imgs.length; d.imgs.push(j); d.imgMap.set(url, n); }
    d.ops.push(`q ${num2(w)} 0 0 ${num2(h)} ${num2(x)} ${num2(H - y - h)} cm /Im${n} Do Q`); return true;
  };
  /* caixa de imagem dentro de w×h mantendo a proporção; devolve o tamanho usado */
  d.imgCabe = (url, x, y, w, h, al) => {
    const j = lerJpeg(url); if (!j) return null;
    const k = Math.min(w / j.w, h / j.h), ww = j.w * k, hh = j.h * k, xx = al === "cen" ? x + (w - ww) / 2 : x;
    d.img(url, xx, y + (h - hh) / 2, ww, hh); return {w: ww, h: hh};
  };
  /* tabela: cols = [{t, w, al}], linhas = [[cel,...]]; cel pode ser texto ou {img, h} ou {txt, neg, cor} */
  d.tabela = (cols, linhas, o = {}) => {
    const tam = o.tam || 9, pad = 4, x0 = M, total = cols.reduce((a, c) => a + c.w, 0), esc = (W - 2 * M) / total;
    const larguras = cols.map(c => c.w * esc);
    const cabeca = () => {
      d.garante(24); d.ret(x0, d.y, W - 2 * M, 18, {fundo: "#E2E9E8"});
      let x = x0; cols.forEach((c, i) => { d.texto(c.al === "dir" ? x + larguras[i] - pad : c.al === "cen" ? x + larguras[i] / 2 : x + pad, d.y + 12.5, c.t, {tam: 8, neg: true, cor: "#334", al: c.al}); x += larguras[i]; });
      d.y += 18;
    };
    cabeca();
    linhas.forEach(l => {
      const cel = l.map((c, i) => (c && typeof c === "object") ? c : {txt: String(c ?? "")});
      let alt = 0; const quebras = cel.map((c, i) => {
        if ("img" in c) { alt = Math.max(alt, (c.h || 24) + 2 * pad); return null; }
        const ls = d.quebra(c.txt, larguras[i] - 2 * pad, tam, c.neg).slice(0, o.maxLin || 4); alt = Math.max(alt, ls.length * tam * 1.3 + 2 * pad); return ls;
      });
      alt = Math.max(alt, 18);
      if (d.y + alt > H - 54) { d.nova(); cabeca(); }
      let x = x0;
      cel.forEach((c, i) => {
        const al = cols[i].al;
        if ("img" in c) { const bx = x + pad, bw = larguras[i] - 2 * pad; if (!d.imgCabe(c.img, bx, d.y + pad, bw, c.h || 24, "cen")) d.texto(x + larguras[i] / 2, d.y + alt / 2 + 3, c.vazio || "sem assinatura", {tam: 8, cor: "#8a9998", al: "cen"}); }
        else quebras[i].forEach((t, k) => d.texto(al === "dir" ? x + larguras[i] - pad : al === "cen" ? x + larguras[i] / 2 : x + pad, d.y + pad + tam + k * tam * 1.3 - 1, t, {tam, neg: c.neg, cor: c.cor, al}));
        x += larguras[i];
      });
      d.y += alt; d.linha(x0, d.y, W - M, d.y, {cor: "#d5dedd", esp: .5});
    });
    d.y += 6;
  };
  d.saida = () => {
    if (!d.pgs.length) d.nova();
    const N = d.pgs.length;
    if (d.rodape) d.pgs.forEach((ops, i) => { d.ops = ops; d.rodape(d, i + 1, N); });
    const partes = [], offs = []; let pos = 0;
    const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
    const add = p => { partes.push(p); pos += p.length; };
    const obj = (n, corpo) => { offs[n] = pos; add(enc(`${n} 0 obj\n${corpo}\nendobj\n`)); };
    const nImg = d.imgs.length, primeiraPg = 5 + nImg;
    add(enc("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, `<< /Type /Pages /Count ${N} /Kids [${d.pgs.map((_, i) => `${primeiraPg + i * 2} 0 R`).join(" ")}] >>`);
    obj(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    obj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    d.imgs.forEach((j, i) => {
      const n = 5 + i; offs[n] = pos;
      add(enc(`${n} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${j.w} /Height ${j.h} /ColorSpace /${j.comp === 1 ? "DeviceGray" : j.comp === 4 ? "DeviceCMYK" : "DeviceRGB"} /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.bytes.length} >>\nstream\n`)); add(j.bytes); add(enc("\nendstream\nendobj\n"));
    });
    const xobj = d.imgs.map((_, i) => `/Im${i} ${5 + i} 0 R`).join(" ");
    d.pgs.forEach((ops, i) => {
      const np = primeiraPg + i * 2, nc = np + 1, fluxo = ops.join("\n");
      obj(np, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num2(W)} ${num2(H)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${nImg ? ` /XObject << ${xobj} >>` : ""} >> /Contents ${nc} 0 R >>`);
      obj(nc, `<< /Length ${fluxo.length} >>\nstream\n${fluxo}\nendstream`);
    });
    const nInfo = primeiraPg + N * 2, total = nInfo, dt = new Date(), pd = n => String(n).padStart(2, "0");
    const dataPdf = `D:${dt.getUTCFullYear()}${pd(dt.getUTCMonth() + 1)}${pd(dt.getUTCDate())}${pd(dt.getUTCHours())}${pd(dt.getUTCMinutes())}${pd(dt.getUTCSeconds())}Z`;
    const lit = s => "(" + Array.from(String(s)).map(ch => { const b = baitePdf(ch); return (b === 40 || b === 41 || b === 92) ? "\\" + ch : b > 126 ? "\\" + b.toString(8).padStart(3, "0") : String.fromCharCode(b < 32 ? 63 : b); }).join("") + ")";
    obj(nInfo, `<< /Title ${lit(titulo)} /Producer ${lit("Sabiá " + VERSAO)} /Creator ${lit("Sabiá")} /CreationDate (${dataPdf}) >>`);
    const xref = pos; let x = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
    for (let n = 1; n <= total; n++) x += String(offs[n]).padStart(10, "0") + " 00000 n \n";
    add(enc(x + `trailer\n<< /Size ${total + 1} /Root 1 0 R /Info ${nInfo} 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
    const out = new Uint8Array(pos); let o = 0; partes.forEach(p => { out.set(p, o); o += p.length; });
    return out;
  };
  d.nova();
  return d;
}
