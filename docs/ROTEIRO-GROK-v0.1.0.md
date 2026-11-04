# Roteiro de verificação do Grok · Sabiá v0.1.0

Abra o app (arquivo `index.html` servido por http, ou o link de teste). Use um navegador no computador e um celular.
Não use dados reais de pessoas. Tudo fica só no aparelho.

## O que foi feito
Casca nova (menu, tema claro/escuro), Início, Treinos (lista, busca, filtro único, lista/cartões), Novo treinamento
(modelo pronto, do zero, importar .json), exportar, duplicar, excluir com desfazer em 3 segundos, Aplicar (3 formatos,
setores, registro, ajustes, roteiro) e Ajustes (identificação, tema, setores, exportar/importar tudo, apagar tudo).

## Como conferir que deu certo
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

## Outros erros para procurar
- Importar um .json qualquer (por exemplo `{"a":1}`): deve avisar que não parece um treinamento.
- Título com símbolos e aspas (`<b>"x"</b>`): deve aparecer como texto puro.
- Meta fora de 1 a 100 no "do zero": deve ser ajustada.
- Duplicar e excluir a cópia várias vezes seguidas: a lista não pode embaralhar nem repetir itens.
- Apagar tudo (Ajustes): pede confirmação e deixa o app como novo.
- Teclado: Tab chega a todos os botões, com contorno laranja visível. Esc fecha o diálogo.
- Anote tudo em `CAIXA-DO-GROK.md`. Não altere nenhum outro arquivo.

## Ainda não existe (não conta como erro)
Sala ao vivo e telão (v0.2.0), editor de perguntas (v0.3.0), celular do participante (v0.4.0), relatórios e PDF (v0.5.0),
reforço, pessoas, mensagens e integração com o EFClaudian (v0.6.0 em diante).
