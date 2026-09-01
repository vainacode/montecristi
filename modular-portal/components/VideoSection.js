class VideoSectionComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const data = window.MORRO_DATA.videoSection;
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
          padding: 60px 0;
          position: relative;
        }
        
        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          padding: 0 20px;
        }
        
        .video-player {
          width: 100%;
          aspect-ratio: 16/9;
          background-color: black;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        
        .video-player iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .tabs {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .tab {
          padding: 15px 20px;
          background-color: rgba(255,255,255,0.05);
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .tab:hover {
          background-color: rgba(255,255,255,0.1);
        }
        
        .tab.active {
          border-left-color: var(--color-red);
          background-color: rgba(255,255,255,0.15);
        }
        
        .section-header {
          margin-bottom: 30px;
        }
        
        .section-header h2 {
          font-size: 28px;
          color: white;
          text-transform: uppercase;
          font-style: italic;
          font-weight: 900;
        }
        
        .section-header .line {
          width: 60px;
          height: 4px;
          background-color: var(--color-red);
          margin-top: 10px;
        }
        
        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <div class="container">
        <div class="main-video">
          <div class="section-header">
            <h2>MORRO<span>TV</span> EN DIRECTO</h2>
            <div class="line"></div>
          </div>
          <div class="video-player">
            <iframe src="${data.videoUrl}" allowfullscreen></iframe>
          </div>
        </div>
        
        <div class="tabs-container">
          <div class="section-header">
            <h2>NOTICIAS RECIENTES</h2>
            <div class="line"></div>
          </div>
          <div class="tabs">
            ${data.tabs.map((tab, i) => `
              <div class="tab ${i === 0 ? 'active' : ''}">${tab}</div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('video-section-component', VideoSectionComponent);
