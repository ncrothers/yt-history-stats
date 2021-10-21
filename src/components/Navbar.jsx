import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

// import '../styles/index.css';

export const NavbarBase = () => {

    return (
        <Navbar className="p-2 px-3" bg="dark" variant="dark">
            <Navbar.Brand href="/">YouTube History Stats</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link href="/watch-history">Watch History</Nav.Link>
                    <Nav.Link href="/help">Help</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default NavbarBase;