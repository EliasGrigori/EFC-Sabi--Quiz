# Roteiro de verificação do Grok · Sabiá (v0.1.0 a v1.4.3, tudo em um só)

Como usar: confira as versões na ordem. Cada parte diz o que foi feito, como conferir e outros erros para procurar.
Use um navegador no computador e um celular (ou janela de 390 px). Não use dados reais de pessoas.
A parte da v0.4.0 precisa de um Realtime Database do Firebase configurado (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md). A da v0.5.0 precisa de uma sessão encerrada. A da v0.6.0 precisa de 4 ou 5 pessoas de teste (nomes inventados). A da v0.7.0 precisa do Firebase e de um celular. A da v0.8.0 precisa de contas do EFClaudian.
Escreva os achados em `CAIXA-DO-GROK.md`, dizendo a versão de cada um. Não altere outros arquivos.

Partes: v0.1.0, v0.2.0, v0.3.0, v0.4.0, v0.5.0, v0.6.0, v0.7.0, v0.8.0, v1.0.0, v1.0.1, v1.1.0, v1.2.0, v1.3.0, v1.3.1, v1.4.0, v1.4.1, v1.4.2 e v1.4.3, nesta ordem. A v1.0.0 muda as regras do Firebase: publique as regras novas antes de conferir as partes que usam celular.

Lembrete: o que está na seção "Ainda não existe" de uma versão pode já existir numa versão mais nova deste arquivo.

---

## v0.1.0 · casca, início, treinos, aplicar, ajustes

Abra o app (arquivo `index.html` servido por http, ou o link de teste). Use um navegador no computador e um celular.
Não use dados reais de pessoas. Tudo fica só no aparelho.

### O que foi feito
Casca nova (menu, tema claro/escuro), Início, Treinos (lista, busca, filtro único, lista/cartões), Novo treinamento
(modelo pronto, do zero, importar .json), exportar, duplicar, excluir com desfazer em 3 segundos, Aplicar (3 formatos,
setores, registro, ajustes, roteiro) e Ajustes (identificação, tema, setores, exportar/importar tudo, apagar tudo).

### Como conferir que deu certo
1. Abra com `?demo=1`. Devem aparecer 3 treinamentos prontos e a faixa "pronto para aplicar".
2. Treinos > Novo treinamento > Modelo pronto > escolha um. Ele entra no topo da lista.
3. Novo treinamento > Começar do zero > título "Teste" e meta 85. Entra como "Rascunho" e o botão Aplicar fica apagado.
4. Excluir um treinamento: aparece "Desfazer". Toque nele em até 3 s e o item volta. Sem tocar, ele some de vez.
5. Digite parte do nome na busca: a lista filtra na hora. Limpe e a lista volta.
6. Filtro > ordenar por "Ordem alfabética": a ordem muda. Troque para cartões e volte para lista.
7. Exportar um treinamento (ícone de seta para baixo). Depois Novo treinamento > Importar arquivo e escolha o arquivo baixado: aparece uma cópia.
8. Aplicar um treinamento pronto. Troque entre os 3 formatos: "No ritmo" desliga o ranking. Escolha 2 setores, preencha instrutor e local.
   Abra "Ajustes da sessão", marque "Sessão de teste": o resumo muda. Toque em "Preparar sessão": volta ao Início com 1 sessão preparada.
9. Recarregue a página: tudo continua lá.
10. Ajustes > Escuro: a tela inteira escurece e continua legível. Volte para Automático.
11. Desligue a internet e recarregue (com o app já aberto uma vez): ele abre.
12. Celular (ou janela estreita, 390 px): menu embaixo, sem rolagem para os lados, botões fáceis de tocar.

### Outros erros para procurar
- Importar um .json qualquer (por exemplo `{"a":1}`): deve avisar que não parece um treinamento.
- Título com símbolos e aspas (`<b>"x"</b>`): deve aparecer como texto puro.
- Meta fora de 1 a 100 no "do zero": deve ser ajustada.
- Duplicar e excluir a cópia várias vezes seguidas: a lista não pode embaralhar nem repetir itens.
- Apagar tudo (Ajustes): pede confirmação e deixa o app como novo.
- Teclado: Tab chega a todos os botões, com contorno laranja visível. Esc fecha o diálogo.
- Anote tudo em `CAIXA-DO-GROK.md`. Não altere nenhum outro arquivo.

### Ainda não existe (não conta como erro)
Sala ao vivo e telão (v0.2.0), editor de perguntas (v0.3.0), celular do participante (v0.4.0), relatórios e PDF (v0.5.0),
reforço, pessoas, mensagens e integração com o EFClaudian (v0.6.0 em diante).

---

## v0.2.0 · sala ao vivo e telão

Use o computador (duas janelas do mesmo navegador) e, para a parte do celular, uma janela estreita (390 px).
Sem dados reais de pessoas: os participantes são simulados.
Dica: abra o app com `?rapido=1` no fim do endereço para os participantes simulados entrarem e responderem em frações de segundo.

### O que foi feito
Sala ao vivo: chave de 6 números, QR e link de entrada, convite por WhatsApp, entrar/fechar a entrada, participantes simulados,
telão em outra janela (sincronizado ao vivo), controle com Iniciar / Encerrar tempo / Próxima / Pódio / Encerrar, linha do tempo
das etapas, respostas da pergunta, ranking ao vivo, pódio com resultado da turma e aba Encerradas.
Também: gravação mais segura (não perde a última ação ao recarregar).

### Como conferir que deu certo
1. Treinos > Aplicar em um treinamento > deixe "Ao vivo no telão" > confira que aparece o passo 4 (visual do telão, som e confete).
2. Toque em "Abrir sala e gerar chave". Deve abrir "Sala ao vivo" com chave de 6 números (ex.: 123 456) e o botão Iniciar apagado.
3. Os participantes simulados entram sozinhos (até 12). O botão Iniciar fica ativo.
4. "Abrir telão": abre outra janela. Se o navegador bloquear, libere pop-ups ou cole o link copiado em outra aba. O telão deve mostrar o QR, a chave, e os nomes de quem entrou.
5. Iniciar: o telão mostra a explicação. Próxima: aparece a pergunta com 4 cores e formas, o relógio em anel e "x de y já responderam".
   Confira que o telão NÃO mostra a resposta certa antes do fim.
