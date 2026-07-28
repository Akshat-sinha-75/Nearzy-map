import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Shop Survey Map</div>
        {/* Desktop links - always visible on desktop */}
        <div className="navbar-links-desktop">
          <Link to="/" className="nav-link">Map View</Link>
          <Link to="/add" className="nav-link">Add Shop</Link>
        </div>
        {/* Mobile hamburger - only on desktop as fallback, hidden on mobile now */}
        <div className={`hamburger ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Map View</Link>
          <Link to="/add" className="nav-link" onClick={() => setIsOpen(false)}>Add Shop</Link>
        </div>
      </nav>

      {/* Mobile bottom action bar */}
      <div className="mobile-bottom-bar">
        <Link
          to="/"
          className={`bottom-bar-btn ${location.pathname === '/' ? 'active' : ''}`}
          aria-label="Map View"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <span>Map View</span>
        </Link>
        <Link
          to="/add"
          className={`bottom-bar-btn ${location.pathname === '/add' ? 'active' : ''}`}
          aria-label="Add Shop"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Add Shop</span>
        </Link>
      </div>
    </>
  );
}

export default Navigation;
