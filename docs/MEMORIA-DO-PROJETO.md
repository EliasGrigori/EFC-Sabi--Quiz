# MEMÓRIA DO PROJETO · Sabiá (antigo EFCquiz v2.8.8)

Atualizado na v0.6.0 (05/11/2026). Este arquivo sobe junto com cada versão. Toda regra nova do Elias entra aqui.

## O que é
App PWA de treinamento e avaliação de eficácia da Fazenda Matriz (MERI POBO), da família EFClaudian. O Sabiá é o rework do EFCquiz:
mesmas funções, cara nova. Versões recomeçam do zero (v0.1.0 até v1.0.0).

## Decisões já tomadas
- Nome: Sabiá. Cores: petróleo #0E4A48 e laranja sabiá #D45D17. Fontes: Bricolage Grotesque e Atkinson Hyperlegible.
- Formas simples (folha, gota, sol, pedra) e ícones desenhados. Sem emojis.
- Bonecos 3D por código foram descartados (resultado feio). O caminho de bonecos prontos (galeria) foi adiado. Elias pediu para seguir sem imagens por ora.
- Dados só no aparelho (IndexedDB, banco "sabia"), com reserva em localStorage. Sem senhas, chaves ou dados reais nas pastas do projeto.
- Importa treinamentos .json do EFCquiz (tipos explicação, múltipla, verdadeiro/falso, ordenar).

## Regras do Elias (valem sempre)
- Layout limpo, moderno, compacto, sem poluição. Um único filtro recolhível com resumo. Excluir é ícone de lixeira.
- Antes de cada tarefa: mostrar em negrito o modelo e o esforço sugeridos e esperar "pode iniciar".
- Claude trabalha em primeiro plano. Nada em segundo plano nem agendado.
- Antes de publicar no GitHub: página de aprovação com antes e depois. Só publica depois do "aprovado".
- Em toda entrega de versão: roteiro de verificação para o Grok e este arquivo atualizado.
- Ao fechar um lote: resumo do que foi feito e o que verificar e configurar no Firebase.
- Terminar toda entrega com os próximos passos.

## Versões
| Versão | Estado | Conteúdo |
|---|---|---|
| v0.1.0 | aprovada pelo Elias em 04/11 | Casca, Início, Treinos, Novo (modelo, zero, importar), exportar, duplicar, excluir com desfazer, Aplicar (3 formatos, setores, registro, ajustes, roteiro), Ajustes, offline |
| v0.2.0 | aprovada pelo Elias em 04/11 e publicada no GitHub | Sala ao vivo: chave de 6 números, QR, link, convite WhatsApp, telão em outra janela (BroadcastChannel), controle, participantes simulados, ranking, pódio, aba Encerradas |
| v0.3.0 | aprovada pelo Elias em 04/11 e publicada no GitHub | Editor de perguntas (4 formatos, tempo, como conta, porquê, mover, duplicar, excluir com desfazer, avisos, prévia do telão, resumo) e versões (salvar com nota, comparar, restaurar, fixar ao aplicar) |
| v0.4.0 | pronta, conferida pelo Grok no Firebase real (65 de 66; a única falha era do script de teste), aguardando o aprovado do Elias | Celular do participante (QR, link ou chave; nome da lista ou livre; cor; responder; resultado; assinatura) via Firebase Realtime Database por REST; Ajustes com endereço, teste e regras; lista de nomes; remover pessoa |
| v0.5.0 | publicada no GitHub (commit 54dd8c4, Pages no ar) | Relatórios (Resumo, Mapa da turma, Assertividade, Setores), PDF de registro e lista de presença feitos pelo próprio Sabiá, planilha CSV, sessão .json, foto da turma, logotipo, código de conferência SAB-... e página Conferir, reaplicar para quem ficou abaixo |
| v0.6.0 | pronta, aguardando aprovação | Pendências (Reforço, Reavaliar, Validade), tentativas oficiais 2ª e 3ª, aplicar reforço só com as erradas, validade e 30/60/90 no editor, pré e pós-teste com ganho de aprendizado, rever o que errei e treinar de novo no celular, progresso no celular |
| v0.7.0 | pronta, aguardando aprovação (inclui a v0.6.0, que ainda não foi publicada) | Cadastro de Pessoas (setor, apelidos, importar lista, sugeridas), perfil com histórico e 6 selos, lista de entrada pelo cadastro, Mensagens com resposta, comentário rápido no celular, "outra pessoa vai usar este celular", Desafio entre setores, barra de baixo com Mais |
| v0.8.0 | pronta, aguardando aprovação (junto com v0.6.0 e v0.7.0, não publicadas) | Perfis, conta do EFClaudian (SDK, config colada no aparelho), porta de entrada opcional, EFC_API, Ajustes com índice, telão/som padrão, demonstração, observações do treinamento |
| v1.0.0 | publicada em 05/11/2026 (commit e4a0c99, junto com v0.6.0, v0.7.0 e v0.8.0 num commit só, porque o código-fonte intermediário não foi guardado) | Banco de perguntas, criar com IA (texto pronto + leitura do JSON), pergunta de teste no começo da sessão, voz gravada no telão, ouvir a pergunta no celular, carimbo de tempo do servidor do Firebase, regras do Firebase mais firmes |
| v1.0.1 | publicada em 05/11/2026 (commit ced5447) | Ícone novo do app (desenho do Elias com contornos reforçados e fundo petróleo em relevo): icon-192, icon-512, icon-maskable-512 e apple-touch-icon. Só o ícone mudou |
| v1.1.0 | publicada em 05/11/2026 (commit ca59807) | Telão com tela cheia, modo projetor e modo apresentação; folha de reforço em PDF; painel do treinamento (gaveta no editor); logotipo de dentro do app trocado pelo desenho novo; fundo do ícone no verde do app |
| v1.2.0 | publicada em 05/11/2026 (commit e18f189) | Meta em pontos (ou em %) no editor: 1.000 pontos por acerto, sem o bônus de rapidez; conversão ao trocar o tipo; versões, relatório, PDF, telão, lista, exportar e importar entendem a meta em pontos |
| v1.3.0 | publicada em 05/11/2026 (commit 47adeed) | Material de apoio por treinamento (PPTX de preferência, PDF ou HTML, guardado só no aparelho), capítulos ligados às explicações, aba Material no painel, botões "Mostrar no telão" e "Ver aqui" na sala, tecla M no telão |
| v1.3.1 | publicada em 05/11/2026 (commit 686dd55) | Material de até 300 MB (HTML até 30 MB), só no aparelho; título e capítulos viajam na exportação do treinamento e, no outro aparelho, o painel pede para anexar de novo o mesmo arquivo |
| v1.4.0 | publicada (commit c083cf0, 06/11/2026) | Bonecos: cada participante monta o seu bicho no celular (17 animais, 10 cores, 6 roupas, 11 detalhes, 23 cosméticos de cabeça e 6 de pescoço); todos começam com gato ou cachorro sorteado; boneco na sala, telão, ranking e pódio; regra nova no Firebase (campo b) |
| v1.4.1 | publicada (commit b3e3591, 06/11/2026) | Bichos maiores no celular (opções do montador em 2 colunas), resposta que chega atrasada (até 4 s) conta, aba Cor do montador corrigida (erro da v1.4.0), iniciais ignoram hífen; sem regra nova no Firebase |
| v1.4.2 | publicada (commit 5e21fa5, 06/11/2026) | Bicho maior dentro do quadro (recorte fixo de 250 px), quadro de 140 px na tela de nome, bicho de 240 px em cima do nome na espera |
| v1.4.3 | aprovada em 07/11/2026 e publicada | Correção da suspeita do Grok (v0.6.0, José com 5 de 6 no Firebase real): celular corrige o resultado quando a resposta atrasada vira acerto, pódio manda a lista de acertos, janela de 10 s, tentativas do treino em ordem; testes com internet lenta (SABIA_ATRASO) |
| v1.5.0 | aprovada em 07/11/2026 e publicada | Apresentar o material: PDF desenhado página por página (PDF.js no app, sem internet), botão Apresentar e Abrir em outra tela no painel, Apresentar no telão pelo controle a qualquer momento, setas, toque, capítulos e tela cheia; capítulos automáticos do PDF; dica de salvar PPTX como PDF; prompt padrão da IA (múltipla, V ou F, sequência) e importação do .json da IA; logotipo de dentro do app recortado (sem a moldura da foto) e maior |

