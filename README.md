# Lista de presentes — Amanda & Leonardo

Site estático da lista de casamento, com convite, catálogo de presentes,
reservas transacionais no Firebase e pagamento por Pix.

## Páginas

- `/` — lista pública de presentes
- `/convite` — convite do casamento
- `/admin` — painel privado, protegido pelo Firebase Authentication

## Desenvolvimento local

Sirva a pasta com um servidor HTTP estático. Por exemplo:

```powershell
npx.cmd serve .
```

A configuração do Firebase e os dados públicos de Pix ficam em
`firebase-config.js`. A autorização efetiva do painel e das gravações deve ser
mantida também nas regras do Firebase; o UID presente no cliente não substitui
essas regras.

## Publicação

O projeto possui `vercel.json` com URLs limpas e cabeçalhos básicos de
segurança. Para publicar em produção:

```powershell
npx.cmd vercel --prod
```
