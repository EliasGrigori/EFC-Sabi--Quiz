# Roteiro de verificação do Grok · Sabiá v0.5.0

Precisa de uma sessão encerrada (pode ser ensaio com simulados, mas o registro oficial exige pessoas reais) e de um leitor de PDF.
Para ter pessoas reais, use o Firebase da v0.4.0. Sem dados reais: use nomes de teste.
Se quiser conferir sem Firebase, rode o arquivo `teste-relat.js` (monta uma sessão pronta e testa tudo).

## O que foi feito
Relatórios (menu Relatórios, ou botão "Relatório" em Treinos > Encerradas): escolher a sessão; Resumo (indicadores, "O que fazer agora", tabela de presença e resultado ordenável com assinatura); Mapa da turma; Assertividade (ao longo do tempo e por pergunta); Setores.
Documentos: PDF de registro, Lista de presença em PDF com carga horária, Planilha (CSV), Sessão (.json), Imprimir. Foto da turma (entra no PDF de registro). Logotipo (Ajustes) no cabeçalho dos PDFs.
Código de conferência (SAB-XXXX-XXXX-XXXX-XXXX-XXXX) em cada sessão encerrada e no rodapé dos PDFs. Página Conferir: digitar o código ou escolher o .json da sessão.
Reaplicar para quem ficou abaixo da meta: abre Aplicar com a lista de nomes pronta.
Também: corrigido o anel que girava no menu lateral do computador (vinha da v0.4.0).

## Como conferir que deu certo
1. Encerre uma sala com pelo menos 4 pessoas. Em Treinos > Encerradas aparece a sessão com o botão Relatório.
2. Resumo: confira à mão a nota média (média das porcentagens), "atingiram a meta" e o acerto geral (acertos de todos dividido por perguntas x pessoas). O tempo médio é por resposta, em segundos.
3. "O que fazer agora": cita quem está abaixo da meta, perguntas com menos de 60%, quem não assinou e se falta foto.
4. Tabela: clique nos títulos para ordenar (Nome, Setor, Acertos, %, Pontos, Situação). Toque na miniatura da assinatura: abre grande.
5. Mapa da turma: cada linha é uma pessoa; check = acertou, x = errou, traço = sem resposta. Confira 2 pessoas contra o que respondeu no celular. A última linha traz o acerto de cada pergunta.
6. Assertividade: "Ao longo do tempo" só mostra sessões oficiais do mesmo treinamento; a linha vertical é a meta. "Mais difíceis primeiro" ordena do menor para o maior acerto. A "errada mais escolhida" bate com o que a turma marcou.
7. Setores: média por setor, com quem escolheu "Sem setor" juntos.
8. PDF de registro (botão laranja): abra e confira título, versão, data, instrutor, local, carga horária, meta, indicadores, tabela com assinaturas, assertividade por pergunta, setores, foto, e o código no rodapé de todas as páginas, com "Página n de N".
9. Lista de presença: nomes em ordem alfabética, carga horária de cada um (ex.: 1,5 h), assinatura de quem assinou e "sem assinatura" para quem não assinou, linha para o instrutor assinar.
10. Mais > Planilha: abra no Excel. Acentos corretos, ponto e vírgula, uma linha por pessoa, colunas P1, P2... com Certo, Errado ou traço. Um nome começando com = ou + deve aparecer com um apóstrofo na frente (proteção contra fórmula).
11. Mais > Sessão (.json) e Imprimir (abre o PDF em outra aba, onde você imprime).
12. Foto da turma: "Adicionar foto" (no celular abre a câmera). Gere o PDF de novo: a foto aparece com a data. "Trocar" e "Remover" funcionam.
13. Logotipo: em Ajustes, escolha uma imagem; aparece no topo dos dois PDFs. "Remover" tira.
14. Conferir: copie o código do rodapé do PDF e cole na página Conferir (maiúsculas, minúsculas e espaços não importam): "Registro confere". Troque um caractere: "Nenhuma sessão deste aparelho tem esse código". Escolha o .json da sessão: "O arquivo confere".
15. Adultere o .json (mude um nome) e confira: "O arquivo foi alterado".
16. Reaplicar: no Resumo, "Reaplicar para elas" abre Aplicar com o selo Reaplicação e a lista de nomes. Abra a sala: no celular só aparecem esses nomes.
17. Celular e tema escuro: nenhuma tela com rolagem lateral; o mapa e as tabelas rolam por dentro do cartão.

## Outros erros para procurar
- Sessões encerradas antes da v0.5.0 (se houver): o código aparece com "gerado depois". Isso é esperado.
- Nome muito longo, acento raro (ç, ã, ü) ou caractere fora do alfabeto latino no PDF: o PDF usa só o alfabeto ocidental; outros caracteres viram "?". Veja se o resto do documento continua correto.
- Sessão com 40 ou mais pessoas: a tabela continua na página seguinte com o cabeçalho repetido, sem cortar linha no meio.
- Sessão de teste ou ensaio com simulados: o PDF traz o aviso "não vale como registro oficial", e o relatório mostra o selo.
- Mudar o nome de uma pessoa nos dados e abrir Conferir: a sessão aparece "Alterado depois de encerrar".
- Encerrar uma sala sem ninguém: a sala some e nada vai para Relatórios.
- Apagar o treinamento depois da sessão: o relatório continua abrindo; "Reaplicar" e "Revisar no editor" ficam desligados.
- Duas pessoas com o mesmo nome: as duas aparecem, cada uma com sua assinatura.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

## Ainda não existe (não conta como erro)
Equipes e gincana no relatório, desempate por tempo, "Desafio entre setores do mês" (v0.7), mensagens (v0.7), reforço pendente e refazer (v0.6), carimbo de tempo externo e senha no registro, login do Firebase (acabamento).
