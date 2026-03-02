import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import Navbar, { NavbarVariant } from "./components/Navbar";

const App = () => {
  // Try changing this to "corporation" or "student" to test
  const [userRole] = useState<NavbarVariant>("guest");

  return (
    <BrowserRouter>
      <Navbar variant={userRole} />

      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
