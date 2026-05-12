import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-left">
          <p className="eyebrow">SaaS E-Learning 2025</p>
          <h1>Plateforme E-Learning moderne</h1>
          <p className="hero-subtitle">
            Apprentissage en ligne, cours interactifs et suivi de progression en temps reel.
          </p>
          <p className="hero-subtitle">
            Une experience claire et professionelle pour apprendre, enseigner et mesurer.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/login">
              Se connecter
            </Link>
            <Link className="btn soft" to="/register">
              Creer un compte
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <div className="visual-header">
              <span className="pill">Illustration</span>
              <div className="status-dot" />
            </div>
            <div className="visual-body">
              <div className="placeholder">
                <p>Zone visuelle E-Learning</p>
                <span>Inserez ici une illustration (etudiant, cours, visio, icones)</span>
              </div>
              <div className="visual-stats">
                <div>
                  <strong>+12k</strong>
                  <span>Apprenants actifs</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>Taux de satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">A</div>
          <h3>Authentification</h3>
          <p>Connexion securisee, creation de compte simple, gestion du profil.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">B</div>
          <h3>Cours & parcours</h3>
          <p>Catalogue de cours, progression suivie, certificats.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">C</div>
          <h3>Roles & collaboration</h3>
          <p>Espace etudiant, espace formateur, suivi par l'administrateur.</p>
        </div>
      </section>

      <section id="pricing" className="cta-grid">
        <div className="cta-card">
          <h3>Tarifs flexibles</h3>
          <p>Demarrage rapide pour les equipes, facturation claire et scalable.</p>
          <button className="btn outline" type="button">
            Voir les offres
          </button>
        </div>
        <div id="contact" className="cta-card">
          <h3>Contact</h3>
          <p>Une question ? Notre equipe accompagne vos parcours de formation.</p>
          <button className="btn soft" type="button">
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
}
