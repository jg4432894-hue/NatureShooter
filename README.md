# NatureShooter

Portfólio estático de fotografia de animais e natureza por Miguel Figueiredo.

Site publicado em: https://jg4432894-hue.github.io/NatureShooter/

## Estrutura

```
├── index.html          # Página principal
├── style.css           # Estilos
├── main.js             # Galeria, lightbox e navegação
├── insta.json          # Posts do Instagram (gerado pelos scripts)
├── fotos/              # Imagens locais (perfil, fundo, fallback)
└── scripts/
    ├── fetch_instagram_posts.js   # Busca posts via Instagram API
    └── resolve_instagram_links.py # Resolve URLs em imagens diretas
```

## Executar localmente

O site precisa de um servidor HTTP local (o `fetch` do `insta.json` não funciona com `file://`):

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Abra http://localhost:8080 no browser. No VS Code, use a configuração de launch incluída (Chrome contra localhost:8080).

## Galeria

A secção **Fotos** carrega automaticamente o ficheiro `insta.json`. Se o ficheiro não existir ou falhar, usa imagens de fallback em `fotos/`.

Cada foto abre num lightbox com navegação por setas do teclado (← →) e link para o post no Instagram.

## Atualizar posts do Instagram

### Opção 1 — Instagram Basic Display API

```bash
npm install node-fetch   # dependência do script
node scripts/fetch_instagram_posts.js <USER_ID> <ACCESS_TOKEN>
python scripts/resolve_instagram_links.py
```

### Opção 2 — URLs manuais

Edite `insta.json` com URLs de posts do Instagram e execute:

```bash
python scripts/resolve_instagram_links.py
```

## Pasta fotos/

Coloque aqui as imagens locais usadas pelo site:

| Ficheiro | Uso |
|----------|-----|
| `pfp.jpg` | Foto de perfil no cabeçalho |
| `d90d2b4d-739e-4e83-9ef0-656e6b3c6dd5.jpg` | Imagem de fundo |
| `IMG_3420.JPG`, `IMG_3447.JPG`, `IMG_3460.JPG` | Fallback da galeria |

Para ficheiros grandes, considere [Git LFS](https://git-lfs.github.com/).

## Deploy (GitHub Pages)

1. Faça push do repositório para o GitHub
2. Em **Settings → Pages**, selecione o branch `main` e pasta `/ (root)`
3. Confirme que `fotos/` e `insta.json` estão incluídos no repositório
