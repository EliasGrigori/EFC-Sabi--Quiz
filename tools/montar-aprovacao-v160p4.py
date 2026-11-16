# monta a página de aprovação da v1.6.0 parte 4 (P1, P2 e Fatia E). uso: python3 montar-aprovacao-v160p4.py
import json, html, os, re
D = '/home/claude/sabia/entregas/v1.6.0-parte4/aprovacao'
N = json.load(open('/tmp/numeros-v160p4.json'))
e = html.escape

def fig(arq, alt, tag, d=False):
    return f'<div class="lado"><span class="tag{" d" if d else ""}">{e(tag)}</span><figure><button class="zoom" aria-label="Ampliar"><img src="img/{arq}.webp" alt="{e(alt)}" loading="lazy"></button></figure></div>'
def par(a, d, alt_a, alt_d, cel=False, ta='Antes (parte 2)', td='Depois (parte 3)'):
    return f'<div class="par{" cel" if cel else ""}">{fig(a, alt_a, ta)}{fig(d, alt_d, td, True)}</div>'
def so(lista, cel=False):
    return f'<div class="par{" cel" if cel else ""}">' + ''.join(fig(a, alt, t, True) for a, alt, t in lista) + '</div>'
def vid(arq, leg):
    return f'<figure><video src="vid/{arq}.mp4" controls muted playsinline loop preload="metadata"></video><figcaption>{e(leg)}</figcaption></figure>'

