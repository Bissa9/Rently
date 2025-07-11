import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import "../resources/layout.css";

const Layout = () => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="layout-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;