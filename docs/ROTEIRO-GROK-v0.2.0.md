# Roteiro de verificação do Grok · Sabiá v0.2.0

Use o computador (duas janelas do mesmo navegador) e, para a parte do celular, uma janela estreita (390 px).
Sem dados reais de pessoas: os participantes são simulados.
Dica: abra o app com `?rapido=1` no fim do endereço para os participantes simulados entrarem e responderem em frações de segundo.

## O que foi feito
Sala ao vivo: chave de 6 números, QR e link de entrada, convite por WhatsApp, entrar/fechar a entrada, participantes simulados,
telão em outra janela (sincronizado ao vivo), controle com Iniciar / Encerrar tempo / Próxima / Pódio / Encerrar, linha do tempo
das etapas, respostas da pergunta, ranking ao vivo, pódio com resultado da turma e aba Encerradas.
Também: gravação mais segura (não perde a última ação ao recarregar).

## Como conferir que deu certo
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

## Outros erros para procurar
- Encerrar uma sala sem ninguém: ela some sem virar sessão. Encerrar uma sala com gente: pede confirmação.
- Fechar a entrada na sala de espera: simulados param de entrar e o telão mostra "entrada fechada".
- Tempo extra ligado (Ajustes da sessão): a pergunta dura 50% mais.
- Gincana ligada: quem responde mais rápido deve somar mais pontos (acima de 1000).
- Ranking desligado: o telão não mostra nomes no pódio, só o resultado da turma.
- Fechar a janela do telão e abrir de novo pelo mesmo botão: ela volta ao estado certo.
- Duas salas abertas ao mesmo tempo: não devem trocar chaves nem misturar participantes.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

## Ainda não existe (não conta como erro)
Entrada de verdade pelo celular (v0.4.0), editor de perguntas (v0.3.0), relatórios e PDF (v0.5.0), bonecos dos participantes (iniciais coloridas por enquanto).
