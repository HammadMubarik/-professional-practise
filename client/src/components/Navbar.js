import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";  // Import Navbar-specific CSS

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Login</Link></li>
        <li><Link to="/signup">Sign Up</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
