let cardContainer = document.querySelector(".card-container");
let dados = [];

// Modal elements (created once)
let modalOverlay;
let modalImage;
let modalDetails;
let modalLink;

async function iniciarBusca() {
    const resposta = await fetch("data.json");
    dados = await resposta.json();

    const queryInput = document.getElementById('search-input');
    const query = queryInput ? queryInput.value.trim().toLowerCase() : '';

    // Indica se a busca está ativa para alterar o layout dos cards
    window.__searchActive = !!query;

    let resultados = dados;
    if (query) {
        resultados = dados.filter(item => {
            return (item.nome || '').toLowerCase().includes(query) ||
                (item['técnica'] || '').toLowerCase().includes(query) ||
                (item.ano || '').toString().toLowerCase().includes(query) ||
                (item.categoria || '').toLowerCase().includes(query);
        });
    }

    // Ordena os dados pelo ano, do mais recente para o mais antigo
    const dadosOrdenados = resultados.sort((a, b) => (b.ano || '').toString().localeCompare((a.ano || '').toString()));
    // marque o container para poucas results (1-2) para ajustar layout via CSS
    if (cardContainer) {
        if (dadosOrdenados.length > 0 && dadosOrdenados.length <= 2) {
            cardContainer.classList.add('few-results');
        } else {
            cardContainer.classList.remove('few-results');
        }
    }
    renderizarCards(dadosOrdenados);
}

function createDrawer() {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'drawer-overlay';

    const drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.style.maxWidth = '1000px';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'drawer-image';
    modalImage = document.createElement('img');
    modalImage.alt = '';
    imageWrap.appendChild(modalImage);

    modalDetails = document.createElement('div');
    modalDetails.className = 'drawer-details';

    modalLink = document.createElement('a');
    modalLink.target = '_blank';
    modalLink.className = 'drawer-link';
    modalLink.textContent = 'Ver publicação';

    modalDetails.appendChild(modalLink);

    // Close button (top-right)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'drawer-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeDrawer);
    drawer.appendChild(closeBtn);

    drawer.appendChild(imageWrap);
    drawer.appendChild(modalDetails);
    modalOverlay.appendChild(drawer);
    document.body.appendChild(modalOverlay);

    // Close handlers: click outside drawer and ESC
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeDrawer();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });
}

function openDrawer(item) {
    if (!modalOverlay) createDrawer();
    modalImage.src = item.imagem || '';
    modalImage.alt = item.nome || 'Obra';

    // Build details
    modalDetails.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = item.nome || '';
    title.style.color = 'var(--primary-color)';
    modalDetails.appendChild(title);

    if (item['técnica']) {
        const p = document.createElement('p');
        p.innerHTML = '<strong>Técnica:</strong> ' + item['técnica'];
        modalDetails.appendChild(p);
    }
    if (item.ano) {
        const p = document.createElement('p');
        p.innerHTML = '<strong>Ano da obra:</strong> ' + item.ano;
        modalDetails.appendChild(p);
    }
    if (item.tamanho) {
        const p = document.createElement('p');
        p.innerHTML = '<strong>Tamanho:</strong> ' + item.tamanho;
        modalDetails.appendChild(p);
    }
    if (item.categoria) {
        const p = document.createElement('p');
        p.innerHTML = '<strong>Categoria:</strong> ' + item.categoria;
        modalDetails.appendChild(p);
    }

    if (item.link) {
        modalLink.href = item.link;
        // ensure the link node is present in the details container
        if (!modalLink.isConnected) modalDetails.appendChild(modalLink);
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
        if (modalLink.isConnected) modalLink.remove();
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function renderizarCards(items) {
    cardContainer.innerHTML = '';

    if (!items || items.length === 0) {
        cardContainer.innerHTML = '<p class="no-results">Nenhuma obra encontrada.</p>';
        return;
    }

    items.forEach(item => {
        const article = document.createElement('article');
        article.className = 'card';

        if (window.__searchActive) article.classList.add('expanded');

        if (item.imagem) {
            const img = document.createElement('img');
            img.src = item.imagem;
            img.alt = item.nome || 'Obra';
            img.loading = 'lazy';
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => openDrawer(item));
            // Se busca ativa, não cortar a imagem
            if (window.__searchActive) {
                img.style.objectFit = 'contain';
                img.style.height = 'auto';
                img.style.maxHeight = '420px';
            } else {
                img.style.objectFit = '';
                img.style.height = '';
            }
            article.appendChild(img);
        }

        const h2 = document.createElement('h2');
        h2.textContent = item.nome || '';
        article.appendChild(h2);

        // Se a busca está ativa, mostrar também os detalhes abaixo da imagem
        if (window.__searchActive) {
            if (item['técnica']) {
                const p = document.createElement('p');
                p.innerHTML = '<strong>Técnica:</strong> ' + item['técnica'];
                article.appendChild(p);
            }
            if (item.ano) {
                const p = document.createElement('p');
                p.innerHTML = '<strong>Ano da obra:</strong> ' + item.ano;
                article.appendChild(p);
            }
            if (item.tamanho) {
                const p = document.createElement('p');
                p.innerHTML = '<strong>Tamanho:</strong> ' + item.tamanho;
                article.appendChild(p);
            }
            if (item.categoria) {
                const p = document.createElement('p');
                p.innerHTML = '<strong>Categoria:</strong> ' + item.categoria;
                article.appendChild(p);
            }
            if (item.link) {
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                a.textContent = 'Ver publicação';
                article.appendChild(a);
            }
        }

        cardContainer.appendChild(article);
    });
}

// Inicializa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('botao-busca');
    const input = document.getElementById('search-input');
    if (btn) btn.addEventListener('click', iniciarBusca);
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') iniciarBusca(); });
    iniciarBusca();
});
