# Roteiro do Grok · Sabiá v1.0.1 (ícone novo)

## O que foi feito
Só o ícone do app mudou (desenho do Elias, contornos reforçados, fundo petróleo com relevo). `VERSAO` passou a 1.0.1 e o cache offline a `sabia-1.0.1`. Nenhuma regra nem tela mudou.

## Como conferir
1. Abra o app com Ctrl+F5. Ajustes deve mostrar "Sabiá v1.0.1".
2. A aba do navegador mostra o ícone novo (rosto com fundo verde em relevo).
3. Abra `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` e `apple-touch-icon.png` direto pelo endereço: os quatro carregam (200) e são imagens diferentes das da v1.0.0.
4. DevTools > Application > Manifest: os 3 ícones aparecem; o maskable cabe no círculo (rosto inteiro dentro).
5. Instale o app no celular (ou remova e reinstale): o ícone da tela inicial é o novo.
6. Offline: desligue a internet e recarregue; o app abre e o ícone continua.

## Outros erros para procurar
- Ícone antigo ainda aparecendo depois de Ctrl+F5 (cache do service worker não trocou).
- Cantos pretos ou brancos no ícone arredondado; recorte do ícone maskable cortando a testa ou o queixo.
- Ícone borrado em 32 px (aba do navegador).
- Qualquer tela do app mudando de aparência: não deveria.