6. Encerrar tempo: o telão marca a certa com borda branca, mostra as porcentagens e o porquê. O controle mostra as barras de respostas.
7. Deixe o tempo acabar sem tocar: o resultado deve abrir sozinho.
8. Continue até o fim: depois da última pergunta o botão vira "Ver o pódio". O telão mostra "A turma bateu a meta" ou "ficou abaixo da meta", 1º, 2º e 3º e a lista do 4º ao 10º.
9. "Encerrar sessão e guardar": volta para Treinos na aba Encerradas, com acerto e se atingiu a meta. No Início, "Sessões realizadas" sobe para 1.
10. Recarregue a página no meio da sala: a sala e a etapa continuam.
11. Em Aplicar escolha "No ritmo de cada um": a sessão não tem relógio (sem bloqueio de tempo) e só avança quando você toca.
12. Em Ajustes > Escuro e no celular (390 px): sala sem rolagem lateral e botões fáceis de tocar.

### Outros erros para procurar
- Encerrar uma sala sem ninguém: ela some sem virar sessão. Encerrar uma sala com gente: pede confirmação.
- Fechar a entrada na sala de espera: simulados param de entrar e o telão mostra "entrada fechada".
- Tempo extra ligado (Ajustes da sessão): a pergunta dura 50% mais.
- Gincana ligada: quem responde mais rápido deve somar mais pontos (acima de 1000).
- Ranking desligado: o telão não mostra nomes no pódio, só o resultado da turma.
- Fechar a janela do telão e abrir de novo pelo mesmo botão: ela volta ao estado certo.
- Duas salas abertas ao mesmo tempo: não devem trocar chaves nem misturar participantes.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Entrada de verdade pelo celular (v0.4.0), editor de perguntas (v0.3.0), relatórios e PDF (v0.5.0), bonecos dos participantes (iniciais coloridas por enquanto).

---

## v0.3.0 · editor de perguntas e versões

Use o computador (janela larga, 1280 px) e uma janela estreita (390 px) para o celular.
Abra o app sem dados, ou com `?demo=1` no fim do endereço para já ter 3 modelos prontos.

### O que foi feito
Editor de perguntas (Treinos > ícone de lápis, ou "Começar do zero"): 4 formatos (múltipla escolha, verdadeiro ou falso, ordenar, explicação),
tempo, como conta (vale nota, gincana, teste que não vale), "por que está certa", reordenar, duplicar, excluir com desfazer, trocar o formato com desfazer,
avisos do que falta em cada pergunta, prévia do telão (Pergunta e Resultado) e resumo (valem nota, duração, meta, a revisar).
Versões do treinamento: salvar versão com nota, comparar com o rascunho, restaurar com desfazer; aplicar fixa a versão sozinho e a sessão guarda a cópia das perguntas.

### Como conferir que deu certo
1. Treinos > Novo treinamento > Começar do zero > título e meta > deve abrir o editor vazio com 4 formatos para escolher.
2. Escolha "Múltipla escolha": o cursor vai para o enunciado. Apareçam avisos: falta o enunciado, alternativa em branco, marque a certa. Preencha tudo e marque a certa: avisos somem e a lista mostra "Pronto para aplicar".
3. A prévia do telão mostra a pergunta com 4 cores e formas. Em "Resultado" só a alternativa certa fica destacada e o "porquê" aparece.
4. Adicione verdadeiro ou falso (2 linhas fixas), ordenar (3 a 5 passos, com subir e descer) e explicação (sem alternativas nem tempo).
5. Mover para cima ou para baixo, duplicar, excluir (aparece "Desfazer" por 3 segundos). Trocar o formato também permite desfazer.
6. Recarregue a página: tudo continua. Volte para Treinos: aparece a versão com asterisco (v00*) quando há alteração sem versão salva.
7. Versões (relógio no topo): salve com uma nota (vira v01). Edite uma pergunta e adicione outra. Abra Versões > Comparar: + nova, ~ alterada, − removida.
8. Restaurar v01: o rascunho volta ao que estava, com "Desfazer". Restaurar a versão atual é impossível quando não há alteração.
9. Aplicar > Abrir sala: a versão é salva sozinha (v02) e a sala usa as perguntas novas.
10. Exportar o treinamento (.json) e importar de volta: perguntas, certas e "por quê" iguais.
11. Celular (390 px): lista de perguntas primeiro, depois o editor, depois a prévia; sem rolagem lateral; botões de pelo menos 44 px.
12. Tema escuro: o editor continua legível.

### Outros erros para procurar
- Escrever `<img src=x onerror=alert(1)>` no enunciado: deve aparecer como texto, no editor e na prévia, sem executar.
- Apagar todas as alternativas até o mínimo: múltipla fica com 2, ordenar com 3 (botão de remover apagado).
- Apagar a alternativa marcada como certa: a certa fica sem marcação e o aviso volta.
- Mudar a meta para 0 ou 101: não deve aceitar (continua o valor anterior).
- Abrir `#/editar/` com id que não existe: volta para Treinos.
- Editar o treinamento com uma sala aberta: a sala em andamento não muda (ela usa a cópia).
- Pergunta com tempo de 10 s ou 2 min: aparece certo no telão.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Meta em pontos, periodicidade e reavaliação (v0.6.0), voz gravada e banco de perguntas, criar com IA, entrada real pelo celular (v0.4.0), relatórios e PDF (v0.5.0).

---

## v0.4.0 · celular do participante e Firebase

Precisa de um Realtime Database do Firebase configurado (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md) e de um celular de verdade (ou janela estreita de 390 px).
Sem dados reais de pessoas: use nomes de teste.

### O que foi feito
Celular do participante: entrar pelo QR, link ou chave; escolher o nome (lista do instrutor com busca por 3 letras, ou nome livre); escolher cor e setor;
responder (múltipla, verdadeiro ou falso, ordenar), ver certo ou errado com pontos, posição e o porquê; resultado final; assinatura de presença com o dedo.
Instrutor: Ajustes > Celulares na sala (endereço, testar conexão, regras para copiar), lista de nomes, remover pessoa, assinaturas no controle, fim da sala apaga tudo do Firebase.
Sem Firebase configurado, a sala continua com participantes simulados (como na v0.2.0).

