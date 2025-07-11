import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import "./resources/global.css";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import BecomeHost from "./pages/BecomeHost";
import Search from "./pages/Search";
import Cardetails from "./pages/Cardetails";
import PaymenProcess from "./pages/PaymentProcess";
import AllSet from "./pages/AllSet";
import ProtectedRoute from "./components/ProtectedRoute";
import QuickSearch from "./pages/QuickSearch";
import Results from "./pages/Results";
import Rentals from "./components/Rentals";
import UpdateEmailAndPassword from "./pages/UpdateEmailAndPassword";
import UpdateProfile from "./pages/UpdateProfile";
import UpdateDrivingLicense from "./pages/UpdateDrivingLicense";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import HowItWorks from "./pages/HowItWorks";
import CarListing from "./pages/CarListing";
import RedeemVoucher from "./pages/RedeemVoucher";
import ScrollToTop from "./components/ScrollToTop";
import EditCar from "./pages/EditCar";
function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentprocess"
            element={
              <ProtectedRoute>
                <PaymenProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cardetails"
            element={
              <ProtectedRoute>
                <Cardetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quick-search"
            element={
              <ProtectedRoute>
                <QuickSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route path="/loyaltyprogram" element={<LoyaltyProgram />} />
          <Route path="/howitworks" element={<HowItWorks />} />
          <Route path="/rentals/:title" element={<Rentals />} />
          <Route path="/carlisting" element={<CarListing />} />
          <Route path="/redeemvoucher" element={<RedeemVoucher />} />
          <Route path="/editcar" element={<EditCar />} />

          <Route path="/editcar/:carId" element={<EditCar />} />
        </Route>
        <Route
          path="/become-host"
          element={
            <ProtectedRoute>
              <BecomeHost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route
          path="/allset"
          element={
            <ProtectedRoute>
              <AllSet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateemailandpassword"
          element={<UpdateEmailAndPassword />}
        />
        <Route path="/updateprofile" element={<UpdateProfile />} />
        <Route
          path="/updatedrivinglicense"
          element={<UpdateDrivingLicense />}
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
