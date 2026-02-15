import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

import { useRef, useEffect } from "react";

const GuestNavbar = ({ onHeightChange }) => {
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary" fixed="top" ref={navRef}>
      <Container>
        <Navbar.Brand href="#home">LetsMeet</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="d-flex me-auto ms-auto">
            <Nav.Link href="#events">Find Events</Nav.Link>
            <Nav.Link href="#sponsor">Browse Sponsors</Nav.Link>
            <Nav.Link href="#about">About Us</Nav.Link>
          </Nav>
          <Nav className="d-flex align-items-center gap-2">
            <Nav.Link href="#login" className="me-2">
              Login
            </Nav.Link>
            <Button variant="primary" href="#register">
              Register
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default GuestNavbar;
