const FEATURED_PHOTOS = [
    { image_url: 'fotos/IMG_3420.JPG', alt: 'Macaco', post_url: 'https://www.instagram.com/nature_shooter1/' },
    { image_url: 'fotos/IMG_3447.JPG', alt: 'Girafa', post_url: 'https://www.instagram.com/nature_shooter1/' },
    { image_url: 'fotos/IMG_3460.JPG', alt: 'Natureza', post_url: 'https://www.instagram.com/nature_shooter1/' },
];

let galleryPhotos = [];
let lightboxPhotos = [];
let lightboxIndex = 0;

function decodeHtmlEntities(str) {
    if (!str) return str;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
}

function normalizePhoto(item, index) {
    const imageUrl = decodeHtmlEntities(item.image_url || item.media_url);
    const postUrl = item.post_url || item.permalink || item.media_url || '';
    const caption = item.caption || '';
    const alt = caption.slice(0, 120) || `Foto ${index + 1} — NatureShooter`;
    return { image_url: imageUrl, post_url: postUrl, alt, caption };
}

function scrollToElement(target) {
    if (!target) return;
    const gallery = document.querySelector('.galeria');
    if (gallery && gallery.contains(target)) {
        gallery.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToGallery() {
    const instrucao = document.getElementById('texto-instrucao');
    if (instrucao) instrucao.style.opacity = '0';

    const gallery = document.querySelector('.galeria');
    const target = document.getElementById('photos-slide');
    if (gallery && target) {
        gallery.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    } else {
        scrollToElement(target || document.body);
    }
}

function setupSidebarMenu() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = sidebar?.querySelector('.menu-toggle');
    const sidebarMenu = sidebar?.querySelector('.sidebar-menu');
    const menuLinks = sidebarMenu ? Array.from(sidebarMenu.querySelectorAll('a')) : [];

    if (!menuToggle || !sidebarMenu) return;

    function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !sidebar.classList.contains('sidebar-open');
        sidebar.classList.toggle('sidebar-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        sidebarMenu.setAttribute('aria-hidden', String(!isOpen));
    }

    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && sidebar.classList.contains('sidebar-open')) {
            toggleMenu(false);
        }
    });

    menuLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                toggleMenu(false);
                scrollToElement(target);
            }
        });
    });
}

function setupReverseScroll() {
    const gallery = document.querySelector('.galeria');
    const headerSlide = document.querySelector('.cabecalho');
    const photosSlide = document.getElementById('photos-slide');
    let isScrolling = false;

    if (!gallery || !headerSlide || !photosSlide) return;

    function performSlideScroll(target) {
        if (isScrolling || !target) return;
        isScrolling = true;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => { isScrolling = false; }, 700);
    }

    gallery.addEventListener('wheel', (event) => {
        const atTop = gallery.scrollTop <= 0;
        const atBottom = Math.ceil(gallery.scrollTop + gallery.clientHeight) >= gallery.scrollHeight - 1;

        if (event.deltaY > 0 && atTop) {
            event.preventDefault();
            performSlideScroll(photosSlide);
        } else if (event.deltaY < 0 && atBottom) {
            event.preventDefault();
            performSlideScroll(headerSlide);
        }
    }, { passive: false });
}

function renderGallery(photos) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';

    photos.forEach((photo, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'photo-card';
        card.setAttribute('aria-label', `Ver foto: ${photo.alt}`);

        const img = document.createElement('img');
        img.src = photo.image_url;
        img.alt = photo.alt;
        img.loading = 'lazy';

        card.appendChild(img);
        card.addEventListener('click', () => openLightbox(galleryPhotos, index));
        grid.appendChild(card);
    });
}

function setupFeaturedButtons() {
    const buttons = document.querySelectorAll('.photo-button');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openLightbox(FEATURED_PHOTOS, index));
    });
}

async function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    try {
        const response = await fetch('insta.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Array vazio');
        galleryPhotos = data.map(normalizePhoto);
    } catch {
        galleryPhotos = [];
        grid.innerHTML = '';
        return;
    }

    renderGallery(galleryPhotos);
}

function openLightbox(photos, index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !photos.length) return;

    lightboxPhotos = photos;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('lightbox-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('lightbox-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-active');
}

function updateLightbox() {
    const photo = lightboxPhotos[lightboxIndex];
    if (!photo) return;

    const img = document.getElementById('lightbox-img');
    const link = document.getElementById('lightbox-instagram');
    const caption = document.getElementById('lightbox-caption');

    if (img) {
        img.src = photo.image_url;
        img.alt = photo.alt;
    }
    if (link) {
        link.href = photo.post_url || 'https://www.instagram.com/nature_shooter1/';
    }
    if (caption) {
        caption.textContent = photo.caption || '';
        caption.hidden = !photo.caption;
    }
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => {
        lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
        updateLightbox();
    });
    lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => {
        lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
        updateLightbox();
    });

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (!lightbox.classList.contains('lightbox-open')) return;

        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') {
            lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
            updateLightbox();
        }
        if (event.key === 'ArrowRight') {
            lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
            updateLightbox();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !document.body.classList.contains('lightbox-active')) {
        event.preventDefault();
        scrollToGallery();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const gallery = document.querySelector('.galeria');
    if (gallery) gallery.scrollTop = 0;

    setupSidebarMenu();
    setupReverseScroll();
    setupFeaturedButtons();
    setupLightbox();
    loadGallery();
});
