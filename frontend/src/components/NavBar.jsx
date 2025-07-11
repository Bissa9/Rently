import React ,{ useState , useEffect} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch } from "react-icons/fi";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import "../resources/navbar.css";
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useContext(UserContext);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Profile", path: "/profile" },
  ];
  const dropDownMenuItems = [
    {
      name: "Become a host",
      path: "/become-host",
      img: "/images/homePage/drop-down-menu/car.png",
      class: "host-container",
    },
    {
      name: "Loyalty program",
      path: "/howitworks",
      img: "/images/homePage/drop-down-menu/customer-loyalty.png",
      class: "loyalty-container",
    },
    
    {
      name: "Log out",
      path: "/login",
      img: "/images/homePage/drop-down-menu/logout.png",
      class: "logout-container",
    },
  ];
  const isActive = (path) => (location.pathname === path ? "active" : "");
  return (
    <div className="nav-container">
      <div className="nav-bar">
        <img
          src="/images/RentlyLogo.png"
          alt="Rently Logo"
          className="rently-logo"
        />

        {navItems.map((item, index) => {
          return (
            <Link
              to={item.path}
              key={index}
              className={`nav-link ${isActive(item.path)}`}
            >
              {item.name}
            </Link>
          );
        })}
        <FiSearch
          className="nav-bar-icon"
          onClick={() => {
            navigate("/search");
          }}
        />
        <FiMenu className="nav-bar-icon" onClick={toggleMenu} />
        <div className={`menu ${menuOpen ? "open" : ""}`}>
          {dropDownMenuItems.map((item, index) => {
            if (item.name === "Log out") {
              return (
                <div
                  className={item.class}
                  key={item.class + index}
                  onClick={logout}
                >
                  <img src={item.img} alt={item.name} />
                  <section>{item.name}</section>
                </div>
              );
            } else {
              return (
                <div className={item.class} key={item.class + index}>
                  <Link to={item.path}>
                    <img src={item.img} alt={item.name} />
                    <section>{item.name}</section>
                  </Link>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
