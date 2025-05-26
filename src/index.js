// 캔버스에 작성된 코드 - 복사하여 사용하세요.
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store.jsx';
import { QueryClient, QueryClientProvider } from 'react-query';

// 기존 AuthProvider import 유지
import { AuthProvider } from './AuthContext';



const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <AuthProvider>
    
          <BrowserRouter>
            <App />
          </BrowserRouter>

      </AuthProvider>
    </Provider>
  </QueryClientProvider>
  // </React.StrictMode>
);

serviceWorkerRegistration.register();
reportWebVitals();