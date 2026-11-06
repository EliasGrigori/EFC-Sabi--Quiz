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