### Como conferir que deu certo
1. Ajustes > cole o endereço do Realtime Database > Testar conexão: "Conectado". Com endereço errado: aviso claro. Regras erradas: "O Firebase recusou a gravação".
2. Aplicar > Abrir sala. Aparece "Celulares conectados" e a sala começa sem participantes simulados.
3. No celular, escaneie o QR do telão (ou abra "Copiar link"). Entre com um nome. No controle a pessoa aparece sem recarregar.
4. "Lista de nomes": cole 3 nomes. No celular digite 3 letras (com ou sem acento): aparece a sugestão. Nome fora da lista é recusado.
5. "Fechar entrada": quem tentar entrar vê "Entrada fechada". "Abrir entrada" libera.
6. Iniciar: o celular mostra a explicação. Próxima: aparecem as alternativas com cor e forma. Confira que NADA indica a certa.
7. Responda no celular: aparece "Resposta enviada". Recarregue o celular: continua "Resposta enviada". O controle conta quem respondeu.
8. Encerrar tempo: o celular mostra "Você acertou" com pontos e posição, ou "Não foi dessa vez" com a resposta certa e o porquê. Quem não respondeu vê "Você não respondeu".
9. Na pergunta de ordenar, toque nos passos na ordem; "Enviar ordem" só liga com todos escolhidos; "Desfazer" tira o último.
10. No pódio: o celular mostra acertos, % e se atingiu a meta, e o campo de assinatura. Assine com o dedo e toque em "Assinar presença": aparece "Presença registrada" e o controle mostra "assinou".
11. Encerrar sala: o celular vê "A sala foi encerrada". Na aba Dados do Firebase, a pasta `salas` fica vazia. Em Encerradas a sessão traz os nomes, pontos e assinaturas.
12. Recarregue o navegador do instrutor no meio da sala: a sala volta com as pessoas e "Celulares conectados".
13. Celular em tema escuro e com a tela girada: sem rolagem lateral, botões grandes.

### Outros erros para procurar
- Duas pessoas com o mesmo nome entrando por telefones diferentes: a segunda assume a mesma identidade (de propósito); confira se não quebra o placar.
- Nome com `<img src=x onerror=alert(1)>`: deve aparecer como texto, sem executar (os sinais < e > são removidos).
- Responder duas vezes à mesma pergunta (dois toques rápidos): só a primeira vale.
- Responder depois que o instrutor encerrou o tempo: não conta.
- Celular sem internet no meio da pergunta: mostra "Não enviou" e permite tocar de novo.
- "Não sou eu" na tela de espera: a pessoa some do controle e volta ao formulário.
- Instrutor remove uma pessoa (x) antes de iniciar: ela some do telão e do controle.
- Duas salas abertas ao mesmo tempo no mesmo Firebase: não devem misturar participantes.
- Chave errada, sala encerrada, entrada fechada: mensagens claras.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Boneco do participante (só cor), "rever o que errei", ouvir a pergunta, aparelho compartilhado (próxima pessoa), cadastro de pessoas (v0.7), relatórios e PDF (v0.5.0), login do Firebase (acabamento).

---

## v0.5.0 · relatórios, PDFs e conferência

Precisa de uma sessão encerrada (pode ser ensaio com simulados, mas o registro oficial exige pessoas reais) e de um leitor de PDF.
Para ter pessoas reais, use o Firebase da v0.4.0. Sem dados reais: use nomes de teste.
Se quiser conferir sem Firebase, rode o arquivo `teste-relat.js` (monta uma sessão pronta e testa tudo).

### O que foi feito
Relatórios (menu Relatórios, ou botão "Relatório" em Treinos > Encerradas): escolher a sessão; Resumo (indicadores, "O que fazer agora", tabela de presença e resultado ordenável com assinatura); Mapa da turma; Assertividade (ao longo do tempo e por pergunta); Setores.
Documentos: PDF de registro, Lista de presença em PDF com carga horária, Planilha (CSV), Sessão (.json), Imprimir. Foto da turma (entra no PDF de registro). Logotipo (Ajustes) no cabeçalho dos PDFs.
Código de conferência (SAB-XXXX-XXXX-XXXX-XXXX-XXXX) em cada sessão encerrada e no rodapé dos PDFs. Página Conferir: digitar o código ou escolher o .json da sessão.
Reaplicar para quem ficou abaixo da meta: abre Aplicar com a lista de nomes pronta.
Também: corrigido o anel que girava no menu lateral do computador (vinha da v0.4.0).

### Como conferir que deu certo
1. Encerre uma sala com pelo menos 4 pessoas. Em Treinos > Encerradas aparece a sessão com o botão Relatório.
2. Resumo: confira à mão a nota média (média das porcentagens), "atingiram a meta" e o acerto geral (acertos de todos dividido por perguntas x pessoas). O tempo médio é por resposta, em segundos.
3. "O que fazer agora": cita quem está abaixo da meta, perguntas com menos de 60%, quem não assinou e se falta foto.
4. Tabela: clique nos títulos para ordenar (Nome, Setor, Acertos, %, Pontos, Situação). Toque na miniatura da assinatura: abre grande.
5. Mapa da turma: cada linha é uma pessoa; check = acertou, x = errou, traço = sem resposta. Confira 2 pessoas contra o que respondeu no celular. A última linha traz o acerto de cada pergunta.
6. Assertividade: "Ao longo do tempo" só mostra sessões oficiais do mesmo treinamento; a linha vertical é a meta. "Mais difíceis primeiro" ordena do menor para o maior acerto. A "errada mais escolhida" bate com o que a turma marcou.
7. Setores: média por setor, com quem escolheu "Sem setor" juntos.
8. PDF de registro (botão laranja): abra e confira título, versão, data, instrutor, local, carga horária, meta, indicadores, tabela com assinaturas, assertividade por pergunta, setores, foto, e o código no rodapé de todas as páginas, com "Página n de N".
9. Lista de presença: nomes em ordem alfabética, carga horária de cada um (ex.: 1,5 h), assinatura de quem assinou e "sem assinatura" para quem não assinou, linha para o instrutor assinar.
10. Mais > Planilha: abra no Excel. Acentos corretos, ponto e vírgula, uma linha por pessoa, colunas P1, P2... com Certo, Errado ou traço. Um nome começando com = ou + deve aparecer com um apóstrofo na frente (proteção contra fórmula).
11. Mais > Sessão (.json) e Imprimir (abre o PDF em outra aba, onde você imprime).
12. Foto da turma: "Adicionar foto" (no celular abre a câmera). Gere o PDF de novo: a foto aparece com a data. "Trocar" e "Remover" funcionam.
13. Logotipo: em Ajustes, escolha uma imagem; aparece no topo dos dois PDFs. "Remover" tira.
14. Conferir: copie o código do rodapé do PDF e cole na página Conferir (maiúsculas, minúsculas e espaços não importam): "Registro confere". Troque um caractere: "Nenhuma sessão deste aparelho tem esse código". Escolha o .json da sessão: "O arquivo confere".
15. Adultere o .json (mude um nome) e confira: "O arquivo foi alterado".
16. Reaplicar: no Resumo, "Reaplicar para elas" abre Aplicar com o selo Reaplicação e a lista de nomes. Abra a sala: no celular só aparecem esses nomes.
17. Celular e tema escuro: nenhuma tela com rolagem lateral; o mapa e as tabelas rolam por dentro do cartão.

