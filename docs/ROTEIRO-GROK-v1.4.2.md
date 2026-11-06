# Roteiro do Grok · Sabiá v1.4.2 (bichos ainda maiores)

## O que foi feito
1. Recorte fixo ao montar o bicho (`BON.recorte = [35, 30, 250]`): tira a borda vazia das imagens de 320 px e entrega 250 px. O bicho fica cerca de 28% maior no mesmo quadro, em todo lugar (celular, lista do instrutor, telão, pódio). O recorte é igual para todos os bichos.
2. Tela de nome: quadro do bicho de 112 para 140 px.
3. Espera no celular: bicho em cima do nome, com `min(240px, 62vw)`.
4. Zoom das miniaturas de Cabeça/Detalhes/Pescoço recalculado para o recorte; máscara das bordas mais aberta (88%).

## Como conferir
1. Ctrl+F5 (no celular, fechar e abrir duas vezes): Ajustes mostra "Sabiá v1.4.2".
2. Monte bichos com o chapéu de mago, coroa, capacete e os itens de pescoço: nenhuma ponta cortada no quadro, em nenhum dos 17 bichos (jacaré e teiú são os mais compridos).
3. Celular de 390 px e de 320 px: tela de nome, montador (todas as abas) e espera. Sem rolagem para o lado; nome sempre embaixo do bicho na espera.
4. Telão: sala de espera, pódio (3 primeiros) e lista do 4º ao 10º com os bichos maiores e sem sobrepor nomes.

## Outros erros para procurar
- Bicho borrado demais em telas grandes (o desenho tem 250 px).
- Chapéu ou rabo sumindo pela máscara das bordas.
- Na espera, botões empurrados para fora da tela em celulares baixos.
