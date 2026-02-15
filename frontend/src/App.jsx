import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import GuestNavbar from "./components/GuestNavbar";

const App = () => {
  const [navHeight, setNavHeight] = useState(0);

  return (
    <BrowserRouter>
      <GuestNavbar onHeightChange={setNavHeight} />

      <main style={{ paddingTop: `${navHeight}px` }}>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