### Outros erros para procurar
- Sessões encerradas antes da v0.5.0 (se houver): o código aparece com "gerado depois". Isso é esperado.
- Nome muito longo, acento raro (ç, ã, ü) ou caractere fora do alfabeto latino no PDF: o PDF usa só o alfabeto ocidental; outros caracteres viram "?". Veja se o resto do documento continua correto.
- Sessão com 40 ou mais pessoas: a tabela continua na página seguinte com o cabeçalho repetido, sem cortar linha no meio.
- Sessão de teste ou ensaio com simulados: o PDF traz o aviso "não vale como registro oficial", e o relatório mostra o selo.
- Mudar o nome de uma pessoa nos dados e abrir Conferir: a sessão aparece "Alterado depois de encerrar".
- Encerrar uma sala sem ninguém: a sala some e nada vai para Relatórios.
- Apagar o treinamento depois da sessão: o relatório continua abrindo; "Reaplicar" e "Revisar no editor" ficam desligados.
- Duas pessoas com o mesmo nome: as duas aparecem, cada uma com sua assinatura.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Equipes e gincana no relatório, desempate por tempo, "Desafio entre setores do mês" (v0.7), mensagens (v0.7), reforço pendente e refazer (v0.6), carimbo de tempo externo e senha no registro, login do Firebase (acabamento).

---

## v0.6.0 · reforço e reavaliação

Precisa de 4 ou 5 pessoas de teste (nomes inventados) em sessões reais ou ensaios. As pendências só contam sessões oficiais com pessoas reais (não teste, não ensaio com simulados); para conferir sem Firebase, rode `teste-reforco.js` e `teste-reforco-cel.js` (montam as sessões prontas). As regras do Firebase NÃO mudaram nesta versão.

### O que foi feito
Pendências (menu novo, com número vermelho): aba Reforço (quem ficou abaixo da meta, tentativa 2 ou 3, bloqueada até o dia seguinte, "usaram as 3 tentativas"), aba Reavaliar (30/60/90 dias) e aba Validade. Botões Aplicar reforço / Aplicar reavaliação / Renovar e Dar baixa (com Desfazer).
Editor: validade do treinamento (6 meses, 1 ano, 2 anos) e reavaliar depois de 30, 60 e 90 dias.
Aplicar: escolha do momento (Aplicação normal, Pré-teste, Pós-teste, Reforço) e, no reforço, "Rever a explicação e refazer o teste" ou "Só as perguntas que erraram".
Pré-teste: sem ranking, sem resposta certa, sem resultado, não conta para reforço, validade nem indicadores. Pós-teste: relatório com "Ganho de aprendizado" (antes, agora, pp, ganho normalizado), também no PDF.
Celular: progresso (pergunta n de N), Rever o que errei, Treinar de novo (prática, até 3 tentativas por pergunta), "Pré-teste concluído".
Código de conferência: sessões antigas mantêm o mesmo código.

### Como conferir que deu certo
1. Encerre uma sessão oficial com 4 pessoas de teste (meta 80%) em que 2 fiquem abaixo. Abra Pendências > Reforço: as 2 aparecem como "2ª tentativa", com a nota e a data da última sessão. O número vermelho do menu bate com o total.
2. "Aplicar reforço" abre Aplicar com os 2 nomes e o selo Reforço. Escolha "Só as perguntas que erraram": o resumo mostra o número de perguntas e a sessão só traz as perguntas que alguma dessas pessoas errou. Abra a sala e confira no celular que só esses nomes entram.
3. Encerre esse reforço com 1 pessoa ainda abaixo da meta: ela passa a "3ª tentativa" e aparece bloqueada com a data de liberação (dia seguinte). Quem atingiu a meta sai da lista.
4. Faça a 3ª tentativa depois (mude a data do aparelho para o dia seguinte, ou use o teste). Quem continua abaixo vai para "usaram as 3 tentativas" e some da fila.
5. "Dar baixa" tira a pessoa da lista e mostra "Desfazer" por alguns segundos. Desfazer devolve. A baixa só vale para aquela situação: uma nova sessão abaixo da meta traz a pessoa de volta.
6. Nota oficial: o relatório e o PDF continuam usando a 1ª tentativa; o comparativo de reforço mostra 1ª × tentativa atual, com ganho.
7. Editor: abra um treinamento, escolha validade 1 ano e marque 30, 60 e 90 dias. Os botões de 30/60/90 têm texto e estado (aria-pressed), não só cor. Salvar e reabrir mantém.
8. Pendências > Reavaliar: com uma sessão de 45 dias atrás e 30/60/90 ligados, aparece o ponto de 60 dias como "faltam N dias" (visível 14 dias antes) e o de 30 como atrasado, quando não foi feito. Quem foi abaixo da meta não aparece aqui, está no Reforço.
9. Pendências > Validade: sessão de 340 dias atrás com validade de 1 ano aparece como "vence em N dias"; de mais de 365, "vencido". "Renovar" abre Aplicar como Renovação.
10. Aplicar > Pré-teste: sem ranking; no telão não aparece a resposta certa nem o resultado da pergunta; no celular, "Pré-teste concluído" sem Rever/Treinar. Encerre.
11. Aplicar > Pós-teste: escolha o pré-teste de base na lista. Encerre e abra o Relatório: "Ganho de aprendizado" com antes, agora, variação em pp e ganho normalizado = (agora − antes) ÷ (100 − antes). Confira à mão 2 pessoas. A linha da turma bate com a média.
12. Pessoas que fizeram só uma das duas sessões aparecem como "novo" ou "ausente". O pareamento ignora acentos e maiúsculas.
13. PDF do pós-teste: a seção de ganho aparece e o código de conferência do rodapé confere em Conferir. Um PDF de sessão antiga continua conferindo com o mesmo código.
14. Celular, fim da sessão com nota abaixo da meta: "Rever o que errei" lista as perguntas com sua resposta, a certa e a explicação; "Treinar de novo" repete as perguntas com "Tentativa 1 de 3 · não vale nota", dá a dica "ainda não" na errada e acerta na 2ª ou 3ª. Depois de 3 erros mostra a resposta certa.
15. Com a sala ainda aberta, o treino do celular aparece no cartão "Treino no celular" no pódio do instrutor.
16. Celular de 390 px e tema escuro: nenhuma tela com rolagem lateral, botões com pelo menos 44 px de altura. A barra inferior não tem mais "Pessoas" (continua no menu do computador).

