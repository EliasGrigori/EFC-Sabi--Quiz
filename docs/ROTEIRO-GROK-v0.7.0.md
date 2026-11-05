# Roteiro de verificação do Grok · Sabiá v0.7.0

Precisa de um Realtime Database do Firebase configurado (veja PASSO-A-PASSO-FIREBASE-v0.4.0.md), de um navegador no computador e de um celular (ou janela de 390 px), e de 4 ou 5 pessoas de teste (nomes inventados). Sem Firebase, rode `teste-pessoas.js` (84 testes) e `teste-pessoas-cel.js` (30 testes, com simulador do Firebase) sobre a pasta `dist`. Não use dados reais.

### O que foi feito
Pessoas (menu): cadastro com nome, setor e apelidos; busca; filtro por setor e situação (ativas, arquivadas, todas); adicionar, editar, arquivar, excluir com Desfazer; "Colar lista" (uma pessoa por linha, "Nome; Setor"); aviso de nomes que apareceram nas sessões e não estão no cadastro, com "Cadastrar" ou "É a mesma pessoa de...". Renomear guarda o nome antigo como apelido.
Perfil (toque no nome): sessões, nota média, quantas vezes atingiu a meta, 6 selos (primeira meta, constância, presença, nota máxima, recuperou, primeiro lugar), pendências abertas, mensagens enviadas e histórico com link para o relatório. Só sessões oficiais contam.
Aplicar: "Quem participa?" mostra que as pessoas do cadastro entram pela lista (respeitando os setores escolhidos), com "Não usar". O celular só mostra os nomes do cadastro quando digita 3 letras e o setor vem do cadastro.
Mensagens (menu, com número de novas): lista com nome, setor, treinamento e versão; filtro por tipo e situação; Responder, Marcar como lida, Excluir com Desfazer; aviso no Início quando não há pendências mais urgentes; cartão de mensagens no pódio da sala.
Celular do participante: "Deixe um comentário" (elogio, sugestão, reclamação, pergunta; 3 a 300 letras; até 3 por pessoa); a resposta do instrutor aparece abaixo; "Outra pessoa vai usar este celular" apaga os dados da pessoa anterior no aparelho.
Relatórios: nova visão "Desafio entre setores" (mês ou ano, mínimo de 3 pessoas por setor, tela grande, sem nomes de pessoas).
Celular do instrutor: barra de baixo com Início, Treinos, Pendências, Mensagens e Mais (Pessoas, Relatórios, Conferir, Ajustes).
Pareamento por pessoa: Pendências, histórico e relatórios usam o nome canônico do cadastro (nome ou apelido), então Zé e José viram uma pessoa só quando há apelido.

