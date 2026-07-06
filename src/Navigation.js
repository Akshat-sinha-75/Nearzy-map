import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-brand">Shop Survey Map</div>
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
  );
}

export default Navigation;