### Outros erros para procurar
- Treinamento com validade mas sem nenhuma sessão oficial: não aparece nada em Validade (esperado).
- Duas pessoas com nome quase igual (Zé / José): o Sabiá trata como pessoas diferentes; veja se isso confunde as listas.
- Mudar a validade ou o 30/60/90 no editor depois: as pendências antigas mudam junto (não há versão dessa configuração).
- Fechar a sala e ver se o treino do celular ainda chega ao instrutor: não chega (fica só no celular). Isso é esperado.
- Sessão de teste ou ensaio: não pode gerar pendência nenhuma.
- Rodar Aplicar reforço sem nenhum nome selecionado, ou apagar o treinamento depois: veja se a tela mostra aviso claro e não quebra.
- Pré-teste com participante simulado: a resposta certa nunca pode aparecer no telão nem no celular. Confirme no Firebase que `/salas/{chave}/pub` não traz a resposta certa durante um pré-teste.
- Firebase: as regras em docs/firebase-rules.json não mudaram; o celular grava só em `/salas/{chave}/part/{id}/ref/{n}`. Confira que a sala continua sendo apagada inteira ao encerrar.
- Console sem erros em Pendências, Aplicar, Relatórios e no celular.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Folha de reforço em PDF do EFCquiz original, pessoas e mensagens (v0.7), perfil e histórico por pessoa (v0.7), comentário rápido do participante (v0.7), desafio entre setores (v0.7), EFClaudian (v0.8), voz e banco de perguntas, carimbo de tempo e login do Firebase (acabamento).

---

## v0.7.0 · pessoas e mensagens

### O que foi feito
Pessoas (menu): cadastro com nome, setor e apelidos; busca; filtro por setor e situação (ativas, arquivadas, todas); adicionar, editar, arquivar, excluir com Desfazer; "Colar lista" (uma pessoa por linha, "Nome; Setor"); aviso de nomes que apareceram nas sessões e não estão no cadastro, com "Cadastrar" ou "É a mesma pessoa de...". Renomear guarda o nome antigo como apelido.
Perfil (toque no nome): sessões, nota média, quantas vezes atingiu a meta, 6 selos (primeira meta, constância, presença, nota máxima, recuperou, primeiro lugar), pendências abertas, mensagens enviadas e histórico com link para o relatório. Só sessões oficiais contam.
Aplicar: "Quem participa?" mostra que as pessoas do cadastro entram pela lista (respeitando os setores escolhidos), com "Não usar". O celular só mostra os nomes do cadastro quando digita 3 letras e o setor vem do cadastro.
Mensagens (menu, com número de novas): lista com nome, setor, treinamento e versão; filtro por tipo e situação; Responder, Marcar como lida, Excluir com Desfazer; aviso no Início quando não há pendências mais urgentes; cartão de mensagens no pódio da sala.
Celular do participante: "Deixe um comentário" (elogio, sugestão, reclamação, pergunta; 3 a 300 letras; até 3 por pessoa); a resposta do instrutor aparece abaixo; "Outra pessoa vai usar este celular" apaga os dados da pessoa anterior no aparelho.
Relatórios: nova visão "Desafio entre setores" (mês ou ano, mínimo de 3 pessoas por setor, tela grande, sem nomes de pessoas).
Celular do instrutor: barra de baixo com Início, Treinos, Pendências, Mensagens e Mais (Pessoas, Relatórios, Conferir, Ajustes).
Pareamento por pessoa: Pendências, histórico e relatórios usam o nome canônico do cadastro (nome ou apelido), então Zé e José viram uma pessoa só quando há apelido.

### Como conferir que deu certo
1. Pessoas vazia: mostra o convite a cadastrar. Adicione "Maria Aparecida Silva" no setor Packing. Tente adicionar "maria aparecida silva": deve ser recusada.
2. "Colar lista" com 4 linhas, uma já existente e uma com setor novo: cadastra 3, ignora a repetida, e o setor novo passa a existir em Ajustes e em Aplicar.
3. Busca por "jose" acha "José" (sem acento, sem maiúscula) e a caixa de busca não perde o foco enquanto digita. Filtro por setor mostra só aquele setor e o botão de filtro mostra o resumo.
4. Edite uma pessoa: troque o nome. O nome antigo aparece em "também: ...". Arquive: ela some da lista padrão (aparece em "Arquivadas" ou "Todas") e não entra mais na lista de entrada. Exclua e use Desfazer.
5. Encerre 3 sessões oficiais com os mesmos nomes escritos de formas diferentes (Zé, José Wellington, José Wellington Souza, com o apelido "Zé" cadastrado). O perfil dele mostra as 3 sessões. Sem o apelido, o nome fora do cadastro aparece no aviso e "É a mesma pessoa de..." resolve.
6. Perfil: confira à mão sessões, nota média e "atingiu a meta". Selos: Primeira meta (1 sessão na meta), Constância (3 últimas na meta, não vale com uma abaixo), Presença (5 treinamentos), Nota máxima (100%), Recuperou (meta no reforço), Primeiro lugar (1º numa sessão com ranking). Teste, ensaio e pré-teste não contam.
7. Aplicar com cadastro: aparece "N pessoas entram pela lista"; escolher setores reduz o número; "Não usar" desliga. Preparar a sessão leva a lista. "Aplicar reforço" mantém a lista só de quem deve refazer.
8. Com o Firebase ligado: abra a sala e entre no celular digitando 3 letras. Escolha o nome da lista: o setor vem do cadastro sem escolher.
9. No fim da sessão, no celular: "Deixe um comentário". Enviar vazio mostra "Escreva pelo menos 3 letras". Envie um comentário de cada tipo (até 3). Depois do terceiro o formulário some. Recarregar o celular mantém os enviados. Digitar não faz a tela repintar nem perder o texto.
10. No instrutor, com a sala aberta, a mensagem chega em Mensagens com tipo, nome, setor, treinamento e versão; o menu mostra o número de novas. Marque como lida, filtre por tipo, responda: a resposta aparece no celular de quem escreveu. Excluir mostra Desfazer.
11. Texto com `<` e `>` ou mais de 300 letras: é limpo e cortado. Tipo inválido (gravado à mão no Firebase) é ignorado.
12. "Outra pessoa vai usar este celular": volta para a entrada, sem nome, comentários, assinatura nem revisão da pessoa anterior (confira o armazenamento local do navegador). A segunda pessoa entra e o bloco de comentário começa vazio.
13. Desafio entre setores (Relatórios > Desafio entre setores): placar do mês com % de acerto por setor, só sessões oficiais encerradas e sem pré-teste, teste ou ensaio. Setor com menos de 3 pessoas aparece em "Fora do placar". Setas mudam o mês; "Ano" soma o ano; "Mostrar em tela grande" esconde os controles; "Voltar" volta. Não aparecem nomes de pessoas.
14. Celular de 390 px e tema escuro: Mais, Pessoas, Perfil, Mensagens e Desafio sem rolagem lateral, com alvos de toque de pelo menos 36 px, e a barra de baixo com 5 itens.
15. Início: com pendências, o aviso é de pendências; sem pendências e com mensagens novas, o aviso é de mensagens.

