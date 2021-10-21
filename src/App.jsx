import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'c3/c3.min.css';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

export default App;
