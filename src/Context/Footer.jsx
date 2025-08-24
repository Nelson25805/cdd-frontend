import { Link } from 'react-router-dom';
import logo from '../Images/logo.png';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="App-footer">
      <div className="footer-left">
        <Link to="/" className="footer-logo-link" aria-label="Home">
          <img src={logo} alt="Logo" className="footer-logo" />
        </Link>
        <div className="footer-copy">© {year} Nelson McFadyen</div>
      </div>

      <div className="footer-right">
        <Link to="/about" className="footer-link">About</Link>
        <span className="footer-sep">|</span>
        <Link to="/contact" className="footer-link">Contact</Link>
      </div>
    </footer>
  );
}
