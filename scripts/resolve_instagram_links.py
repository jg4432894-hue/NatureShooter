import json
import re
import urllib.parse
import sys

try:
    import requests
except ImportError:
    print('Falta o pacote requests. Instale com: python -m pip install requests')
    sys.exit(1)

INPUT_FILE = 'insta.json'
OUTPUT_FILE = 'insta.json'

INSTAGRAM_POST_RE = re.compile(r'https?://(www\.)?instagram\.com/(?:p/|[^/]+/p/)[^/]+/?', re.IGNORECASE)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://www.instagram.com/',
    'Accept-Language': 'en-US,en;q=0.9',
}


def resolve_instagram_image(url):
    url = url.split('?')[0]
    oembed = f'https://api.instagram.com/oembed?url={urllib.parse.quote_plus(url)}'
    try:
        resp = requests.get(oembed, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        if 'thumbnail_url' in data:
            return data['thumbnail_url']
        if 'media_url' in data:
            return data['media_url']
    except Exception as exc:
        print(f'  oEmbed falhou para {url}: {exc}')

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        html = resp.text
        match = re.search(r'<meta property="og:image" content="([^"]+)"', html, re.IGNORECASE)
        if match:
            return match.group(1)
    except Exception as exc:
        print(f'  HTML fetch falhou para {url}: {exc}')

    return None


def main():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as exc:
        print('Erro ao ler', INPUT_FILE, exc)
        sys.exit(1)

    if not isinstance(data, list):
        print('Formato inválido: insta.json deve ser um array de objetos ou URLs.')
        sys.exit(1)

    changed = False
    for idx, item in enumerate(data):
        if isinstance(item, str):
            item = {'media_url': item}
            data[idx] = item

        media_url = item.get('media_url') or item.get('url')
        if not media_url:
            print(f'[{idx}] sem media_url ou url, pulando')
            continue

        if item.get('image_url'):
            print(f'[{idx}] já resolvido: {item["image_url"]}')
            continue

        if INSTAGRAM_POST_RE.match(media_url):
            print(f'[{idx}] resolvendo {media_url}')
            image = resolve_instagram_image(media_url)
            if image:
                item['image_url'] = image
                item['post_url'] = media_url
                print(f'    -> {image}')
                changed = True
            else:
                print('    ! não foi possível resolver imagem')
        else:
            print(f'[{idx}] não é post Instagram, mantendo valor: {media_url}')

    if changed:
        try:
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f'Arquivo atualizado: {OUTPUT_FILE}')
        except Exception as exc:
            print('Erro ao salvar', OUTPUT_FILE, exc)
            sys.exit(1)
    else:
        print('Nenhuma alteração feita.')


if __name__ == '__main__':
    main()
