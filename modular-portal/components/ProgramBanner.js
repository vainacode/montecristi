class ProgramBannerComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.programBanner;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #e87722 0%, #a84c0a 100%);
          color: white;
          padding: 60px 0;
          overflow: hidden;
          position: relative;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        
        .main-img {
          width: 300px;
          height: 400px;
          background-image: url('https://deultimominuto.net/wp-content/uploads/2024/03/Presenter.png');
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
          border-radius: 4px;
          box-shadow: 20px 20px 40px rgba(0,0,0,0.3);
        }
        
        .program-info {
          flex-grow: 1;
        }
        
        h2 {
          font-size: 38px;
          font-weight: 900;
          italic: true;
          margin: 0;
          text-transform: uppercase;
        }
        
        .description {
          font-size: 16px;
          max-width: 500px;
          margin: 20px 0 40px;
          opacity: 0.9;
        }
        
        .episodes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .episode-card {
          cursor: pointer;
        }
        
        .episode-card:hover h4 {
          text-decoration: underline;
        }
        
        .episode-card img {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .episode-card h4 {
          font-size: 12px;
          margin: 0;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        @media (max-width: 1024px) {
          .container { flex-direction: column; text-align: center; }
          .main-img { display: none; }
          .episodes { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
      
      <div class="container">
        <div class="main-img"></div>
        <div class="program-info">
          <h2>${data.programName}</h2>
          <p class="description">${data.description}</p>
          
          <div class="episodes">
            ${data.episodes.map(episode => `
              <div class="episode-card">
                <img src="${episode.image}" alt="${episode.title}">
                <h4>${episode.title}</h4>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('program-banner-component', ProgramBannerComponent);
