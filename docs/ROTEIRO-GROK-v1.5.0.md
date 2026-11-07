# Roteiro do Grok · Sabiá v1.5.0 (Apresentar e prompt padrão)

## O que foi feito
1. **PDF desenhado de verdade:** o visor do material desenha cada página do PDF com o PDF.js (pasta `lib/pdfjs/`, licença Apache 2.0, guardado pelo `sw.js` para funcionar sem internet). Antes era o leitor do navegador num iframe.
2. **Apresentar:** no painel do treinamento (aba Material), "Apresentar" abre o material em tela cheia nesta janela; "Abrir em outra tela" abre `#/apresentar/<id>` numa janela só da apresentação (para o projetor).
3. **Controle da sala:** "Apresentar no telão" desde a sala de espera. O telão abre o material, o controle mostra "No telão: página X de N" com Anterior, Próxima e "Voltar ao quiz". Avançar o quiz não fecha a apresentação. Se o telão não responder em 2 s, o controle avisa.
4. **Navegação:** seta, Espaço, Enter, PageDown passam; seta para a esquerda e PageUp voltam; tocar no terço direito ou esquerdo, ou arrastar para o lado; lista de capítulos; F ou botão Tela cheia; Esc sai.
5. **Capítulos automáticos do PDF:** pelos marcadores do arquivo; sem marcadores e com página deitada (apresentação exportada), um capítulo por página com o título do slide; senão "Documento inteiro". Limite de 20 s na leitura.
6. **PPTX:** o painel ensina a salvar como PDF no PowerPoint para apresentar com o desenho dos slides. O Apresentar funciona com PPTX em texto e imagens.
7. **Prompt padrão:** "Novo > Criar com uma IA" ganhou "Copiar prompt padrão". O prompt pede explicação por assunto e de 8 a 12 perguntas misturando 4 de múltipla escolha, 3 de V ou F e 3 de sequência, só com o conteúdo enviado, entregando `treinamento-sabia.json`. "Importar arquivo" aceita o JSON mesmo com texto ou marcas em volta e marca "Criado com IA". O texto sob medida aceita até 50 mil letras de material (antes 6 mil).
8. **Logotipo de dentro do app:** o desenho foi recortado do fundo verde (sem a moldura da foto) e ficou maior: menu lateral 64 px (antes 48), "Próximo passo" 76 px (antes 52), Ajustes > Integração 72 px, cabeçalho do celular 46 px (antes 32), telão 48 px (antes 34). O ícone instalado do app (tela inicial do celular) não muda.
9. Inclui a v1.4.3.

## Como conferir
1. Ajustes mostra "Sabiá v1.5.0".
2. No PowerPoint, exporte uma apresentação real como PDF. Anexe no painel do treinamento: os capítulos devem ter os títulos dos slides.
3. Apresentar: a página aparece igual ao slide (cores, imagens, fontes), cabe na tela, passa e volta por teclado, toque e arrastar. Tela cheia e Esc.
4. Abrir em outra tela: a janela abre (se o navegador bloquear, aparece aviso), "Começar em tela cheia" funciona, Esc fecha a janela.
5. Sala: com o telão aberto, "Apresentar no telão" na espera, durante explicação e durante pergunta. Controle e telão mostram a mesma página. "Voltar ao quiz" fecha no telão. Sem telão aberto, o aviso aparece em 2 s.
6. Capítulo ligado a uma explicação continua abrindo pelo botão "Mostrar no telão" e pela tecla M, e fecha ao sair da explicação.
7. Sem internet (depois da primeira visita): anexar e apresentar um PDF funciona.
8. Celular e tablet: Apresentar com o aparelho em pé e deitado; a página se ajusta ao girar.
9. Prompt padrão: copiar, colar no ChatGPT, Gemini e Claude com um PDF ou PPTX anexo; baixar o .json e importar. Conferir que vieram os 3 formatos misturados e o aviso "Criado com IA: confira antes de aplicar".
10. Logotipo: no menu lateral, no "Próximo passo" do Início, no telão, no cabeçalho do celular e em Ajustes > Integração aparece só o desenho (cabelo e rosto), maior, sem quadrado verde em volta; nítido nos temas claro e escuro.
11. Nenhuma regra nova no Firebase.

## Outros erros para procurar
- PDF grande (100 a 300 MB): tempo para abrir e para montar os capítulos; o navegador não pode travar.
- PDF com senha ou corrompido: deve aparecer aviso, sem quebrar a tela.
- Página desenhada borrada em telão 4K ou com zoom do navegador.
- IA que devolve JSON com campos a mais ou faltando: o Sabiá deve recusar com aviso, ou importar só o que é válido.
- Apresentação aberta e o instrutor encerra a sala: o telão não pode ficar travado no material.
