
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext.jsx';
import { CourseProvider } from './contexts/CourseContext.jsx';
import { AdminCourseProvider } from './contexts/AdminCourseContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <AdminCourseProvider>
            <App />
          </AdminCourseProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);