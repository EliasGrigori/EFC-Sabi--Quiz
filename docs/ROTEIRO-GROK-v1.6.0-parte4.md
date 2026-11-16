# Roteiro do Grok · Sabiá v1.6.0 parte 4 (Colaborador em Pendências, "código de autenticação" e Fatia E: telão e celular)

Nada muda nos dados nem no código de autenticação: só quem vê Pendências, um nome e a cara do telão e do celular do participante. Abra com `?demo=1`. Para a sala ao vivo, configure o Firebase de teste em Ajustes (ou use o simulador do seu teste).

## O que foi feito
1. O perfil Colaborador passa a abrir Pendências só para consultar: vê reforço, reavaliação e validade, sem "Aplicar reforço/reavaliação/renovação" e sem "Dar baixa". As duas ações também ficam barradas no código.
2. "Código de conferência" virou "código de autenticação": no relatório, na tela Autenticar documento, na planilha e no PDF. O código continua o mesmo.
3. Telão e celular do participante no padrão EFC: azul-noite e dourado (telão escuro) ou marfim e dourado (telão claro), letras numa escala menor, cantos de 2 tipos, chave sem maiúsculas espaçadas. As 4 cores e formas das alternativas são as mesmas; no amarelo a letra ficou escura.
4. No resultado, as alternativas erradas ficam sob um véu e a certa ganha um contorno.
5. "Conferindo" e "Conectando à sala": três pontos que acendem uma vez, no lugar da roda que girava sem parar.
6. Pódio: barras crescem, blocos sobem (3º, 2º e 1º) e, com o som ligado, papéis coloridos saem uma vez de cima do 1º lugar.
7. Movimento só quando a etapa muda; quem entra na sala aparece suave sem a tela inteira piscar.

## Como conferir
1. Ajustes > Perfil > Colaborador: Pendências aparece no menu e na barra de baixo do celular, com "Só para consultar" e sem botões. Teclas, atalhos ou links não devem levar a aplicar ou dar baixa.
2. Primário e Líder estrela: Pendências igual a antes, com os botões.
3. Relatório de uma sessão encerrada: "Código de autenticação". Gerar PDF e planilha: os dois dizem "código de autenticação". Um PDF antigo ainda confere em Autenticar documento.
4. Abrir uma sala e o telão (tema escuro e claro em Aparência da sessão; modo Projetor pela barra do telão). Conferir espera, explicação, pergunta (múltipla, V ou F e Ordenar), conferindo, resultado e pódio.
5. Ler de longe (3 a 5 metros): a alternativa amarela, as erradas sob o véu e a chave.
6. Celular do participante, nos dois temas do aparelho: nome, sala, pergunta, conferindo, resultado, fim com assinatura e revisão.
7. Movimento reduzido ligado no aparelho: nada anima, e os três pontos já aparecem acesos.
8. Prévia do telão no Editor e na Sala ao vivo: mesmo visual.

## Outros erros para procurar
- Algo que fica invisível (apagado) se a animação não rodar, por exemplo ao recarregar o telão no meio de uma etapa.
- Telão que "pisca" a cada resposta ou a cada segundo do relógio.
- Texto cortado no telão em perguntas longas ou com 4 alternativas compridas.
- Safari do iPhone: o celular do participante (cores e cantos).
- Sala ao vivo (S03) e bichos que piscam (S12): ainda abertos (v1.5.3).
