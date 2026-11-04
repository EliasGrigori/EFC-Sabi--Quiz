# Roteiro de verificação do Grok · Sabiá v0.3.0

Use o computador (janela larga, 1280 px) e uma janela estreita (390 px) para o celular.
Abra o app sem dados, ou com `?demo=1` no fim do endereço para já ter 3 modelos prontos.

## O que foi feito
Editor de perguntas (Treinos > ícone de lápis, ou "Começar do zero"): 4 formatos (múltipla escolha, verdadeiro ou falso, ordenar, explicação),
tempo, como conta (vale nota, gincana, teste que não vale), "por que está certa", reordenar, duplicar, excluir com desfazer, trocar o formato com desfazer,
avisos do que falta em cada pergunta, prévia do telão (Pergunta e Resultado) e resumo (valem nota, duração, meta, a revisar).
Versões do treinamento: salvar versão com nota, comparar com o rascunho, restaurar com desfazer; aplicar fixa a versão sozinho e a sessão guarda a cópia das perguntas.

## Como conferir que deu certo
1. Treinos > Novo treinamento > Começar do zero > título e meta > deve abrir o editor vazio com 4 formatos para escolher.
2. Escolha "Múltipla escolha": o cursor vai para o enunciado. Apareçam avisos: falta o enunciado, alternativa em branco, marque a certa. Preencha tudo e marque a certa: avisos somem e a lista mostra "Pronto para aplicar".
3. A prévia do telão mostra a pergunta com 4 cores e formas. Em "Resultado" só a alternativa certa fica destacada e o "porquê" aparece.
4. Adicione verdadeiro ou falso (2 linhas fixas), ordenar (3 a 5 passos, com subir e descer) e explicação (sem alternativas nem tempo).
5. Mover para cima ou para baixo, duplicar, excluir (aparece "Desfazer" por 3 segundos). Trocar o formato também permite desfazer.
6. Recarregue a página: tudo continua. Volte para Treinos: aparece a versão com asterisco (v00*) quando há alteração sem versão salva.
7. Versões (relógio no topo): salve com uma nota (vira v01). Edite uma pergunta e adicione outra. Abra Versões > Comparar: + nova, ~ alterada, − removida.
8. Restaurar v01: o rascunho volta ao que estava, com "Desfazer". Restaurar a versão atual é impossível quando não há alteração.
9. Aplicar > Abrir sala: a versão é salva sozinha (v02) e a sala usa as perguntas novas.
10. Exportar o treinamento (.json) e importar de volta: perguntas, certas e "por quê" iguais.
11. Celular (390 px): lista de perguntas primeiro, depois o editor, depois a prévia; sem rolagem lateral; botões de pelo menos 44 px.
12. Tema escuro: o editor continua legível.

## Outros erros para procurar
- Escrever `<img src=x onerror=alert(1)>` no enunciado: deve aparecer como texto, no editor e na prévia, sem executar.
- Apagar todas as alternativas até o mínimo: múltipla fica com 2, ordenar com 3 (botão de remover apagado).
- Apagar a alternativa marcada como certa: a certa fica sem marcação e o aviso volta.
- Mudar a meta para 0 ou 101: não deve aceitar (continua o valor anterior).
- Abrir `#/editar/` com id que não existe: volta para Treinos.
- Editar o treinamento com uma sala aberta: a sala em andamento não muda (ela usa a cópia).
- Pergunta com tempo de 10 s ou 2 min: aparece certo no telão.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

## Ainda não existe (não conta como erro)
Meta em pontos, periodicidade e reavaliação (v0.6.0), voz gravada e banco de perguntas, criar com IA, entrada real pelo celular (v0.4.0), relatórios e PDF (v0.5.0).
