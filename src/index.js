import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/App.css';
import App from './App';

let div = document.createElement('div')

div.id = 'root'
document.body.appendChild(div)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

