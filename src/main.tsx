import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800">OrçaFácil</h1>
      <p className="text-gray-600 mt-2">Sistema em construção.</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
