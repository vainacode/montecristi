class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.navbar;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: #003c73;
          color: white;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }
        
        .logo {
          height: 40px;
          width: auto;
        }
        
        nav ul {
          display: flex;
          gap: 25px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        nav a {
          text-decoration: none;
          color: white;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        
        nav a:hover {
          color: #4bb9ff;
        }
        
        .actions {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .live-btn {
          background-color: #cc0000;
          color: white;
          padding: 10px 20px;
          font-weight: 900;
          font-size: 10px;
          text-transform: uppercase;
          border-radius: 4px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
      </style>
      
      <div class="container">
        <img src="${data.logo}" alt="Morro Informativo" class="logo">
        
        <nav>
          <ul>
            ${data.menuItems.map(item => `
              <li><a href="${item.url}">${item.name}</a></li>
            `).join('')}
          </ul>
        </nav>
        
        <div class="actions">
          <a href="${data.liveUrl}" class="live-btn">
            <div class="dot"></div>
            En Vivo
          </a>
        </div>
      </div>
    `;
  }
}

customElements.define('navbar-component', NavbarComponent);
