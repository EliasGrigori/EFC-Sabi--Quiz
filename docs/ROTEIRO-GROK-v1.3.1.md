# Roteiro do Grok · Sabiá v1.3.1 (material grande, só no aparelho)

## O que foi feito
Regra nova do Elias: o material pode ser **grande** (PPTX e PDF até 300 MB; HTML até 30 MB), mas **nunca vai para a nuvem**. O arquivo fica só no aparelho; o título e os capítulos viajam na exportação do treinamento. Em outro aparelho é preciso anexar de novo o mesmo documento.

## Como conferir
1. Anexe um PPTX ou PDF de uns 50 a 100 MB (Painel > Material): é aceito, mostra o tamanho em MB e abre rápido. Um arquivo acima de 300 MB, ou HTML acima de 30 MB, é recusado com aviso.
2. Exporte o treinamento (.json) e abra o arquivo no bloco de notas: tem `material` com nome, tipo, tamanho e capítulos, e `cap` nas explicações, mas **nada do conteúdo do arquivo**.
3. Em outro navegador (ou perfil novo), importe o .json. Painel > Material mostra o nome, os capítulos e o aviso "O arquivo não está neste aparelho". Na sala, "Ver aqui" diz o mesmo.
4. Clique em "Anexar o mesmo arquivo": PDF no lugar de PPTX é recusado; PPTX com outro número de slides é recusado; o mesmo arquivo volta a funcionar e as ligações das explicações continuam.
5. Confirme no Firebase (Realtime Database) que **nenhum** dado de material aparece.

## Outros erros para procurar
- Espaço do navegador: arquivo grande com disco quase cheio deve dar aviso, não travar.
- PPTX gigante de outro programa que o leitor não abra (ZIP64): deve mandar usar PDF.
- Importar um .json de material com tipo estranho: o material é ignorado e as ligações somem.
- Ctrl+F5: Ajustes deve mostrar "Sabiá v1.3.1".
