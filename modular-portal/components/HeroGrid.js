class HeroGridComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.hero;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: #f4f4f4;
          padding: 40px 0;
        }
        
        a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 3.5fr 1fr;
          gap: 24px;
          padding: 0 20px;
        }
        
        .articles-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .card {
          background-color: white;
          border: 1px solid #eee;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .main-card {
          flex-direction: row;
        }
        
        .card-image {
          position: relative;
          background-color: #fff;
          overflow: hidden;
        }
        
        .main-card .card-image {
          flex: 1;
          min-height: 350px;
        }
        
        .row-2 .card-image {
          aspect-ratio: 16/9;
        }
        
        .row-3 .card-image {
          aspect-ratio: 4/3;
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .card:hover .card-image img {
          transform: scale(1.05);
        }
        
        .card-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: white;
        }
        
        .main-card .card-content {
          padding: 40px;
          flex: 1;
        }
        
        .category {
          font-size: 10px;
          font-weight: 800;
          color: #cc0000;
          margin-bottom: 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        
        .card h3 {
          font-size: 18px;
          line-height: 1.25;
          margin: 0;
          font-weight: 700;
          color: #111;
          font-family: 'Inter', sans-serif;
        }
        
        .main-card h3 {
          font-size: 28px;
          line-height: 1.1;
        }
        
        .row-3 h3 {
          font-size: 16px;
        }
        
        .author {
          font-size: 10px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 20px;
        }
        
        .row-2, .row-3 {
          display: grid;
          gap: 24px;
        }
        
        .row-2 { grid-template-columns: 1fr 1fr; }
        .row-3 { grid-template-columns: 1fr 1fr 1fr; }
        
        .widgets-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .social-box {
          background-color: black;
          color: white;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 320px;
        }
        
        .social-box p {
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
          margin: 0;
        }
        
        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 30px;
        }
        
        .btn {
          padding: 12px;
          text-align: center;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }
        
        .ad-placeholder {
          background-color: white;
          border: 1px solid #eee;
          padding: 40px;
          text-align: center;
          flex: 1;
        }
        
        .ad-placeholder span {
          font-size: 10px;
          color: #ccc;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        @media (max-width: 1024px) {
          .container { grid-template-columns: 1fr; }
          .main-card { flex-direction: column; }
          .row-2, .row-3 { grid-template-columns: 1fr; }
        }
      </style>
      
      <div class="container">
        <div class="articles-col">
          <!-- Main Card -->
          <a href="/article/félix-bautista">
            <div class="card main-card">
              <div class="card-content">
                <div class="category">${data.mainArticle.source}</div>
                <h3>${data.mainArticle.title}</h3>
                <div class="author">${data.mainArticle.author}</div>
              </div>
              <div class="card-image">
                <img src="${data.mainArticle.image}" alt="">
              </div>
            </div>
          </a>
          
          <!-- Row 2 -->
          <div class="row-2">
            ${data.middleArticles.map(article => `
              <a href="/article/noticia">
                <div class="card">
                  <div class="card-image"><img src="${article.image}" alt=""></div>
                  <div class="card-content">
                    <div class="category">${article.category}</div>
                    <h3>${article.title}</h3>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
          
          <!-- Row 3 -->
          <div class="row-3">
            ${data.bottomArticles.map(article => `
              <a href="/article/noticia">
                <div class="card">
                  <div class="card-image"><img src="${article.image}" alt=""></div>
                  <div class="card-content">
                    <div class="category">${article.category}</div>
                    <h3>${article.title}</h3>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
        
        <div class="widgets-col">
          <div class="social-box">
            <p>${data.socialBox.text}</p>
            <div class="social-buttons">
              ${data.socialBox.buttons.map(btn => `
                <div class="btn" style="background: ${btn.color}; color: ${btn.textColor || 'white'}">
                  ${btn.label}
                </div>
              `).join('')}
            </div>
          </div>
          <div class="ad-placeholder">
            <span>Publicidad</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hero-grid-component', HeroGridComponent);
