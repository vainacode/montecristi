class NewsletterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.newsletter;
    this.render(data);
  }

  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background-color: var(--color-navy);
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 20px;
        }
        
        h2 {
          font-size: 32px;
          margin-bottom: 30px;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          letter-spacing: -1px;
        }
        
        .form {
          display: flex;
          max-width: 600px;
          margin: 0 auto;
          gap: 10px;
        }
        
        input {
          flex-grow: 1;
          padding: 15px 25px;
          border: none;
          background-color: rgba(255,255,255,0.1);
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        input:focus {
          outline: 2px solid var(--color-orange);
          background-color: rgba(255,255,255,0.15);
        }
        
        button {
          background-color: var(--color-orange);
          color: white;
          border: none;
          padding: 0 40px;
          font-weight: 900;
          cursor: pointer;
          transition: background 0.3s;
          text-transform: uppercase;
          font-size: 14px;
        }
        
        button:hover {
          background-color: #f38b3c;
        }
        
        @media (max-width: 600px) {
          .form { flex-direction: column; }
          button { padding: 15px; }
        }
      </style>
      
      <div class="container">
        <h2>${data.title}</h2>
        <div class="form">
          <input type="email" placeholder="${data.placeholder}">
          <button>SUSCRIBIR</button>
        </div>
      </div>
    `;
  }
}

customElements.define('newsletter-component', NewsletterComponent);
