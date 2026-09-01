import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página en Construcción | 404',
  description: 'Esta página se encuentra en construcción.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <style>{`
        .not-found-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background-color: hsl(0, 0%, 7.0588235294117645%);
          font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
          font-size: 0.938rem;
          font-weight: 500;
          color: hsl(0, 0%, 20%);
          padding: 2rem 1.5rem;
        }

        .home__container {
          display: grid;
          align-content: center;
          row-gap: 2.5rem;
          max-width: 1024px;
          margin: 0 auto;
          width: 100%;
        }

        .home__data {
          text-align: center;
        }

        .home__subtitle {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: #a3a3a3;
          text-transform: lowercase;
          margin-bottom: 0.25rem;
        }

        .home__title {
          font-size: 2.375rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0.75rem 0 1rem;
          line-height: 1.1;
        }

        .home__description {
          font-size: 1.15rem;
          color: #d4d4d4;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .home__button {
          margin-top: 1.5rem;
          display: inline-block;
          background-color: #8f45f7;
          color: #fff;
          padding: 0.85rem 2rem;
          border-radius: 3rem;
          transition: all 0.4s ease;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .home__button:hover {
          background-color: #7b2cf6;
          box-shadow: 0 8px 24px rgba(143, 69, 247, 0.4);
          transform: translateY(-2px);
        }

        .home__img {
          justify-self: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .home__img img {
          width: 230px;
          height: auto;
          animation: floaty 1.8s infinite alternate ease-in-out;
        }

        .home__shadow {
          width: 130px;
          height: 24px;
          background-color: hsla(38, 21%, 19%, 0.3);
          margin: 0 auto;
          border-radius: 50%;
          filter: blur(7px);
          animation: shadow 1.8s infinite alternate ease-in-out;
        }

        @keyframes floaty {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(15px);
          }
        }

        @keyframes shadow {
          0% {
            transform: scale(1, 1);
          }
          100% {
            transform: scale(0.85, 0.85);
          }
        }

        @media screen and (min-width: 1024px) {
          .home__container {
            grid-template-columns: repeat(2, 1fr);
            align-items: center;
            column-gap: 3rem;
          }
          .home__data {
            text-align: left;
          }
          .home__title {
            font-size: 4.5rem;
          }
          .home__img img {
            width: 380px;
          }
          .home__shadow {
            width: 250px;
            height: 35px;
          }
        }
      `}</style>

      <section className="home">
        <div className="home__container">
          <div className="home__data">
            <span className="home__subtitle">página en </span>
            <h1 className="home__title">Construcción</h1>
            <p className="home__description">
              Esta página se encuentra en <br /> construcción, pequeño
              cerdecillo.
            </p>
            <Link href="/" className="home__button">
              VOLVER A HOME
            </Link>
          </div>

          <div className="home__img">
            <img src="https://i.ibb.co/J3ScNtK/roshi.png" alt="Página en construcción" />
            <div className="home__shadow" />
          </div>
        </div>
      </section>
    </div>
  );
}
