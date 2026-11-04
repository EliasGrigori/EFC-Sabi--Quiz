# MEMÓRIA DO PROJETO · Sabiá (antigo EFCquiz v2.8.8)

Atualizado na v0.1.0 (04/11/2026). Este arquivo sobe junto com cada versão. Toda regra nova do Elias entra aqui.

## O que é
App PWA de treinamento e avaliação de eficácia da Fazenda Matriz (MERI POBO), da família EFClaudian. O Sabiá é o rework do EFCquiz:
mesmas funções, cara nova. Versões recomeçam do zero (v0.1.0 até v1.0.0).

## Decisões já tomadas
- Nome: Sabiá. Cores: petróleo #0E4A48 e laranja sabiá #D45D17. Fontes: Bricolage Grotesque e Atkinson Hyperlegible.
- Formas simples (folha, gota, sol, pedra) e ícones desenhados. Sem emojis.
- Bonecos 3D por código foram descartados (resultado feio). O caminho de bonecos prontos (galeria) foi adiado. Elias pediu para seguir sem imagens por ora.
- Dados só no aparelho (IndexedDB, banco "sabia"), com reserva em localStorage. Sem senhas, chaves ou dados reais nas pastas do projeto.
- Importa treinamentos .json do EFCquiz (tipos explicação, múltipla, verdadeiro/falso, ordenar).

## Regras do Elias (valem sempre)
- Layout limpo, moderno, compacto, sem poluição. Um único filtro recolhível com resumo. Excluir é ícone de lixeira.
- Antes de cada tarefa: mostrar em negrito o modelo e o esforço sugeridos e esperar "pode iniciar".
- Claude trabalha em primeiro plano. Nada em segundo plano nem agendado.
- Antes de publicar no GitHub: página de aprovação com antes e depois. Só publica depois do "aprovado".
- Em toda entrega de versão: roteiro de verificação para o Grok e este arquivo atualizado.
- Ao fechar um lote: resumo do que foi feito e o que verificar e configurar no Firebase.
- Terminar toda entrega com os próximos passos.

## Versões
| Versão | Estado | Conteúdo |
|---|---|---|
| v0.1.0 | pronta, aguardando aprovação | Casca, Início, Treinos, Novo (modelo, zero, importar), exportar, duplicar, excluir com desfazer, Aplicar (3 formatos, setores, registro, ajustes, roteiro), Ajustes, offline |
| v0.2.0 | a fazer | Sala ao vivo: chave, QR, WhatsApp, telão em outra janela (BroadcastChannel) |
| v0.3.0 | a fazer | Editor de perguntas e versões |
| v0.4.0 | a fazer | Celular do participante e assinatura |
| v0.5.0 | a fazer | Relatórios, PDF, lista de presença, conferir registro |
| v0.6.0 a v1.0.0 | a fazer | Reforço, pessoas, mensagens, integração EFClaudian, acabamento |

## Paridade com o EFCquiz (79 funções)
v0.1.0: 10 prontas e 11 parciais (opções de Aplicar guardadas, mas ainda sem sala ao vivo). Detalhe em features.csv.

## Medidas (régua de espaço vazio)
Início 53% → 41% (meta 29%). Aplicar 45% → 39% (meta 40%). Medido com 3 treinamentos de exemplo e sem sessões.

## Pendências e perguntas abertas
- Aprovar a v0.1.0 e dizer em qual repositório do GitHub o Sabiá fica.
- Firebase: nada a configurar até a v0.8 (integração). Nenhuma configuração é necessária agora.
- Personagens: decidir depois (galeria de bonecos prontos ou ilustrações simples).
