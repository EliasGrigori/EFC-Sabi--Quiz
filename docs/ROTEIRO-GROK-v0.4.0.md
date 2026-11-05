# Roteiro de verificação do Grok · Sabiá v0.4.0

Precisa de um Realtime Database do Firebase configurado (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md) e de um celular de verdade (ou janela estreita de 390 px).
Sem dados reais de pessoas: use nomes de teste.

## O que foi feito
Celular do participante: entrar pelo QR, link ou chave; escolher o nome (lista do instrutor com busca por 3 letras, ou nome livre); escolher cor e setor;
responder (múltipla, verdadeiro ou falso, ordenar), ver certo ou errado com pontos, posição e o porquê; resultado final; assinatura de presença com o dedo.
Instrutor: Ajustes > Celulares na sala (endereço, testar conexão, regras para copiar), lista de nomes, remover pessoa, assinaturas no controle, fim da sala apaga tudo do Firebase.
Sem Firebase configurado, a sala continua com participantes simulados (como na v0.2.0).

## Como conferir que deu certo
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

## Outros erros para procurar
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

## Ainda não existe (não conta como erro)
Boneco do participante (só cor), "rever o que errei", ouvir a pergunta, aparelho compartilhado (próxima pessoa), cadastro de pessoas (v0.7), relatórios e PDF (v0.5.0), login do Firebase (acabamento).
