# Designar

Apoio digital ao quadro de anúncios da congregação: organiza as designações (meio de semana, fim de semana, limpeza, A/V e indicadores, saídas de campo) e faz com que cada publicador fique sabendo, a tempo, do que lhe cabe.

O site é estático (GitHub Pages) e os dados ficam no Firebase (Firestore), protegidos por regras de acesso.

## Arquivos do site

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O sistema inteiro (gerado; não edite à mão) |
| `config.js` | Dados desta instalação: projeto Firebase, administrador principal e WhatsApp de suporte |
| `lib/` | Bibliotecas (Firebase, PDF, planilhas), servidas pelo próprio site |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Aplicativo instalável e uso sem internet |
| `versao.json` | Versão publicada (o sistema avisa quando há uma mais nova) |
| `404.html` | Página de erro |
| `firestore.rules` | Regras do banco; copie para o Firebase (não precisa estar no site) |

## Usar em outra congregação

1. **Firebase:** crie um projeto em console.firebase.google.com, adicione um app da Web e copie o `firebaseConfig`.
2. **Firestore:** crie o banco (modo de produção, região `southamerica-east1`).
3. **Login:** em Authentication › Método de login, ative **Google** (e, se quiser, **E-mail/senha** com **Link do e-mail**).
4. **Domínios autorizados:** em Authentication › Configurações, inclua o endereço do site (ex.: `usuario.github.io`) e remova `localhost`.
5. **config.js:** troque `firebase`, `dono` (e-mail do administrador principal) e `whatsapp` (contato de suporte, com DDI e DDD).
6. **firestore.rules:** troque o e-mail na função `dono()` (marcada com "TROQUE AQUI") pelo mesmo de `dono`, cole as regras em Firestore › Regras e publique.
7. **GitHub Pages:** envie todos os arquivos do site para um repositório e ative Pages (branch `main`, pasta raiz).
8. **Primeira entrada:** entre com o e-mail do `dono`, preencha Mais › Ajustes (nome da congregação, dias e horários) e libere os demais e-mails em Ajustes › Acesso ao sistema.
9. **Segurança:** no Google Cloud Console › Credenciais, restrinja a chave da API aos endereços do site.

## Avisos no celular (opcional)

Lembretes das designações uma semana antes e na véspera, e aviso de pedidos de acesso para os administradores. Gratuito (Firebase Cloud Messaging + GitHub Actions).

1. **Chave pública:** Firebase › Configurações do projeto › Cloud Messaging › Certificados push da Web › Gerar par de chaves. Copie a chave para `vapid` no `config.js`.
2. **Chave do servidor:** Firebase › Configurações do projeto › Contas de serviço › Gerar nova chave privada. No GitHub, em Settings › Secrets and variables › Actions › New repository secret, crie `FIREBASE_SERVICE_ACCOUNT` e cole o conteúdo inteiro do arquivo. Não guarde esse arquivo em outro lugar.
3. **Regras:** publique o `firestore.rules` atualizado.
4. **Teste:** no GitHub, aba Actions › Avisos das designações › Run workflow (com "teste" marcado). Quem é administrador e ativou os avisos recebe uma notificação.

Cada pessoa ativa em **menu da conta › Avisos no celular**. No iPhone, só funciona com o aplicativo na tela de início (iOS 16.4+). O GitHub pausa tarefas agendadas de repositórios sem nenhuma alteração por 60 dias; se isso acontecer, reative em Actions.

## Cópias de segurança

- **Automáticas:** uma por semana, guardadas no próprio Firebase quando um administrador entra (ficam as 8 mais recentes). Em Ajustes › Cópias guardadas no servidor dá para baixar ou restaurar.
- **Manuais:** Ajustes › Baixar cópia de segurança gera um arquivo `.json`. Guarde fora do computador de vez em quando.

## Depois de publicar

Entre como administrador e use **Ajustes › Conferir o site**: o sistema confere se todos os arquivos estão no GitHub, se a versão é a mais nova e se banco, PDF e planilhas funcionam.

## Para quem mantém o código

O código-fonte fica em partes (`src/`) e é montado por `montar.py`, que gera o `index.html` do site e a versão de testes usada no Claude. A versão de testes **não** tem os dados oficiais.