### Como conferir que deu certo
1. Pessoas vazia: mostra o convite a cadastrar. Adicione "Maria Aparecida Silva" no setor Packing. Tente adicionar "maria aparecida silva": deve ser recusada.
2. "Colar lista" com 4 linhas, uma já existente e uma com setor novo: cadastra 3, ignora a repetida, e o setor novo passa a existir em Ajustes e em Aplicar.
3. Busca por "jose" acha "José" (sem acento, sem maiúscula) e a caixa de busca não perde o foco enquanto digita. Filtro por setor mostra só aquele setor e o botão de filtro mostra o resumo.
4. Edite uma pessoa: troque o nome. O nome antigo aparece em "também: ...". Arquive: ela some da lista padrão (aparece em "Arquivadas" ou "Todas") e não entra mais na lista de entrada. Exclua e use Desfazer.
5. Encerre 3 sessões oficiais com os mesmos nomes escritos de formas diferentes (Zé, José Wellington, José Wellington Souza, com o apelido "Zé" cadastrado). O perfil dele mostra as 3 sessões. Sem o apelido, o nome fora do cadastro aparece no aviso e "É a mesma pessoa de..." resolve.
6. Perfil: confira à mão sessões, nota média e "atingiu a meta". Selos: Primeira meta (1 sessão na meta), Constância (3 últimas na meta, não vale com uma abaixo), Presença (5 treinamentos), Nota máxima (100%), Recuperou (meta no reforço), Primeiro lugar (1º numa sessão com ranking). Teste, ensaio e pré-teste não contam.
7. Aplicar com cadastro: aparece "N pessoas entram pela lista"; escolher setores reduz o número; "Não usar" desliga. Preparar a sessão leva a lista. "Aplicar reforço" mantém a lista só de quem deve refazer.
8. Com o Firebase ligado: abra a sala e entre no celular digitando 3 letras. Escolha o nome da lista: o setor vem do cadastro sem escolher.
9. No fim da sessão, no celular: "Deixe um comentário". Enviar vazio mostra "Escreva pelo menos 3 letras". Envie um comentário de cada tipo (até 3). Depois do terceiro o formulário some. Recarregar o celular mantém os enviados. Digitar não faz a tela repintar nem perder o texto.
10. No instrutor, com a sala aberta, a mensagem chega em Mensagens com tipo, nome, setor, treinamento e versão; o menu mostra o número de novas. Marque como lida, filtre por tipo, responda: a resposta aparece no celular de quem escreveu. Excluir mostra Desfazer.
11. Texto com `<` e `>` ou mais de 300 letras: é limpo e cortado. Tipo inválido (gravado à mão no Firebase) é ignorado.
12. "Outra pessoa vai usar este celular": volta para a entrada, sem nome, comentários, assinatura nem revisão da pessoa anterior (confira o armazenamento local do navegador). A segunda pessoa entra e o bloco de comentário começa vazio.
13. Desafio entre setores (Relatórios > Desafio entre setores): placar do mês com % de acerto por setor, só sessões oficiais encerradas e sem pré-teste, teste ou ensaio. Setor com menos de 3 pessoas aparece em "Fora do placar". Setas mudam o mês; "Ano" soma o ano; "Mostrar em tela grande" esconde os controles; "Voltar" volta. Não aparecem nomes de pessoas.
14. Celular de 390 px e tema escuro: Mais, Pessoas, Perfil, Mensagens e Desafio sem rolagem lateral, com alvos de toque de pelo menos 36 px, e a barra de baixo com 5 itens.
15. Início: com pendências, o aviso é de pendências; sem pendências e com mensagens novas, o aviso é de mensagens.

### Outros erros para procurar
- **Firebase (importante):** as regras em docs/firebase-rules.json não mudaram. O celular agora grava em `/salas/{chave}/part/{id}/com/{id}` e o instrutor grava em `/salas/{chave}/part/{id}/rsp/{id}`. A documentação do Firebase diz que as regras de validação valem em todos os níveis, e `part/$pid` exige o filho `n` (que continua existindo). O simulador usado nos testes não aplica regras. Confirme na base real que o comentário e a resposta são gravados. Se forem recusados, o celular mostra "Não enviou"; anote a mensagem do erro. O mesmo vale para `ref` da v0.6.0.
- Confirme que a sala continua sendo apagada inteira ao encerrar (comentários e respostas somem do Firebase; ficam só no aparelho do instrutor).
- Comentários só chegam com a sala aberta; respostas só chegam ao celular com a sala aberta. É o esperado.
- Dois instrutores ou duas abas com o mesmo cadastro: o cadastro é local de cada aparelho. Veja se isso confunde.
- Pessoa com o mesmo nome em dois setores: o cadastro recusa nome repetido.
- Excluir uma pessoa que tem histórico: o histórico das sessões continua (as sessões guardam o nome), mas o perfil deixa de existir; confira se o nome volta ao aviso de "fora do cadastro".
- Apelido igual ao nome de outra pessoa cadastrada: veja se junta pessoas por engano.
- Renomear para um nome que já existe: deve ser recusado.
- Colar lista com mais de 200 linhas, linhas em branco, espaços sobrando ou setor com maiúscula diferente.
- Sessão de teste ou ensaio: não pode entrar em selos, perfil nem Desafio. Mensagens de sessão de teste aparecem com a marca "Sessão de teste".
- Console sem erros em Pessoas, Perfil, Mensagens, Desafio, Aplicar e no celular.
- Escreva tudo em `CAIXA-DO-GROK.md`. Não altere outros arquivos.

### Ainda não existe (não conta como erro)
Perfil e selos no celular do participante (precisa de login, v1.0), mensagens que chegam sem a sala aberta, vários participantes respondendo no mesmo celular compartilhado, folha de reforço em PDF do EFCquiz original, EFClaudian (v0.8), voz e banco de perguntas, carimbo de tempo e login do Firebase (v1.0).
