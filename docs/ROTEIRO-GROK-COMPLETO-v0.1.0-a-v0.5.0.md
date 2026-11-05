# Roteiro de verificação do Grok · Sabiá (v0.1.0 a v0.5.0, tudo em um só)

Como usar: confira as versões na ordem. Cada parte diz o que foi feito, como conferir e outros erros para procurar.
Use um navegador no computador e um celular (ou janela de 390 px). Não use dados reais de pessoas.
A parte da v0.4.0 precisa de um Realtime Database do Firebase configurado (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md). A da v0.5.0 precisa de uma sessão encerrada.
Escreva os achados em `CAIXA-DO-GROK.md`, dizendo a versão de cada um. Não altere outros arquivos.

Partes: v0.1.0, v0.2.0, v0.3.0, v0.4.0 e v0.5.0, nesta ordem.

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

## Checagem final (depois de todas as partes)
- Com tudo ligado, faça uma sala completa: criar treinamento no editor, aplicar, abrir sala, entrar com 2 celulares, responder, encerrar tempo, pódio, assinar, encerrar sala.
- Em Treinos > Encerradas abra o Relatório, gere o PDF de registro e a lista de presença, e confira o código em Conferir.
- Console do navegador sem erros em nenhuma tela. Abrir sem internet depois da primeira visita.
- Nada de chaves, senhas ou dados reais em arquivos do projeto.
