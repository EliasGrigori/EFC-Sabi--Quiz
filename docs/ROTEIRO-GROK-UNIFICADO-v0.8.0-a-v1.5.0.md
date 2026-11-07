# Roteiro do Grok · Sabiá v0.8.0 a v1.5.0 (o que ainda não foi conferido)

Criado em 07/11/2026. Continua o CAIXA-DO-GROK da v0.1.0 a v0.7.0.

## Antes de começar
- Teste a versão **v1.5.0**, a que está no ar: https://eliasgrigori.github.io/EFC-Sabi--Quiz/ (Ajustes deve mostrar "Sabiá v1.5.0"), ou o `dist/` do pacote `sabia-v1.5.0.zip`.
- Os scripts estão em `tools/` do mesmo pacote. Rode contra o mock primeiro e, quando fizer sentido (celular, reforço, pessoas, bonecos), também contra o Firebase real.
- As regras do Firebase real precisam ser as da v1.4.0 em diante (têm o campo `b` do bicho). Sem elas, o celular entra com a bolinha de iniciais em vez do bicho.
- Use nomes inventados. Não altere o código do app. No fim, encerre as salas que os scripts deixarem no pódio e confira que não sobrou nenhuma.
- Responda no mesmo formato do CAIXA anterior: OK, PARCIAL, FALHA ou NÃO TESTADO por item, com prints e logs.

## 1. Reteste da suspeita da v0.6.0 (fazer primeiro)
No Firebase real, a resposta do José (B) na P5 não foi contada. O Claude reproduziu com o banco de teste lento e corrigiu na **v1.4.3** (três causas; ver a seção v1.4.3 no fim deste roteiro).
1. Rode `teste-reforco-cel.js` contra o Firebase real com a v1.5.0 (que inclui a v1.4.3), 2 rodadas. Esperado: 48/48, José com 6 de 6 e "Você acertou tudo" no celular dele.
2. Rode também com o banco de teste lento: `SABIA_ATRASO=1500 node teste-reforco-cel.js dist <prints>`. Esperado: 48/48.
3. À mão, com 2 celulares: responder e, no mesmo instante, tocar em "passar", várias vezes. Ninguém pode ficar "sem resposta" tendo respondido, e o celular não pode pedir para rever uma pergunta que o instrutor contou como certa.
4. O teste do celular agora aceita o link `p-` do Firebase real (antes acusava falha de script).

## Sabiá v0.8.0

Precisa de um navegador, de uma conta do EFClaudian de cada perfil (Primário, Líder estrela, Colaborador) e da configuração do Firebase do EFClaudian (não salve em nenhum arquivo). Sem isso, rode `teste-integra.js` (66 testes, com SDK de mentira) sobre `dist`.

### O que foi feito
Perfis: Primário, Líder estrela e Colaborador (Ajustes > Perfil e conta). Primário e Líder estrela criam, editam, aplicam, veem Pendências, Pessoas e Mensagens. Colaborador só consulta Início, Treinos (sem Novo, Editar, Aplicar, Excluir, Duplicar, Importar), Relatórios, Conferir e Ajustes.
Conta do EFClaudian (Ajustes > Integração): a pessoa cola uma vez, neste aparelho, a configuração do Firebase do EFClaudian (apiKey, authDomain, projectId, appId e, se houver, a chave do App Check). Ela fica só no localStorage (`sabia-efc-cfg`), fora dos dados exportáveis e fora do código. Depois entra com login ou e-mail e senha, como no EFCquiz: o login procura o e-mail em `sv2_login`, e o perfil vem de `sv2_users/{uid}` (perfil "principal" = Primário; `estrela` = Líder estrela; senão Colaborador; `bloqueado` recusa). Sair só do Sabiá, voltar a usar a conta conectada e sair de tudo.
Porta de entrada (Ajustes > Integração, desligada por padrão): ligada, o Sabiá só abre em aparelho ativado por `?ativar=1` (menu do EFClaudian), ou por login de responsável. Ligar ativa o aparelho atual. `?demo=1` abre a demonstração com sessões marcadas como teste. A rota do celular do participante (`#/entrar/...`) nunca é bloqueada.
EFC_API para o EFClaudian: versao(), perfil(), conta(), abrir(rota).
Ajustes completo, com índice de 10 seções: Identificação, Perfil e conta, Aparência, Telão e sala (telão e som padrão de cada sessão), Demonstração (carregar exemplos, apagar sessões de teste), Setores e pessoas, Celulares, Armazenamento, Integração, Observações.
Observações do treinamento (no editor): anotações com autor e data; só Primário e Líder estrela; não criam versão.
Correção: botões de remover setor tinham 28 px; agora 36 px.

