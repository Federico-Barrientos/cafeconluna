import { Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { Gallery } from "./pages/Gallery";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";

export function App() {
  return (
    <>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}
