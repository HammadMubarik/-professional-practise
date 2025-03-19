import React from "react";
import { Link } from "react-router-dom";

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
