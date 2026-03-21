# 📁 Integração Google Drive — Comprovantes

## Visão Geral

Este tutorial configura a **Service Account** do Google Cloud para que o sistema Fischer Finanças faça upload de comprovantes diretamente na estrutura:

```
Meu Drive > Contas Familia Fischer > Contas 2026 > [Mês] > Pagas
```

**Tempo estimado:** 15 minutos — configura uma vez, funciona para sempre.

---

## PASSO 1 — Criar projeto no Google Cloud

1. Acesse **https://console.cloud.google.com**
2. Faça login com a conta Google que tem acesso ao Drive da Família Fischer
3. Clique em **"Selecionar projeto"** → **"Novo projeto"**
4. Nome: `fischer-financas` → Clique em **"Criar"**

---

## PASSO 2 — Ativar a Google Drive API

1. Menu lateral → **"APIs e serviços" → "Biblioteca"**
2. Pesquise `Google Drive API`
3. Clique em **"Ativar"**

---

## PASSO 3 — Criar a Service Account

1. Menu lateral → **"APIs e serviços" → "Credenciais"**
2. Clique em **"+ Criar credenciais"** → **"Conta de serviço"**
3. Nome: `fischer-drive` → Clique em **"Criar e continuar"** → **"Concluído"**

---

## PASSO 4 — Gerar a chave JSON

1. Na lista de credenciais, clique na service account `fischer-drive@...`
2. Aba **"Chaves"** → **"Adicionar chave"** → **"Criar nova chave"** → **JSON**
3. O arquivo JSON será baixado — **guarde com segurança!**

O arquivo tem este formato:
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

> ⚠️ O `GOOGLE_PRIVATE_KEY` é o campo `private_key` completo (texto longo).  
> O `GOOGLE_PRIVATE_KEY_ID` é o campo `private_key_id` (hash curto).  
> **Não confunda os dois!**

---

## PASSO 5 — Compartilhar a pasta do Drive

1. Abra o **Google Drive** → navegue até **Contas 2026**
2. Clique com botão direito → **"Compartilhar"**
3. Cole o `client_email` do JSON (ex: `fischer-drive@...iam.gserviceaccount.com`)
4. Permissão: **Editor** | Desmarque "Notificar pessoas"
5. Clique em **"Compartilhar"**

---

## PASSO 6 — Pegar o ID da pasta "Contas 2026"

Abra a pasta no Drive e copie o ID da URL:
```
https://drive.google.com/drive/folders/COPIE_ESTE_ID_AQUI
```

---

## PASSO 7 — Adicionar variáveis na Vercel

Em **vercel.com → projeto → Settings → Environment Variables**, adicione:

| Variável | Valor (do arquivo JSON) |
|---|---|
| `GOOGLE_PROJECT_ID` | campo `project_id` |
| `GOOGLE_PRIVATE_KEY_ID` | campo `private_key_id` |
| `GOOGLE_PRIVATE_KEY` | campo `private_key` (texto longo completo) |
| `GOOGLE_CLIENT_EMAIL` | campo `client_email` |
| `GOOGLE_CLIENT_ID` | campo `client_id` |
| `GOOGLE_DRIVE_PASTA_CONTAS_2026_ID` | ID copiado no Passo 6 |

Após adicionar: **Deployments → Redeploy**.

---

## Como usar

- Em **Cartões de Crédito** ou **Contas Fixas**, passe o mouse sobre qualquer item → aparece o botão **☁️**
- Clique → arraste ou selecione o comprovante (PDF, JPG, PNG — máx. 10MB)
- O arquivo é salvo automaticamente em `Contas 2026 / [Mês] / Pagas` com nome:
  ```
  2026-03-20_Nubank_R$957.pdf
  ```
- Na sidebar, clique em **"Comprovantes"** para ver e abrir todos os arquivos do mês

---

## Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| "Drive não configurado" | Variáveis faltando/erradas na Vercel | Confira todas as 6 variáveis |
| "Erro de permissão" | Pasta não compartilhada | Refaça o Passo 5 |
| "Pasta não encontrada" | ID errado | Copie o ID direto da URL do Drive |
| Arquivo não aparece | Cache desatualizado | Clique em ↻ no painel |
