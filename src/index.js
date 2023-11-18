import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Import any global styles
import App from './App'; // Import the main component of your app

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Mount the app into the root element in your HTML file
);