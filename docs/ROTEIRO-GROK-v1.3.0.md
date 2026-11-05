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
