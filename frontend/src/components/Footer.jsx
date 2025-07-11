import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import "../resources/footer.css";
const Footer = () => {
  return (
   <div className="footer-container">
   <footer className="footer">
      <div className="footer-content">
        <div className="footer-section-rently">
          <h3>Rently<hr/></h3>
          <p>The open road is calling - Answer with the perfect ride!</p>
          <div className="social-icons">
            <FaFacebook className="icon" />
            <FaInstagram className="icon" />
            <FaTwitter className="icon" />
          </div>
        </div>
        <div className="second-half">
          <div className="footer-section-about">
            <h3>About <hr/></h3>
            
            <ul>
              <li>Team</li>
              <li>Policies</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="footer-section-explore">
            <h3>Explore <hr/></h3>
            <ul>
              <li>Book a car</li>
              <li>Get help</li>
              <li>How it works</li>
            </ul>
          </div>
        </div>
      </div>
      <hr />

      <div className="footer-bottom">
        <p>© Copyright. All rights reserved.</p>
        <div className="terms">
          <span>Terms</span> · <span>Privacy Policy</span> ·{" "}
          <span>Cookies</span>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