### Como conferir que deu certo
1. Ajustes > Perfil e conta: troque para Colaborador. O menu perde Pendências, Pessoas e Mensagens; a barra do celular fica com Início, Treinos e Mais; Treinos não mostra Novo, Editar, Aplicar nem Excluir; digitar o endereço #/pessoas, #/aplicar/x, #/editar/x, #/sala/x volta ao Início com aviso. Volte para Primário.
2. Editor de um treinamento: caixa "Observações do treinamento". Anote, exclua e use Desfazer. Confira que o treinamento não vira "alterações sem versão".
3. Ajustes > Telão e sala: mude o padrão para Claro e abra Aplicar: o telão já vem claro. Demonstração: "Carregar exemplos" e "Apagar sessões de teste" (com Desfazer; as oficiais ficam).
4. Integração: cole a configuração do Firebase do EFClaudian (sem chave: mostra erro). A configuração não pode aparecer em "Exportar tudo" nem em nenhum arquivo do projeto.
5. Entre com um responsável Primário: aparece "Conectado", o perfil vem da conta e o seletor de perfil some. Repita com uma conta Líder estrela e uma de Colaborador. Senha errada: "Login ou senha não conferem". Conta sem cadastro em `sv2_users` ou bloqueada: "Esta conta não tem cadastro ativo no EFClaudian".
6. Recarregue: a conta continua. "Sair só do Sabiá" volta ao perfil do aparelho e oferece "Voltar a usar a conta conectada", sem senha. "Sair de tudo" desconecta também do EFClaudian.
7. Porta: ligue. Em outro navegador (ou apagando `sabia-ativado` do armazenamento local) abra o Sabiá: aparece "Este aparelho ainda não foi ativado" e nenhum menu. Entre com a conta de responsável: abre. Abra com `?ativar=1`: abre. Abra `#/entrar/123456` no celular: continua abrindo (participante). Abra com `?demo=1`: abre com a faixa "Demonstração".
8. Celular de 390 px e tema escuro: Ajustes, a porta e Treinos como Colaborador sem rolagem lateral e com alvos de toque de pelo menos 36 px.

### Outros erros para procurar
- **O ponto mais importante:** a conta usa o SDK do Firebase carregado de gstatic.com e as mesmas chamadas do EFCquiz original (`sv2_login`, `sv2_users`, `signInWithEmailAndPassword`). Os testes usam um SDK de mentira, então só você e a conta real provam que funciona. Se o App Check do projeto estiver exigido, cole a chave dele junto com a configuração (campo `appCheckKey`).
- O login do EFClaudian é compartilhado pelo navegador (mesma origem). Se o Sabiá estiver em outro endereço que o EFClaudian, o login não é compartilhado e pede senha.
- A porta de entrada é uma trava de uso no aparelho, não segurança: quem souber `?ativar=1` passa. Confira se a mensagem deixa isso claro.
- Colaborador conectado por conta e tentando apagar dados, importar arquivo ou criar treinamento por algum caminho que eu não vi.
- Perfil trocado em Ajustes sem conta: vale só neste aparelho (não é segurança).
- Sem internet: o Sabiá deve abrir e usar a última conta conhecida.
- Console sem erros em Ajustes, porta, editor e celular. Escreva tudo em `CAIXA-DO-GROK.md`.

### Ainda não existe (não conta como erro)
Voz, banco de perguntas, painel lateral das versões, carimbo de tempo, regras do Firebase mais rígidas (v1.0.0); temas do EFClaudian (o Sabiá mantém a identidade própria); mensagens e pendências ligadas ao EFClaudian (reforço de NC).

## Sabiá v1.0.0

Precisa de um navegador, de um celular (ou janela de 390 px) e do Realtime Database do Firebase do Sabiá. Não use dados reais. Sem Firebase, rode `node teste-regras.js`, `node teste-v10.js dist prints` e `node teste-v10-cel.js dist prints` (os testes usam um Firebase de mentira que aplica as regras de `docs/firebase-rules.json`).

### O que foi feito
Banco de perguntas: no editor, o botão do livro guarda a pergunta aberta; "Inserir do banco de perguntas" abre o banco com busca, filtro por formato, Inserir (traz uma cópia no fim do treinamento) e Excluir (com Desfazer dentro do diálogo); "Guardar as perguntas deste treinamento" guarda todas sem repetir. O banco fica só neste aparelho e vai no "Exportar tudo". A voz gravada não vai para o banco.
Criar com uma IA (Novo treinamento): o Sabiá não chama IA nenhuma. Ele monta um texto pronto (assunto, público, quantidade e, se você colar, o POP como única fonte) para colar na IA que você quiser, e lê a resposta em JSON (aceita texto antes e depois e cercas de código). O treinamento nasce marcado "Criado com IA: confira antes de aplicar" (editor e Aplicar) até você tocar em "Já revisei". Formatos inventados, perguntas sem enunciado e áudio embutido são descartados.
Pergunta de teste: Aplicar > Ajustes da sessão > "Começar com uma pergunta de teste" (desligado por padrão). Entra no começo da sessão (não muda o treinamento), não vale nota e não entra no código de conferência.
Voz gravada: no editor, "Gravar a voz" (até 30 s, pede o microfone), regravar e remover com Desfazer. Toca no telão sozinho quando a pergunta abre (se o navegador deixar) e pelo botão "Ouvir". Fica guardada no treinamento e no exportar, e NUNCA vai ao Firebase (conferido: a publicação da sala não leva áudio).
Ouvir no celular: botão "Ouvir a pergunta" lê o enunciado e as opções na ordem da tela, e "Ouvir a resposta" no resultado lê a certa e o porquê, pela voz do próprio celular (pt-BR). Some se o aparelho não tiver voz.
Carimbo de tempo: no Relatório, "Carimbar o horário" grava `/selos/{código}` = horário do SERVIDOR do Firebase, uma única vez. Aparece no relatório, no PDF de registro e em Conferir > "Consultar o carimbo de um código". Não é carimbo de autoridade certificadora (ICP-Brasil); o app diz isso. Recusa carimbar registro que já não confere com o código.
Regras do Firebase mais firmes (`docs/firebase-rules.json`): `part` aceita só n, c, s, t, ref, com e rsp, com tipo e tamanho; `ref` (tentativas 0 a 3, ok 0 ou 1), `com` (k, x até 300 letras, t), `rsp` (x até 300 letras); `selos` só grava uma vez, com o horário do servidor e código no formato SAB-XXXX-XXXX-XXXX-XXXX-XXXX; ninguém lista salas nem carimbos.