## Paridade com o EFCquiz (79 funções)
v0.1.0: 10 prontas e 11 parciais. v0.2.0 completa as opções de Aplicar, o controle ao vivo e o telão. v0.3.0 entrega o editor e as versões. v0.4.0 entrega o celular do participante. v0.5.0 entrega relatórios, PDFs e conferência. v0.6.0 entrega reforço, reavaliação, pré e pós-teste e rever no celular v0.7.0 entrega pessoas, mensagens, comentário no celular e desafio entre setores (detalhe em features.csv: 67 prontas, 11 parciais, 1 faltando de 79 (v0.8.0 entrega perfis, porta de entrada, conta do EFClaudian, Ajustes completo e observações; v1.0.0 entrega banco de perguntas, criar com IA, pergunta de teste, voz, ouvir, carimbo e regras do Firebase mais firmes)).

## Medidas (régua de espaço vazio)
Início 53% → 41% (meta 29%). Aplicar 45% → 39% (meta 40%). Medido com 3 treinamentos de exemplo e sem sessões. Editor v0.3.0: 34% (múltipla) e 31% (ordenar com resultado) a 1280 px; a tela antiga é uma lista única rolável, então não é comparável item a item.

## Regras do editor (v0.3.0)
- Múltipla: 2 a 4 alternativas (o telão tem 4 cores e formas). Ordenar: 3 a 5 passos digitados na ordem certa; o telão embaralha. Verdadeiro ou falso: 2 linhas fixas.
- Versão: `versao` é o número da última salva; `sujo` marca alterações sem versão. Aplicar fixa a versão sozinho. A sessão guarda `versao` e a cópia das perguntas.
- Comparar usa o enunciado como chave; pergunta com só o enunciado mudado, na mesma posição e formato, conta como alterada.

## Firebase (v0.4.0)
- Só Realtime Database, por REST e eventos em tempo real (sem SDK, sem login). Em Ajustes o instrutor cola apenas o endereço do banco; nenhuma chave fica no projeto.
- Estrutura em /salas/{chave}: pub (meta, fase, item sem a certa), res (resultado por pessoa), part, resp (uma vez), ass (assinatura JPEG pequena). Encerrar a sala apaga tudo.
- Regras em docs/firebase-rules.json. Risco assumido: sem login, a sala é protegida só pela chave de 6 números. Endurecer (login anônimo e regras por dono) na etapa de acabamento.
- O celular aprende o endereço do banco ao abrir o QR/link (guarda em localStorage); depois basta a chave em #/entrar.
- Sem o endereço, a sala usa participantes simulados como na v0.2.0.
- Testes usam um servidor que imita o Realtime Database (docs/ e tools/rtdb-mock.js); o Firebase real ainda não foi testado por mim, o Grok e o Elias confirmam.

## Relatórios, PDFs e conferência (v0.5.0)
- PDF gerado pelo próprio Sabiá (src/pdf.js), sem biblioteca e sem internet: fontes padrão Helvetica, alfabeto ocidental (outros caracteres viram "?"), imagens só JPEG (assinatura, foto e logotipo são convertidos para JPEG pequeno antes de guardar).
- Código de conferência: "SAB-" + 20 caracteres hexadecimais do SHA-256 de um texto fixo com título, versão, perguntas, data, instrutor, local, carga horária, meta e, por pessoa, nome, setor, acertos, pontos, pontos certos/errados por pergunta e assinatura. Guardado em `cod` da sessão ao encerrar. Sessões anteriores recebem o código na primeira abertura (`codTardio`). A foto da turma e o logotipo não entram no cálculo.
- Limite assumido: sem senha nem carimbo de tempo externo; o código prova que o PDF impresso é igual ao que está guardado no aparelho.
- Sessão de teste (`aj.teste`) e ensaio (participantes simulados) saem com aviso "não vale como registro oficial" no PDF e no relatório.
- Planilha CSV: UTF-8 com BOM, ponto e vírgula, proteção contra fórmula (apóstrofo antes de = + - @).
- Reaplicar para quem ficou abaixo: abre Aplicar com `roster` (lista de nomes de entrada) e `reaplicaDe`.
- Cuidado ao criar CSS: as classes ficam todas no mesmo arquivo; `.sp` (anel girando do celular) vazou para o menu lateral na v0.4.0 e `.as`, `.bar`, `.rh` colidiriam com o celular e o telão. Regra: classes novas ou ficam dentro de `.rel`/da tela, ou têm nome único.
- Não existe ainda: equipes e gincana no relatório, desempate por tempo, desafio entre setores do mês (v0.7), mensagens.

