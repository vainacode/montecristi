class NewsTickerComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.headlines;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: white;
          color: #111;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          border-bottom: 1px solid #eee;
          height: 48px;
        }
        
        .ticker-container {
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .label {
          padding: 0 24px;
          background-color: #cc0000;
          color: white;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 10;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .marquee-wrapper {
          flex-grow: 1;
          overflow: hidden;
          position: relative;
        }
        
        .marquee {
          display: flex;
          white-space: nowrap;
          animation: slide 25s linear infinite;
        }
        
        .marquee:hover {
          animation-play-state: paused;
        }
        
        .item {
          display: flex;
          align-items: center;
          padding: 0 40px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #111;
          text-decoration: none;
          height: 48px;
          border-right: 1px solid #f5f5f5;
        }
        
        .item:hover {
          color: #cc0000;
        }
        
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      </style>
      
      <div class="ticker-container">
        <div class="label">
          <div class="dot"></div>
          Último Minuto
        </div>
        <div class="marquee-wrapper">
          <div class="marquee">
            ${data.concat(data).map(text => `
              <a href="#" class="item">${text}</a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('news-ticker-component', NewsTickerComponent);