### Como conferir que deu certo
1. **Publique as regras novas ANTES de tudo:** Ajustes > Celulares na sala > Copiar as regras; no console do Firebase, Realtime Database > Regras, cole e clique em Publicar. No "Simulador de regras" (Rules Playground) do console teste: gravar em `/salas/123456/part/p1` com `{"n":"Ana","c":1,"s":"","t":1}` deve passar; gravar `{"n":"Ana","hack":"x"}` deve ser recusado.
2. Ajustes > Celulares na sala > Testar conexão: deve dar "Conectado".
3. Sala completa com 1 celular: entre, responda, peça o resultado, rever o que errei e treinar de novo (grava `ref`), envie um comentário (grava `com`), responda no instrutor (grava `rsp`) e assine. **Se alguma dessas etapas falhar só com as regras novas, anote qual: é a regra apertada demais.**
4. Relatório de uma sessão encerrada com Firebase configurado: "Carimbar o horário". Deve aparecer data, hora e segundos e "servidor do Firebase". No console, `/selos/SAB-...` deve ter só `t`. Toque de novo em outro aparelho: mostra o horário original. Gere o PDF de registro e confira a linha "Carimbo de tempo".
5. Conferir > digite o código > "Consultar carimbo". Um código sem carimbo diz "Sem carimbo".
6. Banco: guarde duas perguntas, crie outro treinamento e insira. Busque por palavra. Exclua e use Desfazer. Exporte tudo, apague tudo, importe: o banco volta.
7. Criar com IA: use o texto montado numa IA, cole a resposta, crie. Confira cada pergunta com o POP. Tente colar texto sem JSON: deve explicar o erro.
8. Voz: grave uma pergunta, abra a sala e o telão em outra janela. A voz toca ao abrir a pergunta e pelo botão Ouvir. No Firebase, `/salas/{chave}/pub/item` não pode ter áudio.
9. Celular: toque em "Ouvir a pergunta" (Chrome do Android e Safari do iPhone) e em "Ouvir a resposta".
10. Celular de 390 px e tema escuro: banco, criar com IA, editor com voz e relatório com carimbo sem rolagem lateral e com alvos de pelo menos 36 px.

### Outros erros para procurar
- **O ponto mais importante é o item 3:** as regras novas foram provadas só com um avaliador que escrevi (44 conferências, e todas as suítes de celular rodaram sob elas). O Firebase real é quem decide. Se recusar `ref`, `com`, `rsp` ou `part`, volte ao arquivo `docs/firebase-rules-v0.8.0-anterior.json` (as regras da v0.8.0) e me diga a mensagem exata.
- Voz gravada: o microfone só funciona em endereço https. Teste Chrome e Safari. Confira se grava, para e toca de novo depois de recarregar.
- Autoplay do telão: alguns navegadores só tocam depois de um clique na janela do telão. O botão "Ouvir" cobre isso. Diga se a voz some quando a pergunta muda rápido.
- Ouvir no celular: a qualidade da voz depende do aparelho. Veja se o iPhone lê em português.
- Carimbo: o horário é do Firebase do próprio projeto. Quem é dono do projeto consegue editar no console. Confira se as mensagens deixam isso claro.
- Criar com IA: o app não confere se a IA acertou. Veja se o aviso "confira antes de aplicar" aparece e some só em "Já revisei".
- Console sem erros em todas as telas novas. Escreva tudo em `CAIXA-DO-GROK.md`, com a versão.

### Ainda não existe (não conta como erro)
Meta em pontos, painel lateral das versões, material com capítulos (abre por cima da tela), modos de telão projetor e apresentação, folha de reforço em PDF, perfil do participante no celular (precisa de login), boneco do participante (decisão do Elias: só cor), carimbo de autoridade certificadora.

## Sabiá v1.0.1 (ícone novo)

### O que foi feito
Só o ícone do app mudou (desenho do Elias, contornos reforçados, fundo petróleo com relevo). `VERSAO` passou a 1.0.1 e o cache offline a `sabia-1.0.1`. Nenhuma regra nem tela mudou.

### Como conferir
1. Abra o app com Ctrl+F5. Ajustes deve mostrar "Sabiá v1.0.1".
2. A aba do navegador mostra o ícone novo (rosto com fundo verde em relevo).
3. Abra `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` e `apple-touch-icon.png` direto pelo endereço: os quatro carregam (200) e são imagens diferentes das da v1.0.0.
4. DevTools > Application > Manifest: os 3 ícones aparecem; o maskable cabe no círculo (rosto inteiro dentro).
5. Instale o app no celular (ou remova e reinstale): o ícone da tela inicial é o novo.
6. Offline: desligue a internet e recarregue; o app abre e o ícone continua.

