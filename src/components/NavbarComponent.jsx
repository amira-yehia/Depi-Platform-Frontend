import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";

import "./Navbar.css";

function NavbarComponent() {
  return (
    <Navbar expand="lg" className="nh-navbar">
      <Container className="nh-navbar__container">
        {/* Brand logo */}
        <Navbar.Brand as={Link} to="/" className="nh-navbar__brand">
          <img src="/images/logo.png" alt="NextHire logo" className="nh-navbar__logo" />
        </Navbar.Brand>

        {/* Mobile menu button */}
        <Navbar.Toggle aria-controls="main-navbar" className="nh-navbar__toggle" />

        <Navbar.Collapse id="main-navbar" className="nh-navbar__collapse">
          {/* Main navigation links */}
          <Nav className="nh-navbar__links">
            <Nav.Link href="/#features">Features</Nav.Link>
            <Nav.Link href="/#how-it-works">How It Works</Nav.Link>
            <Nav.Link href="/#ai-technology">AI Technology</Nav.Link>
          </Nav>

          {/* Auth actions */}
          <div className="nh-navbar__actions">
            <Link to="/signin" className="nh-navbar__login">
              Log In
            </Link>

            <Link to="/signup" className="nh-navbar__signup">
              Get Started
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;