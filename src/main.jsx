import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- هذا هو السطر الذي كان مفقوداً وسبب المشكلة
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)