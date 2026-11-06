"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var react_1 = require("react");
var client_1 = require("react-dom/client");
require("./index.css");
// AtualizaÃ§Ã£o de deploy limpo (sem node_modules)
var App = function () { return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800">OrÃ§aFÃ¡cil</h1>
      <p className="text-gray-600 mt-2">Sistema em construÃ§Ã£o.</p>
    </div>
  </div>); };
(0, client_1.createRoot)(document.getElementById('root')).render(<react_1.StrictMode>
    <App />
  </react_1.StrictMode>);
