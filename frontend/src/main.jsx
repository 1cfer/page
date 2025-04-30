import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';

// Component
import { BrowserRouter } from 'react-router-dom';
import Main from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </React.StrictMode>
);
