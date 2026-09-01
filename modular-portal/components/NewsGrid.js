class NewsGridComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.newsGrid;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: #f4f4f4;
          padding-bottom: 80px;
          overflow-x: hidden;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 40px;
        }
        
        .header-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 40px;
        }
        
        .bar {
          width: 12px;
          height: 36px;
          background-color: #003c73;
          border-radius: 6px;
        }
        
        h2 {
          font-size: 28px;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
          font-style: italic;
          color: #003c73;
          letter-spacing: -1px;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .card {
          background-color: white;
          border: 1px solid #eee;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }
        
        .card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .card-image {
          aspect-ratio: 16/9;
          overflow: hidden;
          background-color: #fff;
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .card-content {
          padding: 24px;
          flex: 1;
        }
        
        .category {
          font-size: 9px;
          font-weight: 800;
          color: #4bb9ff;
          margin-bottom: 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: block;
        }
        
        .card h3 {
          font-size: 15px;
          line-height: 1.3;
          margin: 0;
          font-weight: 700;
          color: #111;
          font-family: 'Inter', sans-serif;
        }
        
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        
        .sidebar-box {
          background-color: white;
          border: 1px solid #eee;
          padding: 30px;
          border-radius: 2px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-box h3 {
          font-weight: 900;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #003c73;
        }
        
        .sidebar-box h3::before {
          content: '';
          width: 8px;
          height: 24px;
          background-color: #003c73;
          border-radius: 4px 0 0 4px;
        }
        
        .trend-item {
          display: flex;
          gap: 12px;
          margin-bottom: 25px;
          text-decoration: none;
          color: inherit;
          align-items: flex-start;
        }
        
        .trend-image {
          position: relative;
          width: 80px;
          height: 45px;
          shrink-0;
          overflow: hidden;
          background-color: #eee;
          border-radius: 2px;
        }
        
        .trend-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .trend-number {
          position: absolute;
          top: 0;
          left: 5px;
          font-size: 24px;
          font-weight: 900;
          color: #cc0000;
          font-style: italic;
          text-shadow: 0 2px 4px rgba(255,255,255,0.8);
          line-height: 1;
        }
        
        .trend-item h4 {
          font-size: 13px;
          margin: 0;
          font-weight: 700;
          line-height: 1.25;
          flex: 1;
        }
        
        .trend-item:hover h4 {
          color: #4bb9ff;
        }
        
        .btn-container {
          margin-top: 80px;
          display: flex;
          justify-content: center;
        }
        
        .btn {
          padding: 20px 60px;
          background-color: #003c73;
          color: white;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          border-bottom: 4px solid #4bb9ff;
          box-shadow: 0 20px 40px rgba(0,60,115,0.2);
        }
        
        .btn:hover {
          background-color: #4bb9ff;
          color: #003c73;
          transform: translateY(-4px);
        }
        
        @media (max-width: 1200px) {
          .container { grid-template-columns: 1fr; gap: 60px; }
        }
        
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
        }
      </style>
      
      <div class="container">
        <div class="main-column">
          <div class="header-section">
            <div class="bar"></div>
            <h2>Últimas Noticias</h2>
          </div>
          
          <div class="grid">
            ${data.articles.map((article) => `
              <a href="/article/noticia" class="card">
                <div class="card-image">
                  <img src="${article.image}" alt="">
                </div>
                <div class="card-content">
                  <span class="category">${article.category}</span>
                  <h3>${article.title}</h3>
                </div>
              </a>
            `).join('')}
          </div>
          
          <div class="btn-container">
            <button class="btn">CARGAR MÁS NOTICIAS</button>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="sidebar-box">
            <h3>LAS MÁS LEÍDAS</h3>
            ${data.mostRead.map((item, index) => `
              <a href="#" class="trend-item">
                <div class="trend-image">
                  <img src="https://images.unsplash.com/photo-1585829365234-7921798367c2?q=80&w=200" alt="">
                  <div class="trend-number">${index + 1}</div>
                </div>
                <h4>${item.title}</h4>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('news-grid-component', NewsGridComponent);