## Reforço e reavaliação (v0.6.0)
- Pendências são calculadas na hora a partir das sessões encerradas (`pendencias(hoje)` em src/reforco.js); nada é guardado, exceto as baixas (`S.baixas` com tipo, chave e data). Uma baixa esconde o item enquanto `baixa.em` for maior ou igual ao fim da sessão do item; uma sessão nova abaixo da meta traz a pessoa de volta. Reavaliação usa tipo "reav" + dias.
- Só entram sessões oficiais (não teste, não ensaio) com pessoas reais, pareadas pelo nome sem acentos e em minúsculas (`nk`). Pré-teste não entra em reforço, validade, relatório de tempo nem indicadores.
- Regra oficial do EFCquiz (M15): a nota oficial é a 1ª tentativa; a 2ª pode ser no mesmo dia; a 3ª só no dia seguinte (`diaSeguinte`); depois da 3ª a pessoa sai da fila e vai para "usaram as 3 tentativas". Conteúdo do reforço: "Rever a explicação e refazer o teste" ou "Só as perguntas que erraram" (campo `somente` da sessão, com `recortado`).
- Treinamento: `reav` (lista de 30/60/90) e `per` (validade em dias: 0, 180, 365, 730). Avisos: reavaliação 14 dias antes e atrasada; validade 30 dias antes e vencida. Quem está abaixo da meta fica no Reforço, não em Reavaliar. Configuração vale para o treinamento inteiro, não é versionada.
- Momentos da sessão (`mom`): "pre", "pos", "ref", "reav", "ren"; `dias` e `base` {rot, sid, fim, itens} guardam o ponto de comparação. O código de conferência só inclui mom/dias/base quando `mom` existe, então sessões antigas mantêm o código. `refaz` (treino do celular) não entra no código.
- Pré-teste: ranking desligado, sem etapa de resultado (`fimPergunta` vai direto a `seguir`), `resDe` devolve nulo, a resposta certa nunca é publicada, o celular mostra "Pré-teste concluído" sem rever nem treinar.
- Comparativo (`comparativo(s)`): pareia por nome, mostra antes, agora, variação em pp e ganho normalizado g = (agora − antes) ÷ (100 − antes), além de novos e ausentes. Usado em pós, reavaliação, reforço e renovação, na tela e no PDF.
- Celular: "Rever o que errei" e "Treinar de novo" (prática, 3 tentativas por pergunta, não vale nota). O celular grava `/salas/{chave}/part/{id}/ref/{n}` com {t, ok}; o instrutor lê em `ingerir` e vê o cartão "Treino no celular". Só chega com a sala aberta. **As regras do Firebase não mudaram.**
- A barra inferior do celular do instrutor perdeu "Pessoas" (continua no menu do computador). Na v0.7.0 ela ganhou Mensagens e Mais.
- CSS: telas novas usam `.pnd`, `.mom` e `.pdn-n`; seguir a regra de nomes únicos.
- Não feito: folha de reforço em PDF do original.

## Pessoas e mensagens (v0.7.0)
- Código novo em src/pessoas.js e src/pessoas.css (prefixos de classe `pes-`, `pfl-`, `msg-`, `ds-`, `sel`, `mais-`, `cmt-`). Estado: `S.pessoas` {id, nome, setor, apelidos[], ativo} e `S.mensagens` {id, sid, pid, cid, pessoa, setor, tipo, texto, em, treinoId, titulo, versao, teste, lida, resposta, respEm}.
- Identidade por pessoa: `chaveNome(n)` devolve o nome canônico normalizado da pessoa encontrada por nome ou apelido; sem cadastro, o próprio nome normalizado. `nk` (reforço, pendências, comparativos) agora usa `chaveNome`. Renomear uma pessoa guarda o nome antigo como apelido. "Sugeridas" lista nomes das sessões fora do cadastro (cadastrar ou juntar como apelido).
- Lista de entrada: `rosterDe(a)` (cadastro ativo, filtrado pelos setores escolhidos; `cadnao` desliga) vai em `s.roster`; a publicação da sala leva `meta.rs` (setor de cada nome) para o celular escolher o setor sozinho. Reforço mantém a lista própria.
- Selos (`SELOS`): meta1, const3 (3 últimas na meta), pres5, nota100, recup, top1. Só sessões oficiais; teste, ensaio e pré-teste não contam.
- Mensagens: o celular grava `/salas/{chave}/part/{pid}/com/{cid}` {k, x, t} (até 3 por pessoa, 3 a 300 letras); o instrutor lê em `ingerir` → `ingerirCom` (valida o tipo, tira `<` `>` e controles, limita o tamanho, ignora ids repetidos). A resposta vai em `/salas/{chave}/part/{pid}/rsp/{cid}` {x}, só com a sala aberta. A sala é apagada ao encerrar, então o que não chegou antes se perde.
- **(v0.7.0, superado na v1.0.0: as regras agora declaram `ref`, `com` e `rsp`.)** `part/$pid` exige o filho `n`; a documentação diz que as validações valem em todos os níveis, então `com`, `rsp` e `ref` devem passar. O simulador de testes não aplica regras: o Grok precisa confirmar na base real. Se recusar, a correção é declarar `ref`, `com` e `rsp` explicitamente em `part/$pid`.
- Aparelho compartilhado: `proxPessoaCel` apaga `sabia-p-`, `sabia-a-`, `sabia-rv-`, `sabia-rf-`, `sabia-cm-` e zera o estado. Serve para entrar e assinar, não para vários responderem juntos.
- Desafio entre setores: sessões oficiais encerradas, sem pré-teste, teste nem ensaio; mínimo `MIN_SETOR = 3` pessoas por setor no período; mês ou ano; tela grande (`PES.dsTela`); sem nomes de pessoas.
- Navegação: barra inferior do celular = Início, Treinos, Pendências, Mensagens e Mais (Pessoas, Relatórios, Conferir, Ajustes). O menu mostra número de pendências e de mensagens novas. Início prioriza pendências sobre mensagens.
- Sem perfil nem selos no celular do participante (precisa de login; fica para depois da v1.0.0).
- Lembrete de entrega: `dist/sw.js` não é gerado; subir o nome do cache (`sabia-0.7.0`) a cada versão.

