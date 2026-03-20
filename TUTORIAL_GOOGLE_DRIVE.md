# 📁 Tutorial — Integração Google Drive (Comprovantes)

## Visão Geral

Este tutorial configura uma **Service Account** do Google Cloud para que o site Fischer Finanças possa fazer upload de comprovantes diretamente na sua pasta:

```
Meu Drive > Contas Familia Fischer > Contas 2026 > [Mês] > Pagas
```

Tempo estimado: **15 minutos**

---

## PASSO 1 — Criar projeto no Google Cloud

1. Acesse: **https://console.cloud.google.com**
2. Faça login com a conta Google que tem acesso ao Drive da Família Fischer
3. Clique em **"Selecionar projeto"** (canto superior esquerdo)
4. Clique em **"Novo projeto"**
5. Nome do projeto: `fischer-financas`
6. Clique em **"Criar"** e aguarde alguns segundos

---

## PASSO 2 — Ativar a Google Drive API

1. No menu lateral, acesse **"APIs e serviços" → "Biblioteca"**
2. Na barra de pesquisa, digite: `Google Drive API`
3. Clique em **"Google Drive API"**
4. Clique em **"Ativar"**
5. Aguarde a ativação (10-20 segundos)

---

## PASSO 3 — Criar a Service Account

1. No menu lateral, acesse **"APIs e serviços" → "Credenciais"**
2. Clique em **"+ Criar credenciais"** → **"Conta de serviço"**
3. Preencha:
   - **Nome da conta de serviço:** `fischer-drive`
   - **ID da conta de serviço:** `fischer-drive` (preenchido automaticamente)
   - **Descrição:** `Upload de comprovantes Fischer Finanças`
4. Clique em **"Criar e continuar"**
5. Em "Conceder acesso" — clique em **"Continuar"** (sem adicionar papel)
6. Clique em **"Concluído"**

---

## PASSO 4 — Gerar a chave JSON

1. Na lista de credenciais, clique na service account **`fischer-drive@...`**
2. Vá na aba **"Chaves"**
3. Clique em **"Adicionar chave" → "Criar nova chave"**
4. Selecione formato **JSON**
5. Clique em **"Criar"**
6. Um arquivo JSON será baixado automaticamente — **guarde bem este arquivo!**

O arquivo JSON terá esta estrutura:
```json
{
  "type": "service_account",
  "project_id": "fischer-financas",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "fischer-drive@fischer-financas.iam.gserviceaccount.com",
  "client_id": "123456789"
}
```

---

## PASSO 5 — Compartilhar a pasta do Drive com a Service Account

1. Abra o **Google Drive** na sua conta
2. Navegue até: **Contas Familia Fischer → Contas 2026**
3. Clique com o botão direito na pasta **"Contas 2026"**
4. Clique em **"Compartilhar"**
5. No campo de email, cole o **client_email** do arquivo JSON:
   - Ex: `fischer-drive@fischer-financas.iam.gserviceaccount.com`
6. Permissão: **"Editor"**
7. **Desmarque** a opção "Notificar pessoas"
8. Clique em **"Compartilhar"**

> ⚠️ Este passo é obrigatório. Sem ele a service account não consegue acessar a pasta.

---

## PASSO 6 — Pegar o ID da pasta "Contas 2026"

1. No Google Drive, abra a pasta **"Contas 2026"**
2. Olhe para a URL no navegador:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWx
   ```
3. Copie a parte após `/folders/` — esse é o **ID da pasta**
4. Guarde este ID

---

## PASSO 7 — Configurar variáveis na Vercel

1. Acesse **https://vercel.com** → seu projeto `fischer-financas`
2. Vá em **"Settings" → "Environment Variables"**
3. Adicione cada variável abaixo (usando os valores do arquivo JSON):

| Nome da variável | Onde encontrar no JSON |
|---|---|
| `GOOGLE_PROJECT_ID` | campo `project_id` |
| `GOOGLE_PRIVATE_KEY_ID` | campo `private_key_id` |
| `GOOGLE_PRIVATE_KEY` | campo `private_key` (cole o valor inteiro com as quebras `\n`) |
| `GOOGLE_CLIENT_EMAIL` | campo `client_email` |
| `GOOGLE_CLIENT_ID` | campo `client_id` |
| `GOOGLE_DRIVE_PASTA_CONTAS_2026_ID` | o ID que você copiou no Passo 6 |

> ⚠️ Para o `GOOGLE_PRIVATE_KEY`: cole o valor **exatamente como está** no JSON, incluindo `-----BEGIN RSA PRIVATE KEY-----` e `-----END RSA PRIVATE KEY-----`. A Vercel preserva as quebras de linha automaticamente.

4. Após adicionar todas as variáveis, vá em **"Deployments"** e clique em **"Redeploy"**

---

## PASSO 8 — Testar

1. Acesse o site Fischer Finanças
2. Vá em **Cartões de Crédito** ou **Contas Fixas**
3. Passe o mouse sobre qualquer cartão ou conta — aparecerá o botão **☁️**
4. Clique no botão ☁️
5. Arraste ou selecione um comprovante (PDF, JPG, PNG)
6. Clique em **"Enviar para Drive"**
7. O arquivo será salvo em: `Contas 2026 / [Mês] / Pagas / [nome_automático]`

---

## Como verificar os comprovantes

**No site:** clique no painel **"Comprovantes"** na barra lateral esquerda. Ele lista todos os arquivos da pasta `Pagas` do mês selecionado e abre direto no Drive ao clicar.

**No Google Drive:** acesse `Contas 2026 > [Mês] > Pagas` e verá os arquivos com nomes no formato:
```
2026-03-20_Nubank_R$957.pdf
2026-03-15_Energia_Eletrica_R$354.jpg
```

---

## Problemas comuns

**"Drive não configurado"** → Verifique se todas as 6 variáveis foram adicionadas na Vercel e se fez o Redeploy.

**"Erro de permissão"** → A pasta não foi compartilhada com o email da service account (Passo 5).

**"Pasta não encontrada"** → O ID da pasta `GOOGLE_DRIVE_PASTA_CONTAS_2026_ID` está incorreto.

**Arquivo não aparece na sidebar** → Clique no botão ↻ no painel de Comprovantes para atualizar.

---

*Fischer Finanças 2026 — Tutorial Google Drive*
