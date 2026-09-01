class FooterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.footer;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: white;
          border-top: 1px solid var(--color-gray-light);
          padding: 60px 0 30px;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .footer-top {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .footer-col h4 {
          font-family: var(--font-headline);
          font-size: 16px;
          text-transform: uppercase;
          font-weight: 900;
          margin-bottom: 15px;
        }
        
        .footer-col ul {
          list-style: none;
          padding: 0;
        }
        
        .footer-col li {
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
          cursor: pointer;
        }
        
        .footer-col li:hover {
          color: var(--color-red);
        }
        
        .footer-bottom {
          border-top: 1px solid var(--color-gray-light);
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #999;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .logo-small {
          font-weight: 900;
          font-style: italic;
          color: var(--color-navy);
        }
        
        .logo-small span {
          color: var(--color-red);
        }
        
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: repeat(2, 1fr); }
          .footer-bottom { flex-direction: column; gap: 20px; text-align: center; }
        }
      </style>
      
      <div class="container">
        <div class="footer-top">
          <div class="footer-col">
            <h4>Secciones</h4>
            <ul>
              <li>Montecristi</li>
              <li>República</li>
              <li>Mundiales</li>
              <li>Deportes</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Información</h4>
            <ul>
              ${data.articles.map(article => `
                <li>${article.title}</li>
              `).join('')}
            </ul>
          </div>
          <div class="footer-col">
            <h4>Suscríbete</h4>
            <li style="list-style:none">Recibe lo último del Morro en tu email.</li>
          </div>
          <div class="footer-col">
            <h4>Síguenos</h4>
            <li style="list-style:none">Instagram</li>
            <li style="list-style:none">Twitter (X)</li>
            <li style="list-style:none">YouTube</li>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="copyright">${data.copyright}</div>
          <div class="logo-small">MORRO<span>INFORMATIVO</span></div>
          <div class="dev">Desarrollado por Morro Digital</div>
        </div>
      </div>
    `;
  }
}

customElements.define('footer-component', FooterComponent);