## Integração com o EFClaudian (v0.8.0)
- Código em src/integra.js e src/integra.css (prefixos `int-`, `aj-`, `obs-`). Perfis em `S.cfg.perfil` (padrão primario); com conta conectada o perfil vem da conta (`INT.conta`, guardada em `sabia-efc-conta` para abrir sem internet). `podeGerir()` e `podeObs()` valem para Primário e Líder estrela; Colaborador só vê Início, Treinos, Relatórios, Conferir, Ajustes (rotas barradas em `intAntesRender`, botões escondidos por CSS e ações barradas em captura de clique). É conveniência de interface, não segurança.
- **Configuração do Firebase do EFClaudian nunca fica no projeto**: a pessoa cola no aparelho, vai para localStorage `sabia-efc-cfg`, não entra em `S` nem no "Exportar tudo". O Sabiá extrai apiKey, authDomain, projectId, appId e appCheckKey do texto colado.
- SDK do Firebase (compat 10.12.0, de gstatic.com) só é carregado quando há configuração. Usa o app padrão, então compartilha o login com o EFClaudian na mesma origem. Mesmo fluxo do EFCquiz: `sv2_login/{slug}` acha o e-mail, `signInWithEmailAndPassword`, `sv2_users/{uid}` dá nome, perfil ("principal" = Primário), `estrela`, `bloqueado`.
- Porta de entrada (`S.cfg.porta`, desligada por padrão): `portaFechada(v)` = porta ligada, aparelho não ativado (`sabia-ativado` ou conta) e sem `?demo=1`; `#/entrar` nunca é barrada. `?ativar=1` ativa e limpa o endereço. Demonstração com porta: sessões marcadas como teste (`AJ_PADRAO.teste`).
- `window.EFC_API`: versao(), perfil(), conta(), abrir(rota).
- Ajustes: `AJ_IND` (índice de 10 seções); `S.cfg.telaoPadrao` e `somPadrao` alimentam `AJ_PADRAO`; `S.cfg.obs`. Observações do treinamento em `t.obs` [{id, txt, por, em}], fora do versionamento.
- Os testes (teste-integra.js) usam um SDK de mentira injetado por rota; só a conta real prova o login.
- `dist/sw.js` continua manual: cache `sabia-1.4.0` (subir a cada versão).

## v1.0.0 · acabamento (src/v10.js e src/v10.css; prefixos `bn-`, `ia-`, `vz-`, `selo`, `ouv`, `tvoz`)
- **Banco de perguntas**: `S.banco` [{bid, de, quando, ...pergunta sem áudio}], máximo 500, sem repetir (formato + enunciado). Diálogo `dlgBanco` com busca (sem acento), filtro por formato, Inserir, Excluir com Desfazer dentro do diálogo (o aviso flutuante fica escondido atrás do diálogo modal, por isso não serve). Vai no "Exportar tudo".
- **Criar com IA**: sem chamar IA (o app não tem chave nem rede para isso). `promptIA()` monta o texto; `lerRespostaIA()` tira cercas e texto em volta, passa por `validaTreino` e marca `t.ia = true` (aviso no editor e em Aplicar até "Já revisei"). Descarta formato inventado, pergunta sem enunciado e áudio.
- **Pergunta de teste**: `AJ_PADRAO.aquece` (desligado), `aquecer(sessao)` chamado em `preparar()` e `abrirSalaDe()`; item `{uso: "ensaio", aquece: true}` no começo da cópia da sessão; fora do código de conferência (só `vale()` entra).
- **Voz gravada**: `it.audio` = data URI de áudio (MediaRecorder, até 30 s e ~450 KB; validada por `audioOk`). `snap()` leva `item.voz` só para o telão (BroadcastChannel); `pubDe()` zera `voz`, então NUNCA vai ao Firebase. O telão toca sozinho ao abrir a pergunta (`vozAuto`, falha em silêncio se o navegador bloquear) e tem o botão "Ouvir" (`tvoz`). `validaTreino` mantém o áudio válido na importação; o banco não leva áudio.
- **Ouvir no celular**: `speechSynthesis` pt-BR; `textoPergunta` lê as opções pela posição na tela (as alternativas são identificadas por cor e forma, não por letra); `textoResultado` lê a certa e o porquê só no resultado. A leitura para quando a tela muda. Sem `speechSynthesis` o botão some.
- **Carimbo de tempo**: `PUT /selos/{SAB-...}` com `{t: {".sv": "timestamp"}}`; as regras só deixam gravar uma vez, com `t === now`, e a chave tem que ser um código SAB válido. `carimbar(s)` recusa registro que não confere (`integra`). Guarda `s.selo = {t, dif, em, antigo}`; "dif" é a diferença entre o relógio do aparelho e o do servidor. Aparece no relatório, no PDF de registro e em Conferir. **Limite honesto:** é o relógio do Firebase do próprio projeto (o dono pode editar no console); não é carimbo ICP-Brasil. Uma autoridade externa (RFC 3161) não dá: a rede do app é restrita ao Firebase.
- **Regras do Firebase** (`docs/firebase-rules.json`, igual ao `REGRAS_FIREBASE` em rede.js; as anteriores estão em `firebase-rules-v0.8.0-anterior.json`): `part/$pid` aceita só n, c (0 a 63), s, t, ref, com, rsp com tipo e tamanho; `$outro` recusa o resto. `selos` como descrito. Ninguém lista salas nem carimbos. **O Elias precisa publicar as regras novas no console do Firebase** (sem isso o carimbo avisa e o resto continua funcionando como antes).
- **Avaliador de regras para testes** (`rules-sim.js`, usado por `rtdb-mock.js` quando `SABIA_REGRAS=1` ou `criar({regras})`): .read, .write em cascata, .validate no caminho, nos pais e nos filhos, curingas, `now`, `.sv` timestamp. É uma conferência extra, não o Firebase: a palavra final é o Simulador de regras do console. Todas as suítes de celular passam sob as regras novas sem nenhum pedido negado.
- Testes novos: `teste-regras.js` (44), `teste-v10.js` (77), `teste-v10-cel.js` (24, claro e escuro). Total das suítes na v1.0.0: 674 conferências.
- Ficou de fora: meta em pontos, painel lateral das versões, material com capítulos, modos de telão (projetor e apresentação), folha de reforço em PDF, perfil do participante no celular.

