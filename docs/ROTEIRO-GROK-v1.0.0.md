# Roteiro de verificação do Grok · Sabiá v1.0.0

Precisa de um navegador, de um celular (ou janela de 390 px) e do Realtime Database do Firebase do Sabiá. Não use dados reais. Sem Firebase, rode `node teste-regras.js`, `node teste-v10.js dist prints` e `node teste-v10-cel.js dist prints` (os testes usam um Firebase de mentira que aplica as regras de `docs/firebase-rules.json`).

### O que foi feito
Banco de perguntas: no editor, o botão do livro guarda a pergunta aberta; "Inserir do banco de perguntas" abre o banco com busca, filtro por formato, Inserir (traz uma cópia no fim do treinamento) e Excluir (com Desfazer dentro do diálogo); "Guardar as perguntas deste treinamento" guarda todas sem repetir. O banco fica só neste aparelho e vai no "Exportar tudo". A voz gravada não vai para o banco.
Criar com uma IA (Novo treinamento): o Sabiá não chama IA nenhuma. Ele monta um texto pronto (assunto, público, quantidade e, se você colar, o POP como única fonte) para colar na IA que você quiser, e lê a resposta em JSON (aceita texto antes e depois e cercas de código). O treinamento nasce marcado "Criado com IA: confira antes de aplicar" (editor e Aplicar) até você tocar em "Já revisei". Formatos inventados, perguntas sem enunciado e áudio embutido são descartados.
Pergunta de teste: Aplicar > Ajustes da sessão > "Começar com uma pergunta de teste" (desligado por padrão). Entra no começo da sessão (não muda o treinamento), não vale nota e não entra no código de conferência.
Voz gravada: no editor, "Gravar a voz" (até 30 s, pede o microfone), regravar e remover com Desfazer. Toca no telão sozinho quando a pergunta abre (se o navegador deixar) e pelo botão "Ouvir". Fica guardada no treinamento e no exportar, e NUNCA vai ao Firebase (conferido: a publicação da sala não leva áudio).
Ouvir no celular: botão "Ouvir a pergunta" lê o enunciado e as opções na ordem da tela, e "Ouvir a resposta" no resultado lê a certa e o porquê, pela voz do próprio celular (pt-BR). Some se o aparelho não tiver voz.
Carimbo de tempo: no Relatório, "Carimbar o horário" grava `/selos/{código}` = horário do SERVIDOR do Firebase, uma única vez. Aparece no relatório, no PDF de registro e em Conferir > "Consultar o carimbo de um código". Não é carimbo de autoridade certificadora (ICP-Brasil); o app diz isso. Recusa carimbar registro que já não confere com o código.
Regras do Firebase mais firmes (`docs/firebase-rules.json`): `part` aceita só n, c, s, t, ref, com e rsp, com tipo e tamanho; `ref` (tentativas 0 a 3, ok 0 ou 1), `com` (k, x até 300 letras, t), `rsp` (x até 300 letras); `selos` só grava uma vez, com o horário do servidor e código no formato SAB-XXXX-XXXX-XXXX-XXXX-XXXX; ninguém lista salas nem carimbos.

### Como conferir que deu certo
1. **Publique as regras novas ANTES de tudo:** Ajustes > Celulares na sala > Copiar as regras; no console do Firebase, Realtime Database > Regras, cole e clique em Publicar. No "Simulador de regras" (Rules Playground) do console teste: gravar em `/salas/123456/part/p1` com `{"n":"Ana","c":1,"s":"","t":1}` deve passar; gravar `{"n":"Ana","hack":"x"}` deve ser recusado.
2. Ajustes > Celulares na sala > Testar conexão: deve dar "Conectado".
3. Sala completa com 1 celular: entre, responda, peça o resultado, rever o que errei e treinar de novo (grava `ref`), envie um comentário (grava `com`), responda no instrutor (grava `rsp`) e assine. **Se alguma dessas etapas falhar só com as regras novas, anote qual: é a regra apertada demais.**
4. Relatório de uma sessão encerrada com Firebase configurado: "Carimbar o horário". Deve aparecer data, hora e segundos e "servidor do Firebase". No console, `/selos/SAB-...` deve ter só `t`. Toque de novo em outro aparelho: mostra o horário original. Gere o PDF de registro e confira a linha "Carimbo de tempo".
5. Conferir > digite o código > "Consultar carimbo". Um código sem carimbo diz "Sem carimbo".
6. Banco: guarde duas perguntas, crie outro treinamento e insira. Busque por palavra. Exclua e use Desfazer. Exporte tudo, apague tudo, importe: o banco volta.
7. Criar com IA: use o texto montado numa IA, cole a resposta, crie. Confira cada pergunta com o POP. Tente colar texto sem JSON: deve explicar o erro.
8. Voz: grave uma pergunta, abra a sala e o telão em outra janela. A voz toca ao abrir a pergunta e pelo botão Ouvir. No Firebase, `/salas/{chave}/pub/item` não pode ter áudio.
9. Celular: toque em "Ouvir a pergunta" (Chrome do Android e Safari do iPhone) e em "Ouvir a resposta".
10. Celular de 390 px e tema escuro: banco, criar com IA, editor com voz e relatório com carimbo sem rolagem lateral e com alvos de pelo menos 36 px.

### Outros erros para procurar
- **O ponto mais importante é o item 3:** as regras novas foram provadas só com um avaliador que escrevi (44 conferências, e todas as suítes de celular rodaram sob elas). O Firebase real é quem decide. Se recusar `ref`, `com`, `rsp` ou `part`, volte ao arquivo `docs/firebase-rules-v0.8.0-anterior.json` (as regras da v0.8.0) e me diga a mensagem exata.
- Voz gravada: o microfone só funciona em endereço https. Teste Chrome e Safari. Confira se grava, para e toca de novo depois de recarregar.
- Autoplay do telão: alguns navegadores só tocam depois de um clique na janela do telão. O botão "Ouvir" cobre isso. Diga se a voz some quando a pergunta muda rápido.
- Ouvir no celular: a qualidade da voz depende do aparelho. Veja se o iPhone lê em português.
- Carimbo: o horário é do Firebase do próprio projeto. Quem é dono do projeto consegue editar no console. Confira se as mensagens deixam isso claro.
- Criar com IA: o app não confere se a IA acertou. Veja se o aviso "confira antes de aplicar" aparece e some só em "Já revisei".
- Console sem erros em todas as telas novas. Escreva tudo em `CAIXA-DO-GROK.md`, com a versão.

### Ainda não existe (não conta como erro)
Meta em pontos, painel lateral das versões, material com capítulos (abre por cima da tela), modos de telão projetor e apresentação, folha de reforço em PDF, perfil do participante no celular (precisa de login), boneco do participante (decisão do Elias: só cor), carimbo de autoridade certificadora.
