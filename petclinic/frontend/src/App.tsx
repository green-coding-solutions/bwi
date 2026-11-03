import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Owners from "./pages/Owners";
import OwnerDetail from "./pages/OwnerDetail";
import Vets from "./pages/Vets";
import Berichte from "./pages/Berichte";

export default function App() {
  return (
    <>
      <nav>
        <span className="brand">PetClinic</span>
        <NavLink to="/" end>Start</NavLink>
        <NavLink to="/owners">Besitzer</NavLink>
        <NavLink to="/vets">Tierärzte</NavLink>
        <NavLink to="/berichte">Berichte</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/owners/:id" element={<OwnerDetail />} />
          <Route path="/vets" element={<Vets />} />
          <Route path="/berichte" element={<Berichte />} />
        </Routes>
      </main>
    </>
  );
}