ITENS = [
 ('Colaborador consulta Pendências, sem botões (P1)', 'Como você escolheu: o perfil Colaborador agora abre <b>Pendências</b> (no menu e na barra de baixo do celular) e vê reforço, reavaliação e validade, com o aviso "Só para consultar". Os botões "Aplicar reforço/reavaliação/renovação" e "Dar baixa" não aparecem, e as duas ações também ficam barradas no código: mesmo forçando, nada é registrado. Primário e Líder estrela continuam iguais.',
  par('a-pc-pendencias-colab', 'd-pc-pendencias-colab', 'Antes: o Colaborador voltava ao Início', 'Depois: Pendências só para consultar', ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Colaborador também não mexe no relatório', 'O revisor achou a mesma falha no relatório da sessão: o Colaborador conseguia remover ou trocar a foto da turma (a evidência do PDF) e via "Reaplicar" e "Aplicar pós-teste". Agora esses botões não aparecem para ele e as ações ficam barradas no código. Ele continua vendo o relatório, os PDFs e a folha de reforço.',
  ''),
 ('"Código de autenticação" (P2)', 'Como você escolheu: "código de conferência" virou <b>código de autenticação</b> no relatório, na tela Autenticar documento, na planilha e no rodapé dos 3 PDFs. Na mesma tela, o botão virou "Autenticar" e o resultado certo diz "Documento autêntico". O código é o mesmo: os PDFs antigos continuam autenticando.',
  par('a-pc-codigo', 'd-pc-codigo', 'Relatório antes', 'Relatório depois', ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-pc-autenticar', 'd-pc-autenticar', 'Autenticar documento antes', 'Autenticar documento depois', ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Telão nas cores da família EFC', 'O telão deixa o verde-petróleo antigo e passa ao azul-noite com dourado (tema escuro) ou ao marfim com dourado (tema claro), como o resto do app. O tema continua sendo escolhido na sessão, independente do tema do app. As letras ficaram numa escala de 6 tamanhos (antes até 8 por tela) e os cantos de 2 tipos (antes até 4).',
  par('a-telao-escuro-espera', 'd-telao-escuro-espera', 'Espera antes', 'Espera depois', ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-telao-escuro-explicacao', 'd-telao-escuro-explicacao', 'Explicação antes', 'Explicação depois', ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Chave sem maiúsculas espaçadas', 'A chave do canto do telão dizia "CHAVE 123 456" em maiúsculas espaçadas, que as regras proíbem. Agora diz "Chave 123 456", num selo dourado suave. O número grande da espera não mudou.',
  par('a-telao-escuro-pergunta', 'd-telao-escuro-pergunta', 'Pergunta antes (veja o canto de cima)', 'Pergunta depois', ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Amarelo com letra escura', 'As 4 cores e formas das alternativas não mudaram. Só a letra sobre o <b>amarelo</b> ficou escura: em branco, o contraste era 2,8 (o mínimo é 3 para letra grande), difícil de ler de longe. Vale para o telão e para o celular.',
  par('a-telao-claro-pergunta', 'd-telao-claro-pergunta', 'Telão claro antes', 'Telão claro depois', ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-cel-claro-pergunta', 'd-cel-claro-pergunta', 'Celular antes', 'Celular depois', True, ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Resultado: véu nas erradas e contorno na certa', 'Antes, as erradas ficavam apagadas inteiras, e o texto delas caía para contraste 1,5 a 2,2. Agora elas ganham um véu da cor do fundo, e o texto continua legível. A certa ganha um contorno (branco no escuro, escuro no claro e no modo Projetor). Na revelação, o véu sobe em 350 ms e a letra das erradas some e volta já na cor nova.',
  par('a-telao-escuro-resultado', 'd-telao-escuro-resultado', 'Resultado escuro antes', 'Resultado escuro depois', ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-telao-claro-resultado', 'd-telao-claro-resultado', 'Resultado claro antes', 'Resultado claro depois', ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('"Conferindo" com três pontos, sem roda girando', 'A roda que girava sem parar (contra a regra "nada infinito") virou três pontos que acendem uma vez, um a cada 350 ms, e ficam acesos. Vale para o telão, para o celular e para o "Conectando à sala". Se o telão for redesenhado no meio (uma resposta atrasada chegando), os pontos continuam de onde estavam.',
  par('a-telao-escuro-conferindo', 'd-telao-escuro-conferindo', 'Conferindo antes', 'Conferindo depois', ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-cel-claro-conferindo', 'd-cel-claro-conferindo', 'Celular antes', 'Celular depois', True, ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Pódio: barras crescem e blocos sobem', 'No resultado da turma, as barras por pergunta crescem (500 ms, em sequência) e os blocos do pódio sobem: 3º, depois 2º e por último o 1º, com o bicho aparecendo em cima. O nome nos blocos tem até 2 linhas, então nomes longos não saem do bloco.',
  par('a-telao-escuro-podio', 'd-telao-escuro-podio', 'Pódio antes', 'Pódio depois', ta='Antes (parte 3)', td='Depois (parte 4)') + vid('d-v-telao-escuro', 'App de verdade: telão escuro do começo ao pódio (espera, alguém entra, pergunta, conferindo, resultado, pódio)')),
 ('Festa do pódio que sai uma vez', 'O confete caía sem parar enquanto o pódio estivesse na tela (contra a regra "nada infinito" e com 3,6 s, fora da escala de durações). Agora, com o som ligado, os papéis coloridos saem uma vez de cima do bloco do 1º lugar e somem (500 ms cada). Sem som, não há festa, como antes.',
  vid('d-v-telao-claro', 'App de verdade: telão claro; a festa aparece no fim, depois que o 1º lugar sobe')),
 ('Movimento do telão só quando a etapa muda', 'O telão é redesenhado a cada novidade (alguém entra, alguém responde). Agora a entrada só acontece quando a etapa muda: a pergunta entra e as 4 alternativas aparecem em sequência (40 ms entre elas). Na mesma etapa, só o chip de quem acabou de entrar aparece suave; o resto não pisca. Com "movimento reduzido", nada anima.',
  vid('d-v-telao-escuro', 'App de verdade: o mesmo vídeo do item 9 (veja a espera e a pergunta)')),
 ('Celular do participante no padrão EFC', 'No celular, os cantos ficaram da família (10 e 7 px, antes havia até 5 tipos por tela) e as alternativas passaram de 18 para 19 px. A letra branca no verde ficava com contraste de 4,48. Com 19 px em negrito ela conta como letra grande, e passa. Botões de toque com 44 px ou mais, sem rolagem para o lado.',
  par('a-cel-claro-resultado', 'd-cel-claro-resultado', 'Resultado antes', 'Resultado depois', True, ta='Antes (parte 3)', td='Depois (parte 4)') + par('a-cel-claro-fim', 'd-cel-claro-fim', 'Fim antes', 'Fim depois', True, ta='Antes (parte 3)', td='Depois (parte 4)')),
 ('Movimento do celular quando a tela muda', 'Quando a tela do celular muda (sala, pergunta, enviada, conferindo, resultado), ela entra suave. As alternativas aparecem em sequência e o visto do resultado aparece crescendo. Tocar numa alternativa dá um leve afundar (80 ms). Se a tela for redesenhada sem mudar (alguém entrou na sala), nada recomeça.',
  vid('d-v-cel-escuro', 'App de verdade: celular escuro do nome ao resultado') + vid('d-v-cel-claro', 'App de verdade: celular claro')),
]

PERGS = [
 ('P1', 'Festa do pódio quando a turma ficou abaixo da meta', 'Hoje, com o som ligado, a festa sai sempre no pódio, mesmo quando o título diz "A turma ficou abaixo da meta" (isso já era assim antes). Como prefere?', ['Manter: a festa celebra quem ficou no pódio', 'Só fazer a festa quando a turma bate a meta']),
 ('P2', 'Próxima tarefa', 'Com a Fatia E, todas as fatias do revamp (A a E) estão feitas. O que vem agora?', ['Ligar o GitHub e publicar o que já foi aprovado', 'v1.5.3 (sala ao vivo que sobe sozinha e bichos que piscam)', 'Estabilizar a v1.6.0 (só correções e revisão total)']),
]

REV = [
 ('Importante', 'Os pontos do "Conferindo" voltavam a ficar apagados quando o telão era redesenhado (uma resposta atrasada já redesenha).', 'Corrigido: um redesenho no meio continua as animações de onde estavam. Há teste novo.'),
 ('Importante', 'Os papéis da festa saíam da base do pódio, não de cima do 1º lugar.', 'Corrigido: o topo é calculado pela altura real do bloco. Há teste novo.'),
 ('Importante', 'No modo Projetor com o telão escuro, o contorno branco da certa sumia no fundo branco.', 'Corrigido: o contorno é preto no Projetor. Há teste novo.'),
 ('Importante', 'Pódio com nomes longos: o texto saía dos blocos do 2º e do 3º lugar.', 'Corrigido: o nome tem 18 px e até 2 linhas, e o número tem 28 px. Medido com os nomes do revisor: os três blocos cabem (antes o 3º passava 60 px).'),
 ('Importante', 'O Colaborador ainda podia remover ou trocar a foto da turma, e via Reaplicar e Pós-teste no relatório.', 'Corrigido (item 2): botões escondidos e ações barradas no código. Há teste novo.'),
 ('Importante', 'Cores escritas direto no CSS (barra do telão, letra no amarelo, número nas alternativas).', 'Corrigido: viraram cores nomeadas no arquivo de cores.'),
 ('Importante', 'O teste e a varredura não pegariam os achados 1 a 4.', 'Corrigido: a varredura mede o "Conferindo" a tempo e conta o véu no contraste. O teste cobre redesenho no "Conferindo" e no pódio, o Projetor, o "Conectando" de verdade (com a rede atrasada) e o texto exato da chave.'),
 ('Detalhe', 'Na revelação, a cor da letra das erradas trocava seca.', 'Corrigido: a letra e a porcentagem das erradas somem e voltam (250 ms) enquanto o véu sobe.'),
 ('Detalhe', 'Uma novidade durante o pódio cortava a animação (blocos pulavam).', 'Corrigido: elas continuam de onde estavam. Há teste novo.'),
 ('Detalhe', 'Na prévia do telão (Editor e Sala), os pontos ficavam sempre apagados.', 'Corrigido: aceso é o estado normal; só a animação começa apagada.'),
 ('Detalhe', '"Não consegui conectar" mostrava os pontos de "aguarde".', 'Corrigido: os pontos saem nessa tela.'),
 ('Detalhe', 'O chip novo era reconhecido só pelo primeiro nome (uma segunda Maria entrava sem movimento).', 'Corrigido: usa o nome inteiro.'),
 ('Detalhe', 'O texto da chave ficava "Chave389 888" para o leitor de tela e para copiar.', 'Corrigido: tem um espaço de verdade. Há teste novo.'),
 ('Detalhe', 'Textos de Pendências para o Colaborador falavam só de reforço, e a aba vazia mandava abrir o editor.', 'Corrigido: o aviso vale para as 3 abas, e a aba vazia diz quem configura.'),
 ('Detalhe', 'A tela Autenticar documento ainda tinha o botão "Conferir" e o resultado "Registro confere".', 'Corrigido: "Autenticar" e "Documento autêntico".'),
 ('Detalhe', 'A festa toca mesmo com "A turma ficou abaixo da meta" (já era assim).', 'Virou a pergunta P1.'),
]
def numeros():
    v, fe, r = N['visual'], N['fe'], N['rapidez']
    lin = [
      ('Telão: tamanhos de letra por tela (máximo; soma das 18 telas)', 'até 7', f"{fe['tamanhos_telão'][0]} (soma {fe['tamanhos_telão'][2]})", f"{fe['tamanhos_telão'][1]} (soma {fe['tamanhos_telão'][3]})"),
      ('Telão: tipos de canto (máximo; soma)', 'até 3 + círculo', f"{fe['cantos_telão'][0]} (soma {fe['cantos_telão'][2]})", f"{fe['cantos_telão'][1]} (soma {fe['cantos_telão'][3]})"),
      ('Telão: textos abaixo do contraste (máximo; soma)', '0', f"{fe['contraste_telão'][0]} (soma {fe['contraste_telão'][2]})", f"{fe['contraste_telão'][1]} (soma {fe['contraste_telão'][3]})"),
      ('Telão: animações infinitas', '0', str(fe['infinitas_telão'][0]), str(fe['infinitas_telão'][1])),
      ('Celular: tamanhos de letra por tela (máximo; soma das 18 telas)', 'até 7', f"{fe['tamanhos_celular'][0]} (soma {fe['tamanhos_celular'][2]})", f"{fe['tamanhos_celular'][1]} (soma {fe['tamanhos_celular'][3]})"),
      ('Celular: tipos de canto (máximo; soma)', 'até 3 + círculo', f"{fe['cantos_celular'][0]} (soma {fe['cantos_celular'][2]})", f"{fe['cantos_celular'][1]} (soma {fe['cantos_celular'][3]})"),
      ('Celular: textos abaixo do contraste (soma)', '0', str(fe['contraste_celular'][2]), str(fe['contraste_celular'][3])),
      ('Celular: animações infinitas (fora o reflexo do botão dourado)', '0', str(fe['infinitas_celular'][0]), str(fe['infinitas_celular'][1])),
      ('Telão e celular: botões de toque abaixo de 44 px, rolagem para o lado, telão que transborda', '0', '0', '0'),
      ('Telão e celular: medidas que pioraram em alguma das 36 telas', '0', '–', str(len(fe['piorou']))),
      ('Resto do app: medidas que pioraram em alguma das 84 telas', '0', '–', str(len(v['piorou']))),
      ('Resto do app: textos abaixo do contraste e erros no console', '0', '0', '0'),
      ('Abrir o app (mediana de 3 rodadas; normal / 4× mais lento)', 'abaixo de 3 s', f"{r['a'][0]} / {r['a'][1]} ms", f"{r['d'][0]} / {r['d'][1]} ms"),
      ('Trocar de tela (normal / 4× mais lento)', 'abaixo de 100 ms', f"{r['a'][2]} / {r['a'][3]} ms", f"{r['d'][2]} / {r['d'][3]} ms"),
      ('Trocar o tema (normal / 4× mais lento)', 'abaixo de 100 ms', f"{r['a'][4]} / {r['a'][5]} ms", f"{r['d'][4]} / {r['d'][5]} ms"),
      ('Redesenhar o telão (normal / 4× mais lento)', 'abaixo de 100 ms', '1,0 / 4,5 ms', '1,0 / 5,6 ms'),
      ('Tamanho do app (index.html)', 'sem crescer à toa', f"{r['a'][6]} KB", f"{r['d'][6]} KB"),
    ]
    return '<div class="tw"><table><thead><tr><th>Medida</th><th>Meta</th><th>Antes (parte 3)</th><th>Depois (parte 4)</th></tr></thead><tbody>' + ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td><td><b>{d}</b></td></tr>' for a, b, c, d in lin) + '</tbody></table></div>'

itens_html = ''
for i, (nome, txt, corpo) in enumerate(ITENS, 1):
    itens_html += f'''<section class="card item" data-item="{i}" data-nome="{e(nome)}"><div class="ihead"><div class="inum">{i}<small>ITEM</small></div><div><h2>{e(nome)}</h2></div></div>
<p>{txt}</p>{corpo}
<div class="dec"><div class="bts"><button class="bt ap" aria-pressed="false"><svg><use href="#i-ok"/></svg>Aprovado</button><button class="bt rp" aria-pressed="false"><svg><use href="#i-no"/></svg>Reprovado</button></div><textarea placeholder="Comentário (opcional)" aria-label="Comentário do item {i}"></textarea></div></section>
'''
pergs_html = ''.join(f'''<div class="perg" data-perg="{k}" data-nome="{e(t)}"><h3>{k} · {e(t)}</h3><p class="mut">{e(d)}</p><div class="bts">{''.join(f'<button class="bt op" aria-pressed="false">{e(o)}</button>' for o in ops)}</div><textarea placeholder="Comentário (opcional)" aria-label="Comentário da pergunta {k}"></textarea></div>''' for k, t, d, ops in PERGS)
rev_html = ''.join(f'<tr><td>{n}</td><td><span class="gr {g[0].lower()}">{g}</span></td><td>{e(a)}</td><td>{e(r)}</td></tr>' for n, (g, a, r) in enumerate(REV, 1))
T = N['testes']

pagina = f'''<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sabiá v1.6.0 parte 4 para aprovar</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
:root{{--bg:#f7f5ef;--surface:#fffefb;--sunk:#f2eee4;--ink:#1e1b14;--ink2:#5b5443;--line:#e6dfcf;--a:#9a7128;--aTx:#7d5a1c;--aS:rgba(154,113,40,.12);--ok:#2f7d4f;--okS:rgba(47,125,79,.12);--cr:#b33a32;--crS:rgba(179,58,50,.11);--wa:#9a6a0c;--waS:rgba(154,106,12,.13);--ouro:linear-gradient(135deg,#f7df9e 0%,#d9b46a 42%,#b4862f 100%);--sh:0 1px 2px rgba(40,30,10,.06),0 4px 14px rgba(40,30,10,.05)}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0b0d16;--surface:#121524;--sunk:#181c2e;--ink:#f3eee3;--ink2:#bcb3a1;--line:#2a2b3b;--a:#d9b46a;--aTx:#f0d48f;--aS:rgba(217,180,106,.15);--ok:#7fbf98;--okS:rgba(127,191,152,.14);--cr:#e38b7d;--crS:rgba(227,139,125,.14);--wa:#e2b55f;--waS:rgba(226,181,95,.14);--sh:inset 0 1px 0 rgba(217,180,106,.10);color-scheme:dark}}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Source Sans 3",system-ui,sans-serif;padding:28px max(16px,env(safe-area-inset-right,0px)) 120px max(16px,env(safe-area-inset-left,0px))}}
main{{max-width:1000px;margin:0 auto;display:grid;gap:22px}}
h1,h2,h3{{font-family:Fraunces,Georgia,serif;font-weight:600;line-height:1.15;text-wrap:balance;margin:0}}
h1{{font-size:clamp(28px,5vw,38px)}}h2{{font-size:23px}}h3{{font-size:18px}}
p{{margin:0}}.mut{{color:var(--ink2)}}
.hero{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:24px;display:grid;gap:10px;box-shadow:var(--sh)}}
.hero h1{{position:relative;padding-bottom:8px}}.hero h1::after{{content:"";position:absolute;left:0;bottom:0;width:48px;height:2px;background:var(--a)}}
.eb{{color:var(--aTx);font-weight:600;font-size:15px}}
.card{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:22px;display:grid;gap:14px;min-width:0;box-shadow:var(--sh)}}
.ihead{{display:flex;gap:16px;align-items:center}}
.inum{{font:600 56px/1 Fraunces,serif;color:var(--aTx);min-width:72px;display:grid;justify-items:center}}
.inum small{{font:600 13px "Source Sans 3",sans-serif;color:var(--ink2)}}
.par{{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}}
.par.cel{{grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),260px));justify-content:start}}
.lado{{display:grid;gap:6px;align-content:start;min-width:0}}
figure{{margin:0;display:grid;gap:6px;min-width:0}}
.zoom{{all:unset;cursor:zoom-in;display:block;border-radius:7px;overflow:hidden;background:var(--sunk);box-shadow:0 0 0 1px var(--line);transition:transform 150ms cubic-bezier(.22,1,.36,1)}}
.zoom:hover{{transform:translateY(-2px)}}.zoom:focus-visible{{outline:3px solid var(--a);outline-offset:2px}}
.zoom img{{width:100%;height:auto;display:block}}
video{{width:100%;border-radius:7px;background:#000;display:block;box-shadow:0 0 0 1px var(--line)}}
figcaption{{font-size:14px;color:var(--ink2)}}
.tag{{display:inline-block;font-size:13px;font-weight:600;padding:1px 8px;border-radius:5px;background:var(--sunk);color:var(--ink2);width:max-content}}
.tag.d{{background:var(--aS);color:var(--aTx)}}
ul{{margin:0;padding-left:20px;display:grid;gap:6px}}
table{{border-collapse:collapse;width:100%;font-size:15px}}th,td{{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}}th{{color:var(--ink2);font-weight:600}}
.tw{{overflow-x:auto}}
.gr{{font-size:13px;font-weight:600;padding:1px 8px;border-radius:5px;white-space:nowrap}}.gr.b{{background:var(--crS);color:var(--cr)}}.gr.i{{background:var(--waS);color:var(--wa)}}.gr.d{{background:var(--sunk);color:var(--ink2)}}
.dec,.perg{{display:grid;gap:10px;background:var(--sunk);border-radius:10px;padding:14px}}
.bts{{display:flex;gap:10px;flex-wrap:wrap;align-items:center}}
.bt{{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:7px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:600 15px "Source Sans 3",sans-serif;cursor:pointer;transition:transform 80ms cubic-bezier(.22,1,.36,1)}}
.bt:active{{transform:scale(.97)}}.bt svg{{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}}
.bt.ap[aria-pressed=true]{{background:var(--ok);border-color:var(--ok);color:#fff}}
.bt.rp[aria-pressed=true]{{background:var(--cr);border-color:var(--cr);color:#fff}}
.bt.op[aria-pressed=true]{{background:var(--aS);border-color:var(--a);color:var(--aTx)}}
.bt.pri{{background:var(--ouro);border-color:#c99d48;color:#1c1406}}
.bt:focus-visible{{outline:3px solid var(--a);outline-offset:2px}}
textarea{{width:100%;min-height:64px;resize:vertical;border-radius:7px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:15px/1.4 "Source Sans 3",sans-serif;padding:10px 12px}}
textarea:focus-visible{{outline:3px solid var(--a);outline-offset:1px}}
.barra{{position:fixed;left:0;right:0;bottom:0;background:var(--surface);border-top:1px solid var(--line);padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}}
.barra .in{{max-width:1000px;margin:0 auto;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}}
#cop-st{{font-size:14px;color:var(--ink2);opacity:0;transition:opacity 250ms ease-out}}#cop-st.on{{opacity:1}}
#saida{{display:none;width:100%;min-height:120px;margin-top:8px}}
.lb{{position:fixed;inset:0;background:rgba(6,8,14,.86);display:grid;place-items:center;padding:20px;opacity:0;pointer-events:none;transition:opacity 250ms cubic-bezier(.22,1,.36,1);z-index:9}}
.lb.on{{opacity:1;pointer-events:auto}}
.lb img{{max-width:100%;max-height:calc(100dvh - 90px);border-radius:7px;transform:scale(.96);transition:transform 250ms cubic-bezier(.22,1,.36,1)}}
.lb.on img{{transform:scale(1)}}
.lb .x{{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.14);color:#fff;border:0}}
.lb p{{color:#f3eee3;font-size:14px;margin-top:10px;text-align:center}}
.lb .fig{{display:grid;justify-items:center}}
@media (prefers-reduced-motion:reduce){{*,*::before,*::after{{transition-duration:0ms !important}}}}
</style></head><body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="i-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol><symbol id="i-no" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol><symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></symbol></defs></svg>
<main>
<section class="hero"><span class="eb">Sabiá v1.6.0 parte 4 · Colaborador em Pendências, "código de autenticação" e Fatia E (telão e celular)</span><h1>O telão e o celular do participante entram na família EFC</h1>
<p>Esta parte faz as suas respostas da parte 3. O Colaborador passa a consultar Pendências (P1) e o nome passa a ser "código de autenticação" (P2). Também faz a última fatia do revamp: o telão e o celular do participante, com as cores, as letras e o movimento do resto do app. As 4 cores e formas das alternativas continuam as mesmas.</p>
<p><b>Sobre a P3 (Relatórios na lista ou no último), que você deixou para mim: ficou a lista.</b> Relatórios é o índice das sessões, do mesmo jeito que Treinos e Pessoas são listas que abrem um detalhe. Isso deixa o app previsível: toda tela do menu começa pela lista. O momento em que você mais quer ver "o último" é logo depois de encerrar a sala, e aí o app já abre o relatório sozinho. O Início também mostra as últimas sessões, a um toque. Um relatório inteiro embaixo da lista deixaria a tela longa e pesada no celular, e repetiria o que a primeira linha já diz.</p>
<p class="mut">Cada ITEM é uma mudança. Marque Aprovado ou Reprovado (o comentário é opcional), responda as perguntas e toque em "Copiar respostas". As imagens ampliam ao tocar, e os vídeos são o app de verdade.</p></section>
{itens_html}
<section class="card"><h2>Perguntas</h2><p class="mut">Escolha uma opção em cada uma. Elas entram no "Copiar respostas".</p>{pergs_html}</section>
<section class="card"><h2>Números (cinco auditorias)</h2>{numeros()}
<p class="mut">Telão e celular foram medidos em cada etapa (espera, explicação, pergunta de múltipla escolha, V ou F e Ordenar, respondeu, conferindo, resultado e pódio), nos dois temas, antes e depois. Nenhuma medida piorou. O resto do app não mudou de cara (84 telas iguais na medida). O app cresceu {N['rapidez']['d'][6] - N['rapidez']['a'][6]} KB.</p></section>
<section class="card"><h2>Testes</h2><ul>
<li>Suíte inteira (29 suítes): <b>{T['suite']}</b>.</li>
<li>Teste novo (teste-v160p4.js): <b>{T['p4']}</b> na parte 4. Na parte 3 ele dá <b>{T['p4_antes']}</b>.</li>
<li>Ajustadas conferências antigas que esperavam o Colaborador sem Pendências e o texto "Registro confere".</li>
<li>Revisor novo (um agente que não viu o trabalho): 16 achados, todos com resposta abaixo.</li></ul></section>
<section class="card"><h2>O que o revisor novo achou</h2><div class="tw"><table><thead><tr><th>#</th><th>Gravidade</th><th>Achado</th><th>O que eu fiz</th></tr></thead><tbody>{rev_html}</tbody></table></div></section>
<section class="card"><h2>Para conferir com o olho</h2><ul>
<li>No projetor de verdade, de 3 a 5 metros: a alternativa amarela, as erradas sob o véu no resultado e a chave no canto.</li>
<li>Modo Projetor (tecla P no telão): o contorno da certa aparece preto.</li>
<li>No seu celular, com o tema claro e o escuro: entrar numa sala, responder e ver o resultado.</li>
<li>Como Colaborador: Pendências e o relatório de uma sessão.</li>
<li>Um PDF novo e um antigo em Autenticar documento.</li></ul></section>
<section class="card"><h2>O que não deu para provar</h2><ul>
<li>Projetor de verdade e distância: os contrastes foram medidos na tela, não na parede.</li>
<li>Safari do iPhone e Android antigo: aqui só há Chromium.</li>
<li>Leitor de tela de verdade: conferi o que o navegador entrega a ele, mas não ouvi.</li>
<li>Firebase real: a sala ao vivo foi testada com o simulador do banco. GitHub segue sem acesso.</li></ul></section>
</main>
<div class="barra"><div class="in"><span id="cont" class="mut"></span><span id="cop-st" role="status"></span><button class="bt pri" id="copiar"><svg><use href="#i-copy"/></svg>Copiar respostas</button><textarea id="saida" aria-label="Respostas para copiar"></textarea></div></div>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Imagem ampliada"><button class="bt x" id="lbx" aria-label="Fechar"><svg><use href="#i-no"/></svg></button><div class="fig"><img id="lbimg" alt=""><p id="lbcap"></p></div></div>
<script>
const K='sabia-v160-p4';let est={{}};try{{est=JSON.parse(localStorage.getItem(K)||'{{}}')}}catch(e){{}}
const salva=()=>{{try{{localStorage.setItem(K,JSON.stringify(est))}}catch(e){{}}}};
const itens=[...document.querySelectorAll('.item')],pergs=[...document.querySelectorAll('.perg')];
const conta=()=>{{const n=itens.filter(s=>est[s.dataset.item]&&est[s.dataset.item].v).length+pergs.filter(s=>est[s.dataset.perg]&&est[s.dataset.perg].v).length;document.getElementById('cont').textContent=n+' de '+(itens.length+pergs.length)+' respondidos'}};
itens.forEach(s=>{{const id=s.dataset.item,ap=s.querySelector('.ap'),rp=s.querySelector('.rp'),ta=s.querySelector('textarea');const e=est[id]||(est[id]={{v:'',c:''}});
 const pinta=()=>{{ap.setAttribute('aria-pressed',e.v==='Aprovado');rp.setAttribute('aria-pressed',e.v==='Reprovado');conta()}};
 ap.onclick=()=>{{e.v=e.v==='Aprovado'?'':'Aprovado';pinta();salva()}};rp.onclick=()=>{{e.v=e.v==='Reprovado'?'':'Reprovado';pinta();salva();if(e.v)ta.focus()}};
 ta.value=e.c||'';ta.oninput=()=>{{e.c=ta.value;salva()}};pinta();}});
pergs.forEach(s=>{{const id=s.dataset.perg,bs=[...s.querySelectorAll('.op')],ta=s.querySelector('textarea');const e=est[id]||(est[id]={{v:'',c:''}});
 const pinta=()=>{{bs.forEach(b=>b.setAttribute('aria-pressed',e.v===b.textContent));conta()}};
 bs.forEach(b=>b.onclick=()=>{{e.v=e.v===b.textContent?'':b.textContent;pinta();salva()}});ta.value=e.c||'';ta.oninput=()=>{{e.c=ta.value;salva()}};pinta();}});
const texto=()=>'Sabiá v1.6.0 parte 4 · respostas\\n'+itens.map(s=>{{const e=est[s.dataset.item]||{{}};return 'ITEM '+s.dataset.item+' · '+s.dataset.nome+': '+(e.v||'sem resposta')+(e.c&&e.c.trim()?' · '+e.c.trim():'')}}).join('\\n')+'\\n'+pergs.map(s=>{{const e=est[s.dataset.perg]||{{}};return s.dataset.perg+' · '+s.dataset.nome+': '+(e.v||'sem resposta')+(e.c&&e.c.trim()?' · '+e.c.trim():'')}}).join('\\n');
const st=document.getElementById('cop-st');
document.getElementById('copiar').onclick=async()=>{{const t=texto();try{{await navigator.clipboard.writeText(t);st.textContent='Copiado. Cole na conversa.';}}catch(e){{const o=document.getElementById('saida');o.value=t;o.style.display='block';o.select();st.textContent='Selecione o texto abaixo e copie.';}}st.classList.add('on');setTimeout(()=>st.classList.remove('on'),2500)}};
const lb=document.getElementById('lb'),li=document.getElementById('lbimg'),lc=document.getElementById('lbcap');let volta=null;
document.querySelectorAll('.zoom').forEach(b=>b.onclick=()=>{{const i=b.querySelector('img');li.src=i.src;li.alt=i.alt;lc.textContent=(b.closest('.lado').querySelector('.tag')||{{}}).textContent+' · '+i.alt;volta=b;lb.classList.add('on');document.getElementById('lbx').focus()}});
const fecha=()=>{{lb.classList.remove('on');if(volta)volta.focus()}};
document.getElementById('lbx').onclick=fecha;lb.onclick=e=>{{if(e.target===lb||e.target.classList.contains('fig'))fecha()}};
addEventListener('keydown',e=>{{if(e.key==='Escape'&&lb.classList.contains('on'))fecha()}});
</script></body></html>'''
open(D + '/index.html', 'w', encoding='utf8').write(pagina)
print('ok', len(pagina))
