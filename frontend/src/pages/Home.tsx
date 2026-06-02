import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Parcours structures",
    text: "Des cours organises en modules et lecons, avec une progression facile a suivre."
  },
  {
    title: "Experience instructeur",
    text: "Publiez des contenus, organisez vos classes et gardez une vision claire sur le catalogue."
  },
  {
    title: "Pilotage simple",
    text: "Un gateway unique, des roles clairs et une base plus solide pour faire evoluer la plateforme."
  }
];

const highlights = [
  { value: "3", label: "cours publies" },
  { value: "6", label: "modules prets" },
  { value: "100%", label: "stack TypeScript" }
];

export default function Home() {
  return (
    <div className="page-home">
      <section className="hero hero-modern">
        <div className="hero-copy">
          <p className="eyebrow">E-learning platform</p>
          <h1>Une plateforme de formation plus claire, plus rapide, plus credible.</h1>
          <p className="hero-subtitle">
            Decouvrez un catalogue mieux structure, des pages de cours plus utiles et une base
            de donnees pensee pour evoluer sans bricolage.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/courses">
              Explorer les cours
            </Link>
            <Link className="btn soft" to="/register">
              Creer un compte
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-top">
            <span className="pill">Nouveau catalogue</span>
            <span className="mini-chip">frontend + services</span>
          </div>
          <div className="hero-scoreboard">
            {highlights.map((item) => (
              <div key={item.label} className="score-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-timeline">
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Catalogue enrichi</strong>
                <p>Categories, tags, duree estimee et cours mis en avant.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Navigation modernisee</strong>
                <p>Cartes visuelles, detail de cours exploitable et hierarchy plus nette.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band">
        {pillars.map((item, index) => (
          <article key={item.title} className="feature-card feature-card-modern">
            <div className="feature-index">0{index + 1}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section id="pricing" className="cta-strip">
        <div className="cta-banner">
          <div>
            <p className="eyebrow">Pret a lancer</p>
            <h2>Un socle plus propre pour continuer le produit.</h2>
            <p className="muted">
              La plateforme affiche deja de vrais cours et des pages plus convaincantes pour les
              apprenants.
            </p>
          </div>
          <div className="row">
            <Link className="btn primary" to="/dashboard">
              Ouvrir le dashboard
            </Link>
            <Link className="btn outline" to="/contact">
              Parler a l equipe
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