### Outros erros para procurar
- **Firebase (importante):** as regras em docs/firebase-rules.json não mudaram. O celular agora grava em `/salas/{chave}/part/{id}/com/{id}` e o instrutor grava em `/salas/{chave}/part/{id}/rsp/{id}`. A documentação do Firebase diz que as regras de validação valem em todos os níveis, e `part/$pid` exige o filho `n` (que continua existindo). O simulador usado nos testes não aplica regras. Confirme na base real que o comentário e a resposta são gravados. Se forem recusados, o celular mostra "Não enviou"; anote a mensagem do erro. O mesmo vale para `ref` da v0.6.0.
- Confirme que a sala continua sendo apagada inteira ao encerrar (comentários e respostas somem do Firebase; ficam só no aparelho do instrutor).
- Comentários só chegam com a sala aberta; respostas só chegam ao celular com a sala aberta. É o esperado.
- Dois instrutores ou duas abas com o mesmo cadastro: o cadastro é local de cada aparelho. Veja se isso confunde.
- Pessoa com o mesmo nome em dois setores: o cadastro recusa nome repetido.
- Excluir uma pessoa que tem histórico: o histórico das sessões continua (as sessões guardam o nome), mas o perfil deixa de existir; confira se o nome volta ao aviso de "fora do cadastro".
- Apelido igual ao nome de outra pessoa cadastrada: veja se junta pessoas por engano.
- Renomear para um nome que já existe: deve ser recusado.
- Colar lista com mais de 200 linhas, linhas em branco, espaços sobrando ou setor com maiúscula diferente.
- Sessão de teste ou ensaio: não pode entrar em selos, perfil nem Desafio. Mensagens de sessão de teste aparecem com a marca "Sessão de teste".
- Console sem erros em Pessoas, Perfil, Mensagens, Desafio, Aplicar e no celular.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Perfil e selos no celular do participante (precisa de login, v1.0), mensagens que chegam sem a sala aberta, vários participantes respondendo no mesmo celular compartilhado, folha de reforço em PDF do EFCquiz original, EFClaudian (v0.8), voz e banco de perguntas, carimbo de tempo e login do Firebase (v1.0).

---

## v0.8.0 · integração com o EFClaudian

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


## v1.0.0 · acabamento
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

---

## Checagem final (depois de todas as partes)
- Com tudo ligado, faça uma sala completa: criar treinamento no editor, aplicar, abrir sala, entrar com 2 celulares, responder, encerrar tempo, pódio, assinar, encerrar sala.
- Em Treinos > Encerradas abra o Relatório, gere o PDF de registro e a lista de presença, e confira o código em Conferir.
- Console do navegador sem erros em nenhuma tela. Abrir sem internet depois da primeira visita.
- Em Pendências, confira que o número do menu bate com as listas. Em Mensagens, que o número de novas bate com a lista.
- Nada de chaves, senhas ou dados reais em arquivos do projeto.

---

# Roteiro do Grok · Sabiá v1.0.1 (ícone novo)

## O que foi feito
Só o ícone do app mudou (desenho do Elias, contornos reforçados, fundo petróleo com relevo). `VERSAO` passou a 1.0.1 e o cache offline a `sabia-1.0.1`. Nenhuma regra nem tela mudou.

## Como conferir
1. Abra o app com Ctrl+F5. Ajustes deve mostrar "Sabiá v1.0.1".
2. A aba do navegador mostra o ícone novo (rosto com fundo verde em relevo).
3. Abra `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` e `apple-touch-icon.png` direto pelo endereço: os quatro carregam (200) e são imagens diferentes das da v1.0.0.
4. DevTools > Application > Manifest: os 3 ícones aparecem; o maskable cabe no círculo (rosto inteiro dentro).
5. Instale o app no celular (ou remova e reinstale): o ícone da tela inicial é o novo.
6. Offline: desligue a internet e recarregue; o app abre e o ícone continua.

## Outros erros para procurar
- Ícone antigo ainda aparecendo depois de Ctrl+F5 (cache do service worker não trocou).
- Cantos pretos ou brancos no ícone arredondado; recorte do ícone maskable cortando a testa ou o queixo.
- Ícone borrado em 32 px (aba do navegador).
- Qualquer tela do app mudando de aparência: não deveria.

---

# Roteiro do Grok · Sabiá v1.1.0

