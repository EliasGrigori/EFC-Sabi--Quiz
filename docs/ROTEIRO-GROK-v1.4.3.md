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