## Pendências e perguntas abertas
- Repositório: https://github.com/EliasGrigori/EFC-Sabi--Quiz (criado pelo Elias em 04/11/2026). v0.1.0 e v0.2.0 publicadas na branch main (aprovadas por ele). Tags v0.1.0/v0.2.0 existem só no clone local (o envio de tags é bloqueado daqui). GitHub Pages: o Claude não consegue ligar pela API, o Elias liga em Settings > Pages > main / raiz.
- O telão continua sincronizado por BroadcastChannel (mesmo navegador/computador do instrutor). Os celulares usam o Firebase.
- Boneco do participante: na v1.4.0 virou o bicho montado (bonecos feitos no Blender); a cor de antes fica só para celulares antigos.
- Firebase real: projeto criado pelo Elias e testado pelo Grok com a v0.4.0 (conexão, regras, sala completa, encerrar apaga). Nenhum endereço nem chave fica nas pastas do projeto.
- Firebase: configurar o Realtime Database para usar os celulares (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md). A integração com o EFClaudian vem depois.
- Personagens: decidir depois (galeria de bonecos prontos ou ilustrações simples).


## v1.0.1 · ícone
- Origem: desenho em tinta enviado pelo Elias (fundo verde). Script `tools/fazer-icone.py` (usa o desenho original, que fica com o Elias, e não vai para o repositório) refaz tudo: separa o desenho do fundo, reforça os contornos, recria o fundo na cor #0E4A48 com relevo (ruído em várias escalas, trama fina, medalhão, luz de cima à esquerda) e sombra do desenho sobre o fundo.
- Saídas: `icon-512.png` e `icon-192.png` (cantos arredondados), `icon-maskable-512.png` e `apple-touch-icon.png` (sem borda; o rosto cabe no recorte circular de 80%).
- Na v1.1.0 o fundo do ícone foi igualado ao verde do app (#0E4A48, média do fundo) e o mesmo desenho virou o logotipo de dentro do app (símbolo `#logo` com imagem JPEG embutida, em src/index.html).
- O ícone muda no celular só depois de remover e reinstalar o app (e Ctrl+F5 no computador).


## v1.1.0 · telão, folha de reforço e painel (src/v11.js e src/v11.css; prefixos `tv`, `pn-`, `folha`)
- **Telão** (`#/telao/:id`): barra de opções que aparece ao mexer o mouse e some sozinha. F = tela cheia, P = modo projetor (fundo branco, texto preto, linhas fortes), A = modo apresentação (tela cheia, cursor some, espaço, Enter, seta direita ou PageDown mandam "avançar" ao controle pelo BroadcastChannel; no pódio não encerra a sala). O modo fica em localStorage `sabia-telao-modo` (por aparelho). Só funciona com telão e controle no mesmo navegador (limite do BroadcastChannel). O navegador pode negar a tela cheia: aparece aviso para usar F11.
- **Folha de reforço** (Relatório > botão "Folha de reforço (N)"): PDF com uma página por pessoa abaixo da meta: o que marcou, a resposta certa, o porquê, a explicação para rever (uma vez por página) e linha de ciente. Não aparece em pré-teste nem quando todos atingiram a meta. Não altera nota nem fila de reforço. Nome: `folha-reforco-<titulo>-<data>.pdf`.
- **Painel do treinamento** (editor > botão Painel): gaveta pela direita com Visão geral, Acerto por versão (média ponderada pelas pessoas, marca da meta, diferença em pontos percentuais) e Comentários (só deste treinamento). Só sessões oficiais entram nas médias. Sem aba de material (fica para depois).
- **Ficou para depois da v1.1.0:** meta em pontos (entrou na v1.2.0) e material com capítulos.
- Testes novos: `teste-v11.js` (58 conferências). Suítes antigas seguem verdes na v1.1.0.


## v1.2.0 · meta em pontos (src/v12.js e src/v12.css; prefixos `meta`, `mt-`)
- Regra aprovada pelo Elias em 05/11/2026: a pessoa atinge a meta se fizer X pontos ou mais, **sem contar o bônus de rapidez**. Cada acerto vale 1.000 pontos (`PTS_ACERTO`), então a meta pede ceil(X/1000) acertos. O bônus de rapidez continua no ranking e na coluna Pontos, mas não entra na meta.
- Treinamento: `meta` (número) e `metaTipo` ("pts" ou ausente para %). Em pontos vai de 1.000 a 100.000. O editor tem o campo Meta com seletor "% de acertos / pontos"; trocar converte (80% de 4 perguntas = 3.000 pontos; 3.000 volta como 75%), a ajuda mostra o máximo e quantos acertos a meta pede, e avisa quando passa do máximo (ninguém atinge).
- Sessão: ao abrir a sala, `s.meta` guarda a meta já convertida em % (`metaEq`, calculada uma vez sobre todas as perguntas, antes do recorte do reforço), e `s.metaTipo`/`s.metaPts` guardam os pontos originais. Por isso toda a conta de "atingiu a meta" (relatório, reforço, pendências, pessoas, celular, Firebase) continua em % e não mudou. A conversão usa round, e foi provada de 1 a 40 perguntas: quem faz os acertos pedidos passa, quem faz um a menos não.
- Mostram "N pontos": lista de treinamentos, editor e resumo, telão (fatos e pódio), relatório (texto e situação), PDF de registro (campo "Meta de acerto" e "Como a meta conta"), comparação de versões, exportar e importar. Reforço e Pessoas continuam mostrando o % equivalente.
- Versões guardam `metaTipo`; restaurar traz o tipo de volta e Desfazer devolve o anterior.
- Testes novos: `teste-v12.js` (33 conferências). Suítes antigas seguem verdes.
- Material com capítulos e a aba de material do painel entraram na v1.3.0.


## v1.3.0 · material com capítulos (src/v13.js e src/v13.css; prefixos `mat`, `mt-`, `matov`)
- Formato pedido pelo Elias: "de preferência PPTX, mas pode ser um PDF". Aceita PPTX, PDF e HTML, até 25 MB, validados pela extensão e pelos primeiros bytes (PK, %PDF-).
- Armazenamento: o arquivo fica no IndexedDB à parte "sabia-material" (store "arq", chave = id do treinamento, valor {blob, nome, tipo}). No estado vai só `t.material = {nome, tipo, bytes, caps:[{t, p}], em}`. Não entra em exportar treinamento, "Exportar tudo", versões nem Firebase. `duplicar` copia o arquivo (`matCopiar`). `matLimpaOrfaos` (4 s depois de abrir) apaga chaves sem treinamento.
- Explicação ligada: `it.cap` = índice em `t.material.caps` (só em itens `explicacao`). `validaTreino` descarta `cap` ao importar. Trocar/remover o arquivo apaga todos os `cap`; apagar um capítulo do PDF reajusta os índices; adicionar capítulo reordena por página e remapeia os `cap`.
- PPTX: leitor de zip próprio (EOCD + diretório central, `DecompressionStream("deflate-raw")`), ordem dos slides por `presentation.xml` + rels; por slide: título (placeholder title/ctrTitle), parágrafos com nível, tabelas como "a  |  b", imagens `p:pic` (blob URLs, soltas ao fechar). Capítulo = slide ("Slide N" sem título usa a primeira linha). O visor mostra texto e imagens, não o desenho exato.
- PDF: iframe de blob com `#page=N` (leitor do navegador) e link "Abrir em outra aba". HTML: iframe `sandbox=""` com `srcdoc` (sem scripts, sem same-origin).
- Sala: `snap(s)` leva `mat` ({tid, nome, tipo, caps, pg}) e `item.cap` só para o telão (BroadcastChannel); `pubDe` não leva, então nada disso vai ao Firebase. Controle: `matBtnCtl(sn)` ("Mostrar no telão" envia `{t:"cmd", a:"material", id, cap}`; "Ver aqui" abre `#dlg .dl.mt`). Telão: botão `tvmat` na barra (só na explicação ligada), tecla M, overlay `.matov` com o tema do telão (padrão/claro/projetor); o handler de teclas do v11 ignora tudo enquanto `.matov` existe; o do material usa captura para não deixar Espaço/Enter avançarem a sala. `matAtualizaTelao()` roda em `pintarTelao()` e fecha o overlay ao sair da explicação.
- Teste: Playwright com o serviço de bloqueio de service worker injeta script em iframes sandbox e gera um "erro" falso (`sandboxed and lacks allow-same-origin`); os testes o ignoram (sem esse bloqueio não aparece).
- Testes novos: `teste-v13.js` (65 conferências), com arquivos de exemplo gerados por python-pptx (`fx13/`: aula.pptx, manual.pdf, doc.html e arquivos inválidos). O leitor de PDF do Chromium sem tela não renderiza, então o PDF só é conferido na estrutura (iframe, #page=N).

## v1.3.1 · material grande, só no aparelho (src/v13.js)
- **Regra do Elias (05/11/2026):** o material pode ser grande, **não vai para a nuvem**; só o título informa. Em outro aparelho ele importa de novo o mesmo documento.
- Limite: PPTX e PDF até 300 MB; HTML até 30 MB (vai por `srcdoc`, então precisa caber na memória). Antes de gravar, confere o espaço livre do navegador (`navigator.storage.estimate`) e pede armazenamento persistente (`persist()`). O arquivo é gravado como o próprio File (sem cópia em memória).
- O leitor de PPTX (`zipLer`) agora trabalha sobre Blob: lê só o fim do arquivo (diretório central) e fatias de cada parte, então PPTX grande abre rápido (teste: 45 MB com imagem de 4000x4000 anexa em 0,2 s e abre o slide em 0,5 s). ZIP64 não é lido: avisa para exportar como PDF.
- Exportar treinamento leva `material` {nome, tipo, bytes, caps} e `cap` das explicações, nunca o arquivo. `matValida` descarta material com formato inventado (e as ligações). No outro aparelho, o painel mostra o nome e os capítulos e o aviso "O arquivo não está neste aparelho" com o botão "Anexar o mesmo arquivo" (`data-mt="re"`, `matAnexar(t, file, true)`): exige o mesmo tipo e, no PPTX, o mesmo número de slides; mantém capítulos e ligações.
- Testes: `teste-v13.js` passou a 72 conferências (fixtures novos: aula2.pptx; os arquivos grandes são gerados na hora).

## v1.4.0 · bonecos (src/v14.js e src/v14.css; prefixos `bon`, `avb`)
- **Pedido do Elias (05 e 06/11/2026):** bonecos cúbicos de massinha com corpo inteiro (peças coladas), focinhos lisos, caras caricatas e fofas, textura limpa e viva; animais da fauna cearense e domésticos; cosméticos em vários temas (clássicos, Nordeste, segurança do trabalho, pescoço e festa, divertidos); trocar a cor para diferenciar quem escolhe o mesmo bicho; roupas; brincos, piercings, tatuagens e manchas combináveis; **todos começam com gato ou cachorro sorteado**; imagens como arquivos separados de ~300 px.
- **Produção das imagens (fora do app):** Blender 5 sem tela (módulo bpy, ambiente em scratchpad/bpychk/v). Scripts: `corpos.py` (17 animais; partes da mesma cor fundidas com remesh em voxels + suavização; câmera única), `cosm_corpo.py` + `cosm2.py` + `cabecas.py` (29 cosméticos, cada um sozinho com o cubo da cabeça como recorte), `camadas.py` (por animal: pelagem em cinza neutro, 6 roupas sob medida e 11 detalhes de pele, com o animal inteiro como recorte), `bonecos.py` (materiais de vinil e funções básicas). Saída 720 px; o app usa 320 px WebP (318 arquivos, ~0,8 MB) em `bon/bichos`, `bon/camadas`, `bon/cosmeticos`, com `bon/lista.json`.
- **Código do boneco:** `animal.cor.roupa.detalhe+detalhe.cabeca.pescoco` (ex.: `onca.4.xadrez.brinco-argola.mago.colar`). `bonLer` valida tudo (animal e itens existentes, cor 0 a 9, até 4 detalhes) e descarta o que não serve para o bicho: tatu e tartaruga sem roupa (casco); jacaré e teiú sem detalhes de rosto e sem óculos/pirata. `bonValido` devolve o código limpo.
- **Desenho:** `bonDesenha(cod)` monta num canvas de 320 px: bicho, pelagem pintada (camada cinza × cor ×1,25, recortada pela própria camada), roupa, detalhes, pescoço e cabeça (jacaré desce 23 px, teiú 13 px). Guarda o resultado por código (`BON.url`). `bonHtml` cria `<img data-bon>` e um MutationObserver preenche o `src`. `avB(nome, cor, b)` troca o círculo `av` pelo boneco quando há código; sem código continua o círculo de cor.
- **Celular:** a tela de nome mostra "Seu bicho" com "Montar meu bicho" (sem a fileira de cores); o montador (`bonEditorCel`) tem prévia, Sortear, abas Bicho, Cor, Roupa, Detalhes, Cabeça e Pescoço, com miniaturas do próprio bicho; "Pronto" guarda em localStorage `sabia-bon` e, já dentro da sala, faz `PATCH /salas/{chave}/part/{pid}` com `{b}`. "Outra pessoa vai usar este celular" apaga o bicho (volta gato ou cachorro). Na espera aparece o boneco grande e "Mudar meu bicho".
- **Instrutor e telão:** `ingerir` guarda `p.b` (validado) e atualiza quando a pessoa troca; `snap` leva `b` em `part` e `top`; sala, ranking ao vivo, multidão do telão, pódio (boneco de 150 px) e lista do 4º ao 10º usam `avB`. Simulados entram com `bonSorteio()`. A borda das imagens some com máscara radial (a sombra do chão não vira quadrado no telão escuro).
- **Firebase:** regra nova em `part/$pid`: `"b": newData.isString() && length <= 160 && matches(/^[a-z0-9.+-]*$/)`. Regras anteriores guardadas em `firebase-rules-v1.3.1-anterior.json`. **O Elias precisa publicar as regras novas.** Com as regras antigas, `$outro` recusa o filho `b`; por isso o celular tenta entrar com o boneco e, se o banco recusar, entra de novo sem ele (a sala funciona, mas o boneco não chega ao instrutor nem ao telão). A troca de bicho depois de entrar (PATCH) só funciona com as regras novas.
- **Regra do Elias (06/11/2026):** relatório e PDF ficam **sem** os bonecos (continuam com nome e iniciais). Não sugerir levar os bichos para lá.
- Pódio do telão: bichos dos 3 primeiros em 200 px (o Elias pediu maiores na aprovação).
- **sw.js:** cache `sabia-1.4.0`; na instalação baixa `bon/lista.json` e guarda as 318 imagens (sem internet depois da primeira abertura).
- Testes: `teste-v14.js` (36 conferências, com o simulador de regras ligado); `teste-v14-offline.js` (o sw guarda as 318 imagens e o boneco é desenhado sem internet); `teste-celular.js` deixou de clicar na cor. As 19 suítes de `rodar-tudo.sh` passam sem falha.
- Aprovação: página com antes e depois em `shot-antes14.js` (prints da v1.3.1 publicada e da v1.4.0). A prévia do app (artifact) leva as imagens embutidas no próprio arquivo (`BON_DADOS`), porque a prévia não usa a pasta `bon/`; no site e no pacote as imagens são arquivos separados.

## v1.4.1 · ajustes dos bichos (src/v14.css, v14.js, live.js, rede.js)
- **Pedido do Elias (06/11/2026):** bichos maiores no celular, em coluna de 2 e com melhor aproveitamento do espaço; resposta que demora alguns milissegundos para chegar ao servidor deve valer ponto quando a pessoa acertou.
- **Tamanhos:** tela de nome 112 px; espera 150 px; prévia do montador 150 px; opções em 2 colunas (miniaturas ~156 px, quadradas, `aspect-ratio`); bicho ao lado do nome (`.eu`) e no ranking do celular (`.rr`) 42 px; pódio do telão 200 px (v1.4.0). Fonte das opções 14 px.
- **Resposta atrasada:** `fechouPerg(s)` guarda em `s.ult` ({i, tp, dur, fim}) a pergunta que acabou de fechar; é chamada em `irResultado`, `irPodio` e `entrarItem`. `ingerir` (rede.js) aceita resposta quando a pergunta está aberta ou quando `s.ult.i === i` e passaram no máximo `GRACA_RESP` (4000 ms). `registrar(s, p, i, r, tarde)` usa o tempo de fechamento (ms e bônus da gincana como no último instante). Não há campo novo no Firebase nem regra nova. Limite conhecido: sem relógio do servidor não dá para provar o instante do toque; por isso a janela é curta e só para a última pergunta fechada.
- **Aba Cor:** `bon-cor` era a classe do círculo e também a do contêiner (`bon-${aba}`); amostra renomeada para `bon-amostra`. O erro estava na v1.4.0 (as 10 cores ficavam num círculo só).
- **Iniciais:** `iniciais()` só usa palavras com letra ou número e pega a primeira letra/número de cada uma.
- **Testes:** `teste-v141.js` (18 conferências; 8 falham na v1.4.0); `rodar-tudo.sh` tem 19 suítes. Prints de antes e depois: `shot-antes141.js`.
- **Decisão do Elias (06/11/2026):** relatório e PDF continuam sem bonecos.

## v1.4.2 · bichos ainda maiores (src/v14.js, v14.css)
- **Pedido do Elias (06/11/2026):** além do quadro, o bicho deve ficar maior dentro do quadrado; na espera, abrir espaço para o bicho ficar maior.
- **Recorte:** `bonDesenha` monta em 320 px e entrega só a área `BON.recorte = [35, 30, 250]` (x, y, lado). A área foi medida pela união das partes opacas de todas as imagens (bichos 54–265 × 46–271, cosméticos até y 33, `desce` do jacaré até y 281). O recorte é fixo para todos, para manter o tamanho entre bichos.
- **Tamanhos:** tela de nome 140 px; espera `min(240px, 62vw)` com o nome embaixo; zoom das miniaturas de Cabeça/Detalhes 1,5 (origem 37% 34%) e Pescoço 1,33 (40% 55%); máscara radial 88%.
- **Testes:** `teste-v141.js` cobre também a v1.4.2 (20 conferências); `teste-v14.js` lê a cor da pelagem em (145, 160) por causa do recorte. Folha de conferência dos 34 bichos (com e sem chapéu de mago): `folha142.js`.
- **Pergunta do Elias:** atrasar o app em +0,3 s para compensar o atraso dos celulares. Resposta: a janela de 4 s da v1.4.1 já faz isso, e melhor, porque só espera quando há resposta a caminho; atraso fixo deixaria o controle mais lento e não cobriria celulares com 1–2 s de atraso.

## v1.4.3 · resposta que se perdia (src/celular.js, rede.js, live.js)
- **Origem:** CAIXA-DO-GROK de 07/11/2026 (v0.1.0 a v0.7.0): no Firebase real, `teste-reforco-cel.js` deu 45/48 duas vezes; a resposta do José (B) na P5 não contou.
- **Reprodução:** `rtdb-mock.js` com `SABIA_ATRASO` (cada pedido espera entre ms e 2 x ms). Com 800 ms, a v1.4.2 também falhava: o instrutor contava 6 de 6, mas o celular dizia "1 pergunta para rever".
- **Causa 1:** `guardaRev` gravava o resultado da pergunta uma vez só. Na resposta atrasada, o celular recebia `ok:-1`, guardava, e não aceitava a correção. Agora atualiza quando `res.ok` muda (e grava a resposta `m`). No pódio, `resDe` manda `q` (índices acertados) e `acertaRevPodio` acerta `CE.rev`.
- **Causa 2:** com 1,5 a 3 s por pedido, a resposta chegava depois dos 4 s. `GRACA_RESP` = 10000 ms. Sem brecha: o celular só manda resposta enquanto mostra a pergunta.
- **Causa 3:** tentativas do treino (`part/{pid}/ref/{i}`) iam em paralelo e a mais antiga podia chegar depois e apagar a mais nova. Celular em fila (`CE.filaRef`); `ingerir` só aceita `t` maior (ou mesmo `t` com `ok` maior).
- **Testes:** `teste-reforco-cel.js` espera o banco (função `refMaria`, esperas maiores com `SABIA_ATRASO`); `teste-celular.js` aceita link `p-`; suíte "lento" (`SABIA_ATRASO=1500`) no `rodar-tudo.sh` (20 suítes). Na v1.4.2, 9 falhas com 1500 ms; na v1.4.3, 0 em 3 rodadas.
- **Firebase:** sem regra nova (`res` não tem validação de campos; `q` é uma lista de números).

## v1.5.0 · Apresentar e prompt padrão (src/v15.js e src/v15.css; prefixos `apr`, `ap-`, `ia-pad`)
- **Pedido do Elias (07/11/2026):** conseguir abrir o slide ou o PDF para apresentar a todos (não conseguia); prompt padrão que, colado na IA com o conteúdo do treinamento, gere o arquivo com vários tipos de pergunta (sequência, verdadeiro ou falso, múltipla escolha).
- **Diagnóstico:** o material só ia para o telão numa explicação ligada a um capítulo; não havia Apresentar livre. O PDF dependia do leitor do navegador num iframe (no celular não abre). O PPTX aparecia só em texto e imagens.
- **Decisões tomadas sem resposta do Elias (dá para mudar):** Apresentar funciona em qualquer aparelho; para o desenho exato do PPTX, o caminho é salvar como PDF no PowerPoint; o prompt mistura os formatos num mesmo treinamento (não gera pré e pós-teste separados).
- **PDF.js:** `pdfjs-dist` 4.10.38, build legacy, em `lib/pdfjs/pdf.min.js` e `pdf.worker.min.js` (extensão .js para o GitHub Pages servir como JavaScript). Carregado por `import()` só ao abrir um PDF; se o import direto for recusado, tenta pelo conteúdo (blob). No worker, 30 caracteres de controle dentro de textos viraram `\xHH` (mesmo valor), porque a prévia (artifact) recusa arquivo com byte ESC. `sw.js` guarda os dois arquivos na instalação.
- **Visor:** o mesmo da v1.3.0 (`.matov` por cima, `.dl.mt` na janela). `matPintar` foi trocado (o original continua para PPTX e HTML): no PDF desenha a página num canvas (cabe na área, até 2x de densidade), título "Página X de N · capítulo", setas por página, `MAT.aberto.pg`/`n`. `aprBarra` põe a lista de capítulos (`.ap-cap`) e o botão Tela cheia. Teclado e cliques em captura na `window` (antes dos ouvintes da v1.3.0): no PDF as setas trocam página; no material aberto por Apresentar (`MAT.aberto.livre`), Espaço e Enter passam, Esc e M saem. Toque: terço direito/esquerdo e arrastar. Redesenha ao mudar o tamanho da janela.
- **Entradas:** painel (`aprpainel`, fecha o painel modal antes, senão o visor não recebe toque; `aprjanela` abre `#/apresentar/<id>`, rota nova com "Começar em tela cheia"/"nesta janela"; Esc na janela volta ao editor ou fecha a janela). Controle (`aprCtlHtml` depois do `matBtnCtl`): `{t:"cmd", a:"apr"|"aprir"|"aprfim"}` pelo BroadcastChannel; o telão responde `{t:"aprpos", on, pg, n, tt}`. `matAtualizaTelao` só fecha sozinho o capítulo ligado (não o livre).
- **Capítulos automáticos:** `aprCapsPdf` (marcadores; senão, página deitada e até 300 páginas = um por página com a linha de fonte maior; senão nulo). Em `matAnexar` (v13.js) com limite de 20 s; ao anexar de novo o mesmo arquivo, os capítulos ficam.
- **Prompt padrão:** `PROMPT_PADRAO` (v15.js), bloco `.ia-pad` no topo do `dlgIA`. `importarArquivo` usa `jsonSolto` (tira texto e marcas em volta) e, com `"origem":"sabia-ia"`, passa por `lerRespostaIA` (marca `ia`, limpa ordenar e V ou F). `promptIA` aceita até 50 mil letras de material.
- **Testes:** `teste-v15.js` (49 conferências: cores das páginas desenhadas, capítulos por marcador e por slide, teclado, toque, arrastar, outra janela, controle e telão, prompt e área de transferência, importar, 390 px, sem internet). Exemplos em `fx15/` (gerados por `gera-fx15.js`, sem dados reais). `teste-v13.js`: 3 conferências trocadas (esperavam o iframe e o PDF sem setas) e espera a leitura do PDF ao anexar. Prints de aprovação: `shot-antes15.js`. 21 suítes no `rodar-tudo.sh`.
- **Logotipo (pedido do Elias, 07/11/2026: "deixa essa imagem dentro do app maior, tira os contornos da foto"):** o símbolo `#logo` (src/index.html) passou a ser o desenho recortado do fundo verde, WebP com transparência de 200 px (`recorta-logo.py`, a partir do desenho original que fica com o Elias), sem o recorte arredondado (`clip-path`) e sem fundo nas caixas. Tamanhos: menu lateral 64 px (antes 48), "Próximo passo" 76 px (antes 52), Ajustes > Integração 72 px (antes 48), cabeçalho do celular 46 px (antes 32), telão 48 px (antes 34). O ícone instalado (icon-192/512, maskable, apple-touch) não mudou. `teste-v11.js`: 2 conferências trocadas para o logotipo novo. Prints: `shot-logo.js`.
