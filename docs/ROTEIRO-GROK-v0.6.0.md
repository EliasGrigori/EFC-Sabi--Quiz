# Roteiro de verificação do Grok · Sabiá v0.6.0

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
