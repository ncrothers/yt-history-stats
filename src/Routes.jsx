import React from 'react';
import { Route } from 'react-router-dom';

import Home from './components/Home';
import NavbarBase from './components/Navbar';
import WatchHistory from './components/WatchHistory';
import Footer from './components/Footer';

export const Routes = () => {
    return (
        <>
            <Route path="/" component={NavbarBase} />
            <Route path="/" exact component={Home} />
            <Route path="/watch-history" exact component={WatchHistory} />

            <Route path="/" component={Footer} />
        </>
    )
}

export default Routes;