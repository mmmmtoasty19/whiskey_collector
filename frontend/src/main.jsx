import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { WhiskeyProvider } from './contexts/WhiskeyContext'
import { CollectionProvider } from './contexts/CollectionContext'
import { RatingProvider } from './contexts/RatingContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <WhiskeyProvider>
        <CollectionProvider>
          <RatingProvider>
            <App />
          </RatingProvider>
        </CollectionProvider>
      </WhiskeyProvider>
    </AuthProvider>
  </React.StrictMode>,
)