### Outros erros para procurar
- Ícone antigo ainda aparecendo depois de Ctrl+F5 (cache do service worker não trocou).
- Cantos pretos ou brancos no ícone arredondado; recorte do ícone maskable cortando a testa ou o queixo.
- Ícone borrado em 32 px (aba do navegador).
- Qualquer tela do app mudando de aparência: não deveria.

## Sabiá v1.1.0

### O que foi feito
1. **Telão:** barra com Tela cheia (F), Projetor (P) e Apresentação (A).
2. **Folha de reforço em PDF** no relatório da sessão.
3. **Painel do treinamento** no editor (gaveta pela direita).
4. **Logotipo de dentro do app** trocado pelo desenho novo e **fundo do ícone** igualado ao verde do app (#0E4A48).

### Como conferir
**Telão** (abra a sala no Sabiá, depois "Abrir telão"; telão e controle no mesmo navegador)
- Ao abrir, a barra aparece e some em ~3 s; mexer o mouse traz de volta.
- P: fundo branco, texto preto, QR e números legíveis. P de novo: volta ao escuro. Fechar e abrir o telão: o modo continua.
- F: entra em tela cheia (se o navegador negar, aparece aviso com F11).
- A: tela cheia, dica "Espaço ou seta para a direita avança", cursor some depois de parado. Espaço, Enter ou seta direita avançam a sala no controle (explicação, pergunta, resultado). No pódio nada acontece e aparece aviso. A de novo (ou Esc da tela cheia) sai.
- Espaço fora da apresentação NÃO avança.

**Folha de reforço**
- Encerre uma sessão com gente abaixo da meta, abra o Relatório: botão "Folha de reforço (N)" com N = quem ficou abaixo.
- O PDF tem uma página por pessoa, só com perguntas que errou ou não respondeu, "Você marcou", "Resposta certa", "Por quê", "Para rever" e "Ciente: nome".
- Sem ninguém abaixo da meta e em pré-teste o botão não existe.

**Painel**
- Editor > Painel. Abas: Visão geral (perguntas, duração, meta, sessões, pessoas, acerto médio, validade, reavaliação, comentários), Acerto por versão (barra por versão com marca da meta e diferença em pp), Comentários (só deste treinamento).
- No celular (390 px) a gaveta ocupa a tela inteira e não rola para o lado.

**Logotipo e ícone**
- O menu lateral, "Próximo passo", o telão, o cabeçalho do celular e Ajustes > Integração mostram o desenho novo (não o pássaro).
- O verde do fundo do ícone tem o mesmo tom do menu lateral.

### Outros erros para procurar
- Barra do telão cobrindo conteúdo importante ou não voltando depois de sumir.
- Espaço avançando duas vezes, ou avançando sem estar em apresentação.
- Folha de reforço com texto cortado, página em branco ou pessoa repetida; acentos errados.
- Painel mostrando comentários de outro treinamento ou médias com sessões de teste/ensaio.
- Logotipo borrado ou com cantos quadrados em algum lugar; modo escuro com borda estranha.
- Cache antigo: depois de Ctrl+F5, Ajustes deve mostrar "Sabiá v1.1.0".

## Sabiá v1.2.0 (meta em pontos)

### O que foi feito
Cada treinamento pode ter meta em **%** (como antes) ou em **pontos**. Regra do Elias: a pessoa atinge a meta se fizer X pontos ou mais, **sem contar o bônus de rapidez**. Cada acerto vale 1.000 pontos.

### Como conferir
1. Editor de um treinamento com 4 perguntas valendo nota: o campo **Meta** tem um seletor "% de acertos / pontos".
2. Trocar para **pontos**: 80% vira **3.000**; a ajuda diz "Máximo deste treinamento: 4.000 pontos (4 perguntas), então a meta pede 3 acertos". O campo anda de 1.000 em 1.000.
3. Digite 5000: a ajuda avisa "A meta passa do máximo: ninguém vai atingir" (texto em vermelho). Digite 0: não grava.
4. Voltar para %: 3.000 vira 75%.
5. Salve uma versão com pontos, mude para %, abra Versões > Comparar: aparece "Meta era 3.000 pontos". Restaurar traz os pontos de volta; Desfazer volta ao anterior.
6. Lista de treinamentos e resumo do editor mostram "3.000 pontos".
7. Aplique uma sessão com 4 pessoas: acertam 4, 3, 2 e 1 perguntas. **Atingem a meta só as duas primeiras** (4 e 3 acertos). O Relatório diz "meta de 3.000 pontos"; o PDF de registro tem "Meta de acerto 3.000 pontos" e "Como a meta conta: 1.000 pontos por acerto, sem o bônus de rapidez".
8. O telão mostra "3.000 pontos de meta" na espera e no pódio.
9. A coluna **Pontos** do relatório inclui o bônus de rapidez (por exemplo 3.600) e pode passar de 3.000 mesmo com 2 acertos: a meta olha só os acertos, não essa coluna.
10. Exportar o treinamento (.json) e importar de volta mantém a meta em pontos. Arquivo com meta em pontos absurda (999999) cai para 80%. Arquivo antigo (só %) continua igual.
11. Treinamento em % funciona exatamente como antes (80% continua 80%).

### Outros erros para procurar
- Pessoa com um acerto a menos do que a meta pede sendo marcada como "Atingiu a meta" (ou o contrário). Teste com 3, 5, 7 e 10 perguntas.
- Mudar a meta do treinamento com a sala já aberta alterando a conta daquela sessão (não deve: a conversão é feita uma vez).
- Reforço "só as perguntas que erraram" usando uma meta diferente da sessão original (deve usar a mesma).
- Meta em pontos com treinamento sem perguntas valendo nota (a ajuda deve pedir para adicionar perguntas).
- Campo da meta cortado no celular de 390 px; seletor difícil de tocar.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.2.0".

## Sabiá v1.3.0 (material com capítulos)

### O que foi feito
Cada treinamento pode ter um **material de apoio** (PPTX de preferência, ou PDF, ou HTML) guardado só neste aparelho. As **explicações** podem apontar para um **capítulo** do material; na sala, o instrutor abre esse capítulo por cima do telão. O painel do treinamento ganhou a aba **Material**.

### Como conferir
1. Editor de um treinamento > botão **Painel** > aba **Material** (quarta aba). Sem arquivo ela explica o que anexar e que o arquivo fica só neste aparelho.
2. **Anexar arquivo** com um PPTX de 4 slides: aparece o nome, o tipo "PPTX", o tamanho e 4 capítulos (um por slide, com o título do slide; slide sem título usa a primeira linha de texto).
3. Tente anexar: um PDF falso (txt renomeado), um .ppt antigo, um arquivo acima de 25 MB. Cada um é recusado com aviso claro e não troca o material que já existe.
4. Feche o painel e abra uma **explicação**: aparece "Capítulo do material" com "Slide N: título". Pergunta (múltipla, V ou F, ordenar) não mostra esse campo. Escolha "Nenhum" apaga a ligação. No painel, cada capítulo mostra "1 explicação" quando está ligado.
5. Aplique uma sala. Na explicação ligada, o controle mostra "Material: <capítulo>" com **Mostrar no telão** e **Ver aqui**. Em pergunta ou na espera esses botões não aparecem.
6. **Ver aqui** abre o slide em texto (título, tópicos com recuo, tabelas como linhas "a | b", imagens). Setas ou botões trocam de slide; Esc fecha.
7. **Mostrar no telão** (mesmo navegador) abre o capítulo por cima do telão com o tema do telão (escuro, claro ou projetor). No telão: tecla **M** abre o capítulo da explicação atual e fecha de novo; setas trocam de slide **sem avançar a sala**; em modo apresentação Espaço e Enter também não avançam enquanto o material está aberto; Esc fecha. O telão mostra "Material: ... · tecla M" na explicação.
8. Ao passar para a pergunta, o material do telão fecha sozinho e o botão Material some.
9. PDF: anexe um PDF; o capítulo inicial é "Documento inteiro" (página 1). Adicione capítulos com título e página (1 a 2000); ficam em ordem de página; dá para apagar. A explicação abre o PDF **na página do capítulo** (leitor do navegador; há o botão "Abrir em outra aba").
10. HTML: anexe um .html. Abre isolado (sem rodar scripts, sem acesso ao Sabiá).
11. **Trocar arquivo** ou **Remover** desliga as ligações das explicações. Duplicar o treinamento leva o material junto. Exportar o treinamento (.json) **não** leva o arquivo.
12. Celular de 390 px: o painel e o visor ocupam a tela toda, sem rolar para o lado, nos temas claro e escuro.

### Limites que são assim de propósito
- O arquivo fica no navegador deste aparelho (IndexedDB "sabia-material"). Não vai para o Firebase, nem para os celulares dos participantes, nem para o "Exportar tudo". Em outro aparelho o treinamento mostra "o arquivo não está neste aparelho".
- Slides do PPTX aparecem como texto e imagens, não como o desenho exato (cores, formas, animações). Para o desenho exato, use o PDF. Se o navegador não tiver `DecompressionStream`, o PPTX não abre e o aviso manda usar o PDF.
- Capítulos do PDF são digitados à mão (título e página). Capítulos do HTML: só "Documento inteiro".
- Telão e controle no mesmo navegador (BroadcastChannel). O leitor de PDF depende do navegador (no celular costuma abrir em outra aba).
- Arquivos de treinamentos excluídos são apagados do aparelho na próxima abertura do app (depois que o "Desfazer" some).

### Outros erros para procurar
- PPTX de outro programa (Keynote, Google Slides exportado, LibreOffice): títulos faltando, ordem dos slides errada, caracteres estranhos, imagens que não aparecem.
- PPTX com muitas imagens grandes: demora para abrir cada slide? Passa de 25 MB e foi recusado corretamente?
- Capítulo apontando para um slide que não existe mais depois de trocar o arquivo (não deve: as ligações são apagadas).
- Apresentação: Espaço avançando a sala com o material aberto (não deve).
- Material aberto no telão sobrando ao encerrar a sala ou trocar de rota.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.3.0".

## Sabiá v1.3.1 (material grande, só no aparelho)

### O que foi feito
Regra nova do Elias: o material pode ser **grande** (PPTX e PDF até 300 MB; HTML até 30 MB), mas **nunca vai para a nuvem**. O arquivo fica só no aparelho; o título e os capítulos viajam na exportação do treinamento. Em outro aparelho é preciso anexar de novo o mesmo documento.

### Como conferir
1. Anexe um PPTX ou PDF de uns 50 a 100 MB (Painel > Material): é aceito, mostra o tamanho em MB e abre rápido. Um arquivo acima de 300 MB, ou HTML acima de 30 MB, é recusado com aviso.
2. Exporte o treinamento (.json) e abra o arquivo no bloco de notas: tem `material` com nome, tipo, tamanho e capítulos, e `cap` nas explicações, mas **nada do conteúdo do arquivo**.
3. Em outro navegador (ou perfil novo), importe o .json. Painel > Material mostra o nome, os capítulos e o aviso "O arquivo não está neste aparelho". Na sala, "Ver aqui" diz o mesmo.
4. Clique em "Anexar o mesmo arquivo": PDF no lugar de PPTX é recusado; PPTX com outro número de slides é recusado; o mesmo arquivo volta a funcionar e as ligações das explicações continuam.
5. Confirme no Firebase (Realtime Database) que **nenhum** dado de material aparece.

### Outros erros para procurar
- Espaço do navegador: arquivo grande com disco quase cheio deve dar aviso, não travar.
- PPTX gigante de outro programa que o leitor não abra (ZIP64): deve mandar usar PDF.
- Importar um .json de material com tipo estranho: o material é ignorado e as ligações somem.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.3.1".

## Sabiá v1.4.0 (bonecos)

### O que foi feito
Cada participante monta o seu bicho no celular: 17 animais (cachorro, gato, guaxinim, raposa, onça-parda, veado-catingueiro, jegue, tatu-bola, preá, mocó, teiú, jacaré, tartaruga, sabiá, carcará, asa-branca, cardeal), 10 cores de pelagem, 6 roupas, 11 detalhes (brincos, piercings, tatuagens, manchas), 23 cosméticos de cabeça e 6 de pescoço. Todos começam com gato ou cachorro sorteado. O boneco aparece na sala do instrutor, no telão (multidão, ranking e pódio) e no celular.

### ANTES DE TESTAR: publicar as regras novas
Copie `docs/firebase-rules.json` (ou Ajustes > Copiar regras) e publique no console do Firebase (Realtime Database > Regras). Sem isso o celular entra na sala, mas sem o boneco (o banco recusa o campo novo `b` e o app tenta de novo sem ele), e "Mudar meu bicho" depois de entrar não chega ao instrutor.

### Como conferir
1. Ctrl+F5: Ajustes mostra "Sabiá v1.4.0".
2. Abra uma sala com o Firebase ligado e entre pelo celular. Na tela de nome aparece "Seu bicho" com um gato ou um cachorro (abra em aparelhos diferentes: os dois aparecem).
3. "Montar meu bicho": abas Bicho, Cor, Roupa, Detalhes (até 4, toque de novo para tirar), Cabeça e Pescoço, com miniaturas. "Sortear" monta um aleatório. "Pronto" volta para o nome sem perder o que foi digitado.
4. Tatu e tartaruga: a aba Roupa avisa que o casco não deixa vestir. Jacaré e teiú: sem detalhes de rosto e sem óculos/pirata.
5. Entre na sala: o boneco aparece no celular, na lista do instrutor e no telão. Mude o bicho depois de entrar ("Mudar meu bicho"): o instrutor e o telão atualizam.
6. Termine a sala: o pódio do telão mostra os três bonecos grandes; a lista do 4º ao 10º mostra pequenos.
7. "Outra pessoa vai usar este celular" faz o próximo começar com gato ou cachorro sorteado.
8. Sem internet: depois da primeira abertura, os bonecos continuam aparecendo (sw guarda as 318 imagens).
9. Celular de 390 px: o montador cabe sem rolar para o lado, nos temas claro e escuro.

### Outros erros para procurar
- Boneco que não aparece (quadrado vazio) em algum navegador, principalmente iPhone (Safari). O desenho usa canvas e WebP.
- Cor da pelagem estranha em algum bicho, ou partes que deviam mudar de cor e não mudam (as listras do gato ficam laranja de propósito).
- Chapéu atravessando orelhas grandes (jegue, veado, raposa): é esperado, mas anote se algum ficar feio.
- Celular antigo (v1.3.1 aberto sem atualizar) entrando numa sala da v1.4.0: deve entrar e aparecer com o círculo de cor.
- Relatório e PDF devem continuar sem bonecos (decisão do Elias). Se algum bicho aparecer lá, é erro.
- Muitos participantes (30+) no telão: lentidão ao desenhar os bonecos.

## Sabiá v1.4.1 (ajustes dos bichos)

### O que foi feito
1. Bichos maiores no celular: tela de nome 112 px, espera 150 px, prévia do montador 150 px, bicho ao lado do nome no jogo e no ranking do celular 42 px. Opções do montador em 2 colunas, miniaturas de cerca de 156 px, quadradas.
2. Resposta que chega atrasada conta: o instrutor guarda a pergunta que acabou de fechar (`s.ult`) e aceita a resposta dela por até 4 s (`GRACA_RESP`). O bônus da gincana é calculado como se a resposta tivesse chegado no último instante da pergunta. Vale também quando já se abriu a pergunta seguinte (pré-teste).
3. Aba Cor do montador corrigida: a classe do círculo de amostra (`bon-cor`) coincidia com a classe da lista inteira; agora é `bon-amostra`. Esse erro já existia na v1.4.0.
4. Iniciais ignoram hífen e sinais ("Teste - José Elias" vira TJ, antes T-).

### Como conferir
1. Ctrl+F5 (ou fechar e abrir o Sabiá duas vezes no celular): Ajustes mostra "Sabiá v1.4.1".
2. Celular de 390 px: tela de nome, montador (abas Bicho, Cor, Roupa, Detalhes, Cabeça, Pescoço) e espera. Bichos grandes, 2 colunas, sem rolagem para o lado, nos temas claro e escuro.
3. Aba Cor: 10 cores visíveis, cada uma com nome; tocar numa cor muda o bicho da prévia.
4. Resposta atrasada: com um celular real, abra uma pergunta, responda e, no mesmo instante, toque em passar no controle. Repita várias vezes. A pessoa deve aparecer com acerto, não como "sem resposta". Para forçar o atraso, ligue o modo avião por um instante antes de tocar, com a pergunta aberta, e desligue logo depois de passar (dentro de 4 s); depois de 4 s a resposta não conta.
5. Nome com hífen na sala ("Ana - Paula"): a bolinha mostra AP.
6. Nenhuma regra nova no Firebase: as da v1.4.0 continuam valendo.

### Outros erros para procurar
- Resposta atrasada contada duas vezes ou pontos em dobro.
- Resposta de uma pergunta antiga (mais de 4 s depois) entrando e mudando o ranking.
- No modo com tempo, a pergunta fecha sozinha e a resposta chega logo depois: deve contar.
- Miniaturas cortadas ou texto sobreposto nas abas Detalhes e Cabeça em telas muito estreitas (320 px).
- Montador pesado em celular antigo, com 2 colunas de imagens grandes.

## Sabiá v1.4.2 (bichos ainda maiores)

### O que foi feito
1. Recorte fixo ao montar o bicho (`BON.recorte = [35, 30, 250]`): tira a borda vazia das imagens de 320 px e entrega 250 px. O bicho fica cerca de 28% maior no mesmo quadro, em todo lugar (celular, lista do instrutor, telão, pódio). O recorte é igual para todos os bichos.
2. Tela de nome: quadro do bicho de 112 para 140 px.
3. Espera no celular: bicho em cima do nome, com `min(240px, 62vw)`.
4. Zoom das miniaturas de Cabeça/Detalhes/Pescoço recalculado para o recorte; máscara das bordas mais aberta (88%).

### Como conferir
1. Ctrl+F5 (no celular, fechar e abrir duas vezes): Ajustes mostra "Sabiá v1.5.0".
2. Monte bichos com o chapéu de mago, coroa, capacete e os itens de pescoço: nenhuma ponta cortada no quadro, em nenhum dos 17 bichos (jacaré e teiú são os mais compridos).
3. Celular de 390 px e de 320 px: tela de nome, montador (todas as abas) e espera. Sem rolagem para o lado; nome sempre embaixo do bicho na espera.
4. Telão: sala de espera, pódio (3 primeiros) e lista do 4º ao 10º com os bichos maiores e sem sobrepor nomes.

### Outros erros para procurar
- Bicho borrado demais em telas grandes (o desenho tem 250 px).
- Chapéu ou rabo sumindo pela máscara das bordas.
- Na espera, botões empurrados para fora da tela em celulares baixos.

## Sabiá v1.4.3 (resposta que se perdia)

### O que foi feito
1. **Celular corrige o resultado guardado:** se a resposta chega ao instrutor depois de fechar a pergunta, o instrutor conta (v1.4.1) e agora o celular também atualiza o que guardou (`guardaRev` atualiza quando o resultado muda). No pódio, o instrutor manda em `res/{pid}.q` a lista das perguntas que a pessoa acertou, e o celular acerta as contas (`acertaRevPodio`).
2. **Janela da resposta atrasada:** de 4 s para 10 s (`GRACA_RESP`).
3. **Treino no celular em ordem:** as tentativas (`part/{pid}/ref/{i}`) vão uma de cada vez (`CE.filaRef`), e o instrutor nunca troca uma tentativa mais nova por uma mais antiga.
4. **Testes:** `rtdb-mock.js` aceita `SABIA_ATRASO=ms` (cada pedido espera entre ms e 2 x ms); `teste-reforco-cel.js` espera o banco com paciência; `teste-celular.js` aceita o link `p-` do Firebase real; nova suíte "lento" no `rodar-tudo.sh`.

### Como conferir
1. Ajustes mostra "Sabiá v1.5.0".
2. `teste-reforco-cel.js` no Firebase real, 2 rodadas: 48/48, José com 6 de 6 e "Você acertou tudo" no celular dele.
3. Mock lento: `SABIA_ATRASO=1500 node teste-reforco-cel.js dist prints` deve dar 48/48. (Na v1.4.2 dava 9 falhas.)
4. À mão, 2 celulares: responder e, no mesmo instante, tocar em passar, várias vezes. No pódio, o celular não pode dizer "pergunta para rever" de uma pergunta que o instrutor contou como certa.
5. Treinar de novo no celular, errando e acertando rápido: o cartão "Treino no celular" do instrutor e o relatório mostram a pergunta recuperada.
6. Nenhuma regra nova no Firebase.

### Outros erros para procurar
- Resposta contada duas vezes ou pontos em dobro.
- Resposta que chega mais de 10 s depois entrando no ranking.
- Celular mostrando acerto que o instrutor não contou (o contrário do erro corrigido).

## Sabiá v1.5.0 (Apresentar e prompt padrão)

### O que foi feito
1. **PDF desenhado de verdade:** o visor do material desenha cada página do PDF com o PDF.js (pasta `lib/pdfjs/`, licença Apache 2.0, guardado pelo `sw.js` para funcionar sem internet). Antes era o leitor do navegador num iframe.
2. **Apresentar:** no painel do treinamento (aba Material), "Apresentar" abre o material em tela cheia nesta janela; "Abrir em outra tela" abre `#/apresentar/<id>` numa janela só da apresentação (para o projetor).
3. **Controle da sala:** "Apresentar no telão" desde a sala de espera. O telão abre o material, o controle mostra "No telão: página X de N" com Anterior, Próxima e "Voltar ao quiz". Avançar o quiz não fecha a apresentação. Se o telão não responder em 2 s, o controle avisa.
4. **Navegação:** seta, Espaço, Enter, PageDown passam; seta para a esquerda e PageUp voltam; tocar no terço direito ou esquerdo, ou arrastar para o lado; lista de capítulos; F ou botão Tela cheia; Esc sai.
5. **Capítulos automáticos do PDF:** pelos marcadores do arquivo; sem marcadores e com página deitada (apresentação exportada), um capítulo por página com o título do slide; senão "Documento inteiro". Limite de 20 s na leitura.
6. **PPTX:** o painel ensina a salvar como PDF no PowerPoint para apresentar com o desenho dos slides. O Apresentar funciona com PPTX em texto e imagens.
7. **Prompt padrão:** "Novo > Criar com uma IA" ganhou "Copiar prompt padrão". O prompt pede explicação por assunto e de 8 a 12 perguntas misturando 4 de múltipla escolha, 3 de V ou F e 3 de sequência, só com o conteúdo enviado, entregando `treinamento-sabia.json`. "Importar arquivo" aceita o JSON mesmo com texto ou marcas em volta e marca "Criado com IA". O texto sob medida aceita até 50 mil letras de material (antes 6 mil).
8. **Logotipo de dentro do app:** o desenho foi recortado do fundo verde (sem a moldura da foto) e ficou maior: menu lateral 64 px (antes 48), "Próximo passo" 76 px (antes 52), Ajustes > Integração 72 px, cabeçalho do celular 46 px (antes 32), telão 48 px (antes 34). O ícone instalado do app (tela inicial do celular) não muda.
9. Inclui a v1.4.3.

### Como conferir
1. Ajustes mostra "Sabiá v1.5.0".
2. No PowerPoint, exporte uma apresentação real como PDF. Anexe no painel do treinamento: os capítulos devem ter os títulos dos slides.
3. Apresentar: a página aparece igual ao slide (cores, imagens, fontes), cabe na tela, passa e volta por teclado, toque e arrastar. Tela cheia e Esc.
4. Abrir em outra tela: a janela abre (se o navegador bloquear, aparece aviso), "Começar em tela cheia" funciona, Esc fecha a janela.
5. Sala: com o telão aberto, "Apresentar no telão" na espera, durante explicação e durante pergunta. Controle e telão mostram a mesma página. "Voltar ao quiz" fecha no telão. Sem telão aberto, o aviso aparece em 2 s.
6. Capítulo ligado a uma explicação continua abrindo pelo botão "Mostrar no telão" e pela tecla M, e fecha ao sair da explicação.
7. Sem internet (depois da primeira visita): anexar e apresentar um PDF funciona.
8. Celular e tablet: Apresentar com o aparelho em pé e deitado; a página se ajusta ao girar.
9. Prompt padrão: copiar, colar no ChatGPT, Gemini e Claude com um PDF ou PPTX anexo; baixar o .json e importar. Conferir que vieram os 3 formatos misturados e o aviso "Criado com IA: confira antes de aplicar".
10. Logotipo: no menu lateral, no "Próximo passo" do Início, no telão, no cabeçalho do celular e em Ajustes > Integração aparece só o desenho (cabelo e rosto), maior, sem quadrado verde em volta; nítido nos temas claro e escuro.
11. Nenhuma regra nova no Firebase.

### Outros erros para procurar
- PDF grande (100 a 300 MB): tempo para abrir e para montar os capítulos; o navegador não pode travar.
- PDF com senha ou corrompido: deve aparecer aviso, sem quebrar a tela.
- Página desenhada borrada em telão 4K ou com zoom do navegador.
- IA que devolve JSON com campos a mais ou faltando: o Sabiá deve recusar com aviso, ou importar só o que é válido.
- Apresentação aberta e o instrutor encerra a sala: o telão não pode ficar travado no material.

## Checagem final
- Uma sessão completa feita à mão, do começo ao fim, com 2 ou 3 celulares reais: entrar pelo QR, montar o bicho, responder, ver o pódio, assinar, encerrar, abrir o relatório e o PDF, Conferir com o código.
- O material **apresentado** (v1.5.0): PDF exportado de um PowerPoint real, pelo painel (Apresentar e Abrir em outra tela) e pelo controle no telão. Anote se a página aparece igual ao slide e se dá para passar por teclado e toque.
- Sem erros de JavaScript em nenhum script. Abre sem internet depois da primeira visita, com os bichos.