## O que foi feito
1. **Telão:** barra com Tela cheia (F), Projetor (P) e Apresentação (A).
2. **Folha de reforço em PDF** no relatório da sessão.
3. **Painel do treinamento** no editor (gaveta pela direita).
4. **Logotipo de dentro do app** trocado pelo desenho novo e **fundo do ícone** igualado ao verde do app (#0E4A48).

## Como conferir
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

## Outros erros para procurar
- Barra do telão cobrindo conteúdo importante ou não voltando depois de sumir.
- Espaço avançando duas vezes, ou avançando sem estar em apresentação.
- Folha de reforço com texto cortado, página em branco ou pessoa repetida; acentos errados.
- Painel mostrando comentários de outro treinamento ou médias com sessões de teste/ensaio.
- Logotipo borrado ou com cantos quadrados em algum lugar; modo escuro com borda estranha.
- Cache antigo: depois de Ctrl+F5, Ajustes deve mostrar "Sabiá v1.1.0".

---

# Roteiro do Grok · Sabiá v1.2.0 (meta em pontos)

## O que foi feito
Cada treinamento pode ter meta em **%** (como antes) ou em **pontos**. Regra do Elias: a pessoa atinge a meta se fizer X pontos ou mais, **sem contar o bônus de rapidez**. Cada acerto vale 1.000 pontos.

## Como conferir
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

## Outros erros para procurar
- Pessoa com um acerto a menos do que a meta pede sendo marcada como "Atingiu a meta" (ou o contrário). Teste com 3, 5, 7 e 10 perguntas.
- Mudar a meta do treinamento com a sala já aberta alterando a conta daquela sessão (não deve: a conversão é feita uma vez).
- Reforço "só as perguntas que erraram" usando uma meta diferente da sessão original (deve usar a mesma).
- Meta em pontos com treinamento sem perguntas valendo nota (a ajuda deve pedir para adicionar perguntas).
- Campo da meta cortado no celular de 390 px; seletor difícil de tocar.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.2.0".

---

# Roteiro do Grok · Sabiá v1.3.0 (material com capítulos)

## O que foi feito
Cada treinamento pode ter um **material de apoio** (PPTX de preferência, ou PDF, ou HTML) guardado só neste aparelho. As **explicações** podem apontar para um **capítulo** do material; na sala, o instrutor abre esse capítulo por cima do telão. O painel do treinamento ganhou a aba **Material**.

## Como conferir
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

## Limites que são assim de propósito
- O arquivo fica no navegador deste aparelho (IndexedDB "sabia-material"). Não vai para o Firebase, nem para os celulares dos participantes, nem para o "Exportar tudo". Em outro aparelho o treinamento mostra "o arquivo não está neste aparelho".
- Slides do PPTX aparecem como texto e imagens, não como o desenho exato (cores, formas, animações). Para o desenho exato, use o PDF. Se o navegador não tiver `DecompressionStream`, o PPTX não abre e o aviso manda usar o PDF.
- Capítulos do PDF são digitados à mão (título e página). Capítulos do HTML: só "Documento inteiro".
- Telão e controle no mesmo navegador (BroadcastChannel). O leitor de PDF depende do navegador (no celular costuma abrir em outra aba).
- Arquivos de treinamentos excluídos são apagados do aparelho na próxima abertura do app (depois que o "Desfazer" some).

## Outros erros para procurar
- PPTX de outro programa (Keynote, Google Slides exportado, LibreOffice): títulos faltando, ordem dos slides errada, caracteres estranhos, imagens que não aparecem.
- PPTX com muitas imagens grandes: demora para abrir cada slide? Passa de 25 MB e foi recusado corretamente?
- Capítulo apontando para um slide que não existe mais depois de trocar o arquivo (não deve: as ligações são apagadas).
- Apresentação: Espaço avançando a sala com o material aberto (não deve).
- Material aberto no telão sobrando ao encerrar a sala ou trocar de rota.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.3.0".

---

# Roteiro do Grok · Sabiá v1.3.1 (material grande, só no aparelho)

## O que foi feito
Regra nova do Elias: o material pode ser **grande** (PPTX e PDF até 300 MB; HTML até 30 MB), mas **nunca vai para a nuvem**. O arquivo fica só no aparelho; o título e os capítulos viajam na exportação do treinamento. Em outro aparelho é preciso anexar de novo o mesmo documento.

## Como conferir
1. Anexe um PPTX ou PDF de uns 50 a 100 MB (Painel > Material): é aceito, mostra o tamanho em MB e abre rápido. Um arquivo acima de 300 MB, ou HTML acima de 30 MB, é recusado com aviso.
2. Exporte o treinamento (.json) e abra o arquivo no bloco de notas: tem `material` com nome, tipo, tamanho e capítulos, e `cap` nas explicações, mas **nada do conteúdo do arquivo**.
3. Em outro navegador (ou perfil novo), importe o .json. Painel > Material mostra o nome, os capítulos e o aviso "O arquivo não está neste aparelho". Na sala, "Ver aqui" diz o mesmo.
4. Clique em "Anexar o mesmo arquivo": PDF no lugar de PPTX é recusado; PPTX com outro número de slides é recusado; o mesmo arquivo volta a funcionar e as ligações das explicações continuam.
5. Confirme no Firebase (Realtime Database) que **nenhum** dado de material aparece.

## Outros erros para procurar
- Espaço do navegador: arquivo grande com disco quase cheio deve dar aviso, não travar.
- PPTX gigante de outro programa que o leitor não abra (ZIP64): deve mandar usar PDF.
- Importar um .json de material com tipo estranho: o material é ignorado e as ligações somem.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.3.1".

---

# Roteiro do Grok · Sabiá v1.4.0 (bonecos)

## O que foi feito
Cada participante monta o seu bicho no celular: 17 animais (cachorro, gato, guaxinim, raposa, onça-parda, veado-catingueiro, jegue, tatu-bola, preá, mocó, teiú, jacaré, tartaruga, sabiá, carcará, asa-branca, cardeal), 10 cores de pelagem, 6 roupas, 11 detalhes (brincos, piercings, tatuagens, manchas), 23 cosméticos de cabeça e 6 de pescoço. Todos começam com gato ou cachorro sorteado. O boneco aparece na sala do instrutor, no telão (multidão, ranking e pódio) e no celular.

## ANTES DE TESTAR: publicar as regras novas
Copie `docs/firebase-rules.json` (ou Ajustes > Copiar regras) e publique no console do Firebase (Realtime Database > Regras). Sem isso o celular entra na sala, mas sem o boneco (o banco recusa o campo novo `b` e o app tenta de novo sem ele), e "Mudar meu bicho" depois de entrar não chega ao instrutor.

## Como conferir
1. Ctrl+F5: Ajustes mostra "Sabiá v1.4.0".
2. Abra uma sala com o Firebase ligado e entre pelo celular. Na tela de nome aparece "Seu bicho" com um gato ou um cachorro (abra em aparelhos diferentes: os dois aparecem).
3. "Montar meu bicho": abas Bicho, Cor, Roupa, Detalhes (até 4, toque de novo para tirar), Cabeça e Pescoço, com miniaturas. "Sortear" monta um aleatório. "Pronto" volta para o nome sem perder o que foi digitado.
4. Tatu e tartaruga: a aba Roupa avisa que o casco não deixa vestir. Jacaré e teiú: sem detalhes de rosto e sem óculos/pirata.
5. Entre na sala: o boneco aparece no celular, na lista do instrutor e no telão. Mude o bicho depois de entrar ("Mudar meu bicho"): o instrutor e o telão atualizam.
6. Termine a sala: o pódio do telão mostra os três bonecos grandes; a lista do 4º ao 10º mostra pequenos.
7. "Outra pessoa vai usar este celular" faz o próximo começar com gato ou cachorro sorteado.
8. Sem internet: depois da primeira abertura, os bonecos continuam aparecendo (sw guarda as 318 imagens).
9. Celular de 390 px: o montador cabe sem rolar para o lado, nos temas claro e escuro.

## Outros erros para procurar
- Boneco que não aparece (quadrado vazio) em algum navegador, principalmente iPhone (Safari). O desenho usa canvas e WebP.
- Cor da pelagem estranha em algum bicho, ou partes que deviam mudar de cor e não mudam (as listras do gato ficam laranja de propósito).
- Chapéu atravessando orelhas grandes (jegue, veado, raposa): é esperado, mas anote se algum ficar feio.
- Celular antigo (v1.3.1 aberto sem atualizar) entrando numa sala da v1.4.0: deve entrar e aparecer com o círculo de cor.
- Relatório e PDF devem continuar sem bonecos (decisão do Elias). Se algum bicho aparecer lá, é erro.
- Muitos participantes (30+) no telão: lentidão ao desenhar os bonecos.

# Roteiro do Grok · Sabiá v1.4.1 (ajustes dos bichos)

## O que foi feito
1. Bichos maiores no celular: tela de nome 112 px, espera 150 px, prévia do montador 150 px, bicho ao lado do nome no jogo e no ranking do celular 42 px. Opções do montador em 2 colunas, miniaturas de cerca de 156 px, quadradas.
2. Resposta que chega atrasada conta: o instrutor guarda a pergunta que acabou de fechar (`s.ult`) e aceita a resposta dela por até 4 s (`GRACA_RESP`). O bônus da gincana é calculado como se a resposta tivesse chegado no último instante da pergunta. Vale também quando já se abriu a pergunta seguinte (pré-teste).
3. Aba Cor do montador corrigida: a classe do círculo de amostra (`bon-cor`) coincidia com a classe da lista inteira; agora é `bon-amostra`. Esse erro já existia na v1.4.0.
4. Iniciais ignoram hífen e sinais ("Teste - José Elias" vira TJ, antes T-).

## Como conferir
1. Ctrl+F5 (ou fechar e abrir o Sabiá duas vezes no celular): Ajustes mostra "Sabiá v1.4.1".
2. Celular de 390 px: tela de nome, montador (abas Bicho, Cor, Roupa, Detalhes, Cabeça, Pescoço) e espera. Bichos grandes, 2 colunas, sem rolagem para o lado, nos temas claro e escuro.
3. Aba Cor: 10 cores visíveis, cada uma com nome; tocar numa cor muda o bicho da prévia.
4. Resposta atrasada: com um celular real, abra uma pergunta, responda e, no mesmo instante, toque em passar no controle. Repita várias vezes. A pessoa deve aparecer com acerto, não como "sem resposta". Para forçar o atraso, ligue o modo avião por um instante antes de tocar, com a pergunta aberta, e desligue logo depois de passar (dentro de 4 s); depois de 4 s a resposta não conta.
5. Nome com hífen na sala ("Ana - Paula"): a bolinha mostra AP.
6. Nenhuma regra nova no Firebase: as da v1.4.0 continuam valendo.

## Outros erros para procurar
- Resposta atrasada contada duas vezes ou pontos em dobro.
- Resposta de uma pergunta antiga (mais de 4 s depois) entrando e mudando o ranking.
- No modo com tempo, a pergunta fecha sozinha e a resposta chega logo depois: deve contar.
- Miniaturas cortadas ou texto sobreposto nas abas Detalhes e Cabeça em telas muito estreitas (320 px).
- Montador pesado em celular antigo, com 2 colunas de imagens grandes.

# Roteiro do Grok · Sabiá v1.4.2 (bichos ainda maiores)

## O que foi feito
1. Recorte fixo ao montar o bicho (`BON.recorte = [35, 30, 250]`): tira a borda vazia das imagens de 320 px e entrega 250 px. O bicho fica cerca de 28% maior no mesmo quadro, em todo lugar (celular, lista do instrutor, telão, pódio). O recorte é igual para todos os bichos.
2. Tela de nome: quadro do bicho de 112 para 140 px.
3. Espera no celular: bicho em cima do nome, com `min(240px, 62vw)`.
4. Zoom das miniaturas de Cabeça/Detalhes/Pescoço recalculado para o recorte; máscara das bordas mais aberta (88%).

## Como conferir
1. Ctrl+F5 (no celular, fechar e abrir duas vezes): Ajustes mostra "Sabiá v1.4.2".
2. Monte bichos com o chapéu de mago, coroa, capacete e os itens de pescoço: nenhuma ponta cortada no quadro, em nenhum dos 17 bichos (jacaré e teiú são os mais compridos).
3. Celular de 390 px e de 320 px: tela de nome, montador (todas as abas) e espera. Sem rolagem para o lado; nome sempre embaixo do bicho na espera.
4. Telão: sala de espera, pódio (3 primeiros) e lista do 4º ao 10º com os bichos maiores e sem sobrepor nomes.

## Outros erros para procurar
- Bicho borrado demais em telas grandes (o desenho tem 250 px).
- Chapéu ou rabo sumindo pela máscara das bordas.
- Na espera, botões empurrados para fora da tela em celulares baixos.

# Roteiro do Grok · Sabiá v1.4.3 (resposta que se perdia)

## O que foi feito
1. **Celular corrige o resultado guardado:** se a resposta chega ao instrutor depois de fechar a pergunta, o instrutor conta (v1.4.1) e agora o celular também atualiza o que guardou (`guardaRev` atualiza quando o resultado muda). No pódio, o instrutor manda em `res/{pid}.q` a lista das perguntas que a pessoa acertou, e o celular acerta as contas (`acertaRevPodio`).
2. **Janela da resposta atrasada:** de 4 s para 10 s (`GRACA_RESP`).
3. **Treino no celular em ordem:** as tentativas (`part/{pid}/ref/{i}`) vão uma de cada vez (`CE.filaRef`), e o instrutor nunca troca uma tentativa mais nova por uma mais antiga.
4. **Testes:** `rtdb-mock.js` aceita `SABIA_ATRASO=ms` (cada pedido espera entre ms e 2 x ms); `teste-reforco-cel.js` espera o banco com paciência; `teste-celular.js` aceita o link `p-` do Firebase real; nova suíte "lento" no `rodar-tudo.sh`.

## Como conferir
1. Ajustes mostra "Sabiá v1.4.3".
2. `teste-reforco-cel.js` no Firebase real, 2 rodadas: 48/48, José com 6 de 6 e "Você acertou tudo" no celular dele.
3. Mock lento: `SABIA_ATRASO=1500 node teste-reforco-cel.js dist prints` deve dar 48/48. (Na v1.4.2 dava 9 falhas.)
4. À mão, 2 celulares: responder e, no mesmo instante, tocar em passar, várias vezes. No pódio, o celular não pode dizer "pergunta para rever" de uma pergunta que o instrutor contou como certa.
5. Treinar de novo no celular, errando e acertando rápido: o cartão "Treino no celular" do instrutor e o relatório mostram a pergunta recuperada.
6. Nenhuma regra nova no Firebase.

## Outros erros para procurar
- Resposta contada duas vezes ou pontos em dobro.
- Resposta que chega mais de 10 s depois entrando no ranking.
- Celular mostrando acerto que o instrutor não contou (o contrário do erro corrigido).
