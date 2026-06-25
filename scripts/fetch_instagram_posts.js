// Script Node para buscar publicações do Instagram Basic Display API
// Requisitos:
// - Ter um Access Token válido do Instagram Basic Display
// - Ter o User ID do Instagram (pode obter via a API)
// - Executar: `node scripts/fetch_instagram_posts.js <USER_ID> <ACCESS_TOKEN>`
// O script salva `insta.json` com um array de objetos { media_url, caption, timestamp }

const fs = require('fs');
const fetch = require('node-fetch');

if (process.argv.length < 4) {
  console.error('Uso: node fetch_instagram_posts.js <USER_ID> <ACCESS_TOKEN>');
  process.exit(1);
}

const USER_ID = process.argv[2];
const ACCESS_TOKEN = process.argv[3];
const OUT = 'insta.json';

async function fetchMedia() {
  try {
    // Pega lista de media IDs
    const fields = 'id,caption,media_type,media_url,timestamp,permalink';
    const url = `https://graph.instagram.com/${USER_ID}/media?fields=${fields}&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = data.data || [];
    // Escreve direto no arquivo
    fs.writeFileSync(OUT, JSON.stringify(items, null, 2), 'utf8');
    console.log(`Salvo ${items.length} itens em ${OUT}`);
  } catch (err) {
    console.error('Erro ao buscar mídias:', err.message || err);
    process.exit(1);
  }
}

fetchMedia();
