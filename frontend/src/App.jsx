import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

import GuestNavbar from "./components/GuestNavbar";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <GuestNavbar />
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
