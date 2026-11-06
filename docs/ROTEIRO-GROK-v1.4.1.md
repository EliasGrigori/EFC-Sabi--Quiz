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
