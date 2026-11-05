# Roteiro do Grok · Sabiá v1.2.0 (meta em pontos)

## O que foi feito
Cada treinamento pode ter meta em **%** (como antes) ou em **pontos**. Regra do Elias: a pessoa atinge a meta se fizer X pontos ou mais, **sem contar o bônus de rapidez**. Cada acerto vale 1.000 pontos.

## Como conferir
1. Editor de um treinamento com 4 perguntas valendo nota: o campo **Meta** tem um seletor "% de acertos / pontos".
2. Trocar para **pontos**: 80% vira **3.000**; a ajuda diz "Máximo deste treinamento: 4.000 pontos (4 perguntas), então a meta pede 3 acertos". O campo anda de 1.000 em 1.000.
3. Digite 5000: a ajuda avisa "A meta passa do máximo: ninguém vai atingir" (texto em vermelho). Digite 0: não grava.
4. Voltar para %: 3.000 vira 75%.
5. Salve uma versão com pontos, mude para %, abra Versões > Comparar: aparece "Meta era 3.000 pontos". Restaurar traz os pontos de volta; Desfazer volta ao anterior.
6. Lista de treinamentos e resumo do editor mostram "3.000 pontos".
7. Aplique uma sessão com 4 pessoas: acertam 4, 3, 2 e 1 perguntas. **Atingem a meta só as duas primeiras** (4 e 3 acertos). O Relatório diz "meta de 3.000 pontos"; o PDF de registro tem "Meta de acerto 3.000 pontos" e "Como a meta conta: 1.000 pontos por acerto, sem o bônus de rapidez".
8. O telão mostra "3.000 pontos de meta" na espera e no pódio.
9. A coluna **Pontos** do relatório inclui o bônus de rapidez (por exemplo 3.600) e pode passar de 3.000 mesmo com 2 acertos: a meta olha só os acertos, não essa coluna.
10. Exportar o treinamento (.json) e importar de volta mantém a meta em pontos. Arquivo com meta em pontos absurda (999999) cai para 80%. Arquivo antigo (só %) continua igual.
11. Treinamento em % funciona exatamente como antes (80% continua 80%).

## Outros erros para procurar
- Pessoa com um acerto a menos do que a meta pede sendo marcada como "Atingiu a meta" (ou o contrário). Teste com 3, 5, 7 e 10 perguntas.
- Mudar a meta do treinamento com a sala já aberta alterando a conta daquela sessão (não deve: a conversão é feita uma vez).
- Reforço "só as perguntas que erraram" usando uma meta diferente da sessão original (deve usar a mesma).
- Meta em pontos com treinamento sem perguntas valendo nota (a ajuda deve pedir para adicionar perguntas).
- Campo da meta cortado no celular de 390 px; seletor difícil de tocar.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.2.0".
