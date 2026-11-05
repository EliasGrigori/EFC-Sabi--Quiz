# Firebase para os celulares entrarem na sala · Sabiá v0.4.0

O Sabiá usa só o **Realtime Database**. Não usa login, nem Firestore, nem Storage. Nada de chave ou senha fica no projeto do app: você cola apenas o endereço do banco em Ajustes.

## O que configurar (uma vez)
1. Entre em https://console.firebase.google.com e clique em **Criar projeto**. Dê um nome (ex.: sabia-fazenda). Pode desligar o Google Analytics.
2. No menu da esquerda: **Build > Realtime Database > Criar banco de dados**. Escolha a região mais próxima e o modo **bloqueado**.
3. Copie o endereço que aparece no topo da aba **Dados**. É parecido com `https://sabia-fazenda-default-rtdb.firebaseio.com` (ou termina em `firebasedatabase.app`).
4. Abra a aba **Regras**, apague o que estiver lá, cole o conteúdo do arquivo `firebase-rules.json` (ou use o botão "Copiar as regras" em Ajustes do Sabiá) e clique em **Publicar**.
5. No Sabiá: **Ajustes > Celulares na sala (Firebase)**, cole o endereço e toque em **Testar conexão**. Deve aparecer "Conectado".

## Como usar na prática
- Abra a sala normalmente (Aplicar > Abrir sala). O telão mostra o QR. O participante aponta a câmera e entra.
- Na primeira vez o celular precisa abrir pelo QR ou pelo link (ele aprende onde fica o banco). Nas próximas, basta digitar a chave em `#/entrar`.
- "Lista de nomes" no controle: com a lista, a pessoa digita 3 letras e escolhe o nome. Sem lista, digita o nome.
- Ao **Encerrar a sala**, tudo dela é apagado do Firebase. Se fechar o navegador sem encerrar, a sala fica lá (ocupa poucos KB). Você pode apagar a pasta `salas` na aba Dados.

## O que verificar depois de configurar
- **Uso**: aba Uso do Realtime Database. Uma sala de 30 pessoas gasta muito pouco, bem abaixo do limite gratuito.
- **Regras**: use o "Simulador de regras" na aba Regras para conferir que você consegue ler `/salas/123456` e que `/` não pode ser lido.
- **Segurança (leia)**: nesta versão a sala é protegida só pela chave de 6 números, sem login. Quem souber o endereço do banco e a chave consegue ler os nomes e escrever na sala. Use para treinamentos internos e não guarde nada sigiloso. O endurecimento (login anônimo e regras por dono da sala) está previsto para a etapa de acabamento.
- **Dados pessoais**: os nomes e as assinaturas ficam no Firebase só enquanto a sala está aberta. Depois ficam apenas no aparelho do instrutor (em Encerradas).
- **Teste final**: abra uma sala, entre com seu celular, responda e encerre. Confira na aba Dados que a pasta `salas` ficou vazia.
