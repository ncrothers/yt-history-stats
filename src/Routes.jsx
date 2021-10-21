import React from 'react';
import { Route } from 'react-router-dom';

import NavbarBase from './components/Navbar';
import WatchHistory from './components/WatchHistory';
import Footer from './components/Footer';
import Help from './components/Help';

export const Routes = () => {
    return (
        <>
            <Route path="/" component={NavbarBase} />
            <Route path="/" exact component={WatchHistory} />
            <Route path="/help" exact component={Help} />
            <Route path="/" component={Footer} />
        </>
    )
}

export default Routes;