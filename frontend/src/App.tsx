import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white selection:bg-indigo-500 selection:text-white">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 text-center">
        Vite + React + Tailwind
      </h1>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center border border-gray-700">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors duration-200 outline-none focus:ring-4 focus:ring-indigo-500/50 mb-4 cursor-pointer"
        >
          count is {count}
        </button>
        <p className="text-gray-400 text-center mt-2">
          Edit{" "}
          <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-200 mx-1">
            src/App.tsx
          </code>{" "}
          to test HMR
        </p>
      </div>
    </div>
  );
}

export default App;
