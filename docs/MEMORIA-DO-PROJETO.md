# MEMÓRIA DO PROJETO · Sabiá (antigo EFCquiz v2.8.8)

Atualizado na v0.5.0 (05/11/2026). Este arquivo sobe junto com cada versão. Toda regra nova do Elias entra aqui.

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
| v0.5.0 | pronta, aguardando aprovação | Relatórios (Resumo, Mapa da turma, Assertividade, Setores), PDF de registro e lista de presença feitos pelo próprio Sabiá, planilha CSV, sessão .json, foto da turma, logotipo, código de conferência SAB-... e página Conferir, reaplicar para quem ficou abaixo |
| v0.6.0 a v1.0.0 | a fazer | Reforço, pessoas, mensagens, integração EFClaudian, acabamento |

## Paridade com o EFCquiz (79 funções)
v0.1.0: 10 prontas e 11 parciais. v0.2.0 completa as opções de Aplicar, o controle ao vivo e o telão. v0.3.0 entrega o editor e as versões. v0.4.0 entrega o celular do participante. v0.5.0 entrega relatórios, PDFs e conferência (detalhe em features.csv: 40 prontas, 14 parciais, 25 faltando de 79).

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

## Pendências e perguntas abertas
- Repositório: https://github.com/EliasGrigori/EFC-Sabi--Quiz (criado pelo Elias em 04/11/2026). v0.1.0 e v0.2.0 publicadas na branch main (aprovadas por ele). Tags v0.1.0/v0.2.0 existem só no clone local (o envio de tags é bloqueado daqui). GitHub Pages: o Claude não consegue ligar pela API, o Elias liga em Settings > Pages > main / raiz.
- O telão continua sincronizado por BroadcastChannel (mesmo navegador/computador do instrutor). Os celulares usam o Firebase.
- Boneco do participante: só cor por enquanto (Elias descartou as imagens).
- Firebase real: projeto criado pelo Elias e testado pelo Grok com a v0.4.0 (conexão, regras, sala completa, encerrar apaga). Nenhum endereço nem chave fica nas pastas do projeto.
- Firebase: configurar o Realtime Database para usar os celulares (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md). A integração com o EFClaudian vem depois.
- Personagens: decidir depois (galeria de bonecos prontos ou ilustrações simples).
