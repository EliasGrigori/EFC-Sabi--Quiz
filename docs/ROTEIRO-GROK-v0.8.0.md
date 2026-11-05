# Roteiro de verificação do Grok · Sabiá v0.8.0

Precisa de um navegador, de uma conta do EFClaudian de cada perfil (Primário, Líder estrela, Colaborador) e da configuração do Firebase do EFClaudian (não salve em nenhum arquivo). Sem isso, rode `teste-integra.js` (66 testes, com SDK de mentira) sobre `dist`.

### O que foi feito
Perfis: Primário, Líder estrela e Colaborador (Ajustes > Perfil e conta). Primário e Líder estrela criam, editam, aplicam, veem Pendências, Pessoas e Mensagens. Colaborador só consulta Início, Treinos (sem Novo, Editar, Aplicar, Excluir, Duplicar, Importar), Relatórios, Conferir e Ajustes.
Conta do EFClaudian (Ajustes > Integração): a pessoa cola uma vez, neste aparelho, a configuração do Firebase do EFClaudian (apiKey, authDomain, projectId, appId e, se houver, a chave do App Check). Ela fica só no localStorage (`sabia-efc-cfg`), fora dos dados exportáveis e fora do código. Depois entra com login ou e-mail e senha, como no EFCquiz: o login procura o e-mail em `sv2_login`, e o perfil vem de `sv2_users/{uid}` (perfil "principal" = Primário; `estrela` = Líder estrela; senão Colaborador; `bloqueado` recusa). Sair só do Sabiá, voltar a usar a conta conectada e sair de tudo.
Porta de entrada (Ajustes > Integração, desligada por padrão): ligada, o Sabiá só abre em aparelho ativado por `?ativar=1` (menu do EFClaudian), ou por login de responsável. Ligar ativa o aparelho atual. `?demo=1` abre a demonstração com sessões marcadas como teste. A rota do celular do participante (`#/entrar/...`) nunca é bloqueada.
EFC_API para o EFClaudian: versao(), perfil(), conta(), abrir(rota).
Ajustes completo, com índice de 10 seções: Identificação, Perfil e conta, Aparência, Telão e sala (telão e som padrão de cada sessão), Demonstração (carregar exemplos, apagar sessões de teste), Setores e pessoas, Celulares, Armazenamento, Integração, Observações.
Observações do treinamento (no editor): anotações com autor e data; só Primário e Líder estrela; não criam versão.
Correção: botões de remover setor tinham 28 px; agora 36 px.

### Como conferir que deu certo
1. Ajustes > Perfil e conta: troque para Colaborador. O menu perde Pendências, Pessoas e Mensagens; a barra do celular fica com Início, Treinos e Mais; Treinos não mostra Novo, Editar, Aplicar nem Excluir; digitar o endereço #/pessoas, #/aplicar/x, #/editar/x, #/sala/x volta ao Início com aviso. Volte para Primário.
2. Editor de um treinamento: caixa "Observações do treinamento". Anote, exclua e use Desfazer. Confira que o treinamento não vira "alterações sem versão".
3. Ajustes > Telão e sala: mude o padrão para Claro e abra Aplicar: o telão já vem claro. Demonstração: "Carregar exemplos" e "Apagar sessões de teste" (com Desfazer; as oficiais ficam).
4. Integração: cole a configuração do Firebase do EFClaudian (sem chave: mostra erro). A configuração não pode aparecer em "Exportar tudo" nem em nenhum arquivo do projeto.
5. Entre com um responsável Primário: aparece "Conectado", o perfil vem da conta e o seletor de perfil some. Repita com uma conta Líder estrela e uma de Colaborador. Senha errada: "Login ou senha não conferem". Conta sem cadastro em `sv2_users` ou bloqueada: "Esta conta não tem cadastro ativo no EFClaudian".
6. Recarregue: a conta continua. "Sair só do Sabiá" volta ao perfil do aparelho e oferece "Voltar a usar a conta conectada", sem senha. "Sair de tudo" desconecta também do EFClaudian.
7. Porta: ligue. Em outro navegador (ou apagando `sabia-ativado` do armazenamento local) abra o Sabiá: aparece "Este aparelho ainda não foi ativado" e nenhum menu. Entre com a conta de responsável: abre. Abra com `?ativar=1`: abre. Abra `#/entrar/123456` no celular: continua abrindo (participante). Abra com `?demo=1`: abre com a faixa "Demonstração".
8. Celular de 390 px e tema escuro: Ajustes, a porta e Treinos como Colaborador sem rolagem lateral e com alvos de toque de pelo menos 36 px.

### Outros erros para procurar
- **O ponto mais importante:** a conta usa o SDK do Firebase carregado de gstatic.com e as mesmas chamadas do EFCquiz original (`sv2_login`, `sv2_users`, `signInWithEmailAndPassword`). Os testes usam um SDK de mentira, então só você e a conta real provam que funciona. Se o App Check do projeto estiver exigido, cole a chave dele junto com a configuração (campo `appCheckKey`).
- O login do EFClaudian é compartilhado pelo navegador (mesma origem). Se o Sabiá estiver em outro endereço que o EFClaudian, o login não é compartilhado e pede senha.
- A porta de entrada é uma trava de uso no aparelho, não segurança: quem souber `?ativar=1` passa. Confira se a mensagem deixa isso claro.
- Colaborador conectado por conta e tentando apagar dados, importar arquivo ou criar treinamento por algum caminho que eu não vi.
- Perfil trocado em Ajustes sem conta: vale só neste aparelho (não é segurança).
- Sem internet: o Sabiá deve abrir e usar a última conta conhecida.
- Console sem erros em Ajustes, porta, editor e celular. Escreva tudo em `CAIXA-DO-GROK.md`.

### Ainda não existe (não conta como erro)
Voz, banco de perguntas, painel lateral das versões, carimbo de tempo, regras do Firebase mais rígidas (v1.0.0); temas do EFClaudian (o Sabiá mantém a identidade própria); mensagens e pendências ligadas ao EFClaudian (reforço de NC).
