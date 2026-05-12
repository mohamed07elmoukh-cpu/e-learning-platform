import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="contact-page">
      <header className="contact-header">
        <p className="eyebrow">Support & assistance</p>
        <h1>Contactez-nous</h1>
        <p className="contact-subtitle">
          Une question sur nos cours ou la plateforme ? Ecrivez-nous, nous vous repondrons
          rapidement.
        </p>
      </header>

      <section className="contact-grid">
        <div className="contact-card">
          <h2>Envoyer un message</h2>
          <form className="contact-form">
            <label>
              Nom complet
              <input type="text" name="fullName" placeholder="Votre nom complet" required />
            </label>
            <label>
              Adresse e-mail
              <input type="email" name="email" placeholder="vous@exemple.com" required />
            </label>
            <label>
              Sujet
              <input type="text" name="subject" placeholder="Sujet de votre message" required />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="Expliquez votre demande..." required />
            </label>
            <label className="checkbox">
              <input type="checkbox" name="contactByEmail" />
              Je souhaite etre contacte par e-mail
            </label>
            <button type="submit" className="btn primary">
              Envoyer le message
            </button>
          </form>
        </div>

        <div className="contact-side">
          <div className="contact-card">
            <h2>Coordonnees</h2>
            <ul className="contact-list">
              <li>
                <span className="icon-circle">✉</span>
                support@elearning.com
              </li>
              <li>
                <span className="icon-circle">☎</span>
                +33 6 12 34 56 78
              </li>
              <li>
                <span className="icon-circle">⌂</span>
                12 rue des Formations, Paris
              </li>
              <li>
                <span className="icon-circle">⏱</span>
                Lun - Ven, 09:00 - 18:00
              </li>
            </ul>
            <div className="social">
              <h3>Suivez-nous</h3>
              <div className="social-links">
                <a href="#" className="social-pill">
                  LinkedIn
                </a>
                <a href="#" className="social-pill">
                  Instagram
                </a>
                <a href="#" className="social-pill">
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <div className="contact-illustration">
            <div className="pill">Illustration</div>
            <p>Support en ligne, bulle de chat, casque audio.</p>
            <span>Ajoutez une image ici</span>
          </div>
        </div>
      </section>

      <footer className="contact-footer">
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Politique de confidentialite</Link>
        <Link to="/terms">Conditions d'utilisation</Link>
      </footer>
    </div>
  );
}
