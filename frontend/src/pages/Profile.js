import { useEffect, useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import { getCars } from "../api/carsAPI";
import { Layout, Menu, Avatar, Button } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CrownOutlined,
  EditOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "../resources/profile.css";
import { UserContext } from "../contexts/UserContext";
import CarPreview from "../components/CarPreview";
import { getUserProfile } from "../api/userAPI.js";
import { getOwnerEarnings } from "../api/userAPI";

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

const Profile = () => {
  const { logout, user, setUser } = useContext(UserContext);
  const [profileType, setProfileType] = useState("user"); // "user" or "host"
  const [listedCars, setListedCars] = useState([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    lifetimeEarnings: 0,
    completedBookings: 0,
  });

  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const navigate = useNavigate();
  const navigateRentalHistory = (title, role) => {
    navigate(`/rentals/${title}`, { state: { role } });
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token) {
      getUserProfile(token) // Fetch the user profile
        .then((profile) => {
          setUser(profile); // Update the context with the profile data
        })
        .catch((error) => {
          console.error("Error fetching profile:", error.message);
        });
    }
  }, [setUser]);

  useEffect(() => {
    const fetchListedCars = async () => {
      try {
        const response = await getCars({ owner: user._id });
        setListedCars(response.data.cars || []);
      } catch (error) {
        console.error("Error fetching listed cars:", error.message);
      }
    };

    const fetchEarnings = async () => {
      try {
        const data = await getOwnerEarnings();
        console.log(data);

        setEarnings(data);
      } catch (error) {
        console.error("Error fetching earnings:", error.message);
      } finally {
        setLoadingEarnings(false);
      }
    };

    if (user && user.isCarOwner) {
      setProfileType("host");
      fetchListedCars();
      fetchEarnings();
    }
  }, [user]);
  // If user is undefined or null, show the Loading component
  if (user.firstName === undefined) {
    return <Loading />;
  }

  return (
    <Layout className="profile-layout">
      <Layout>
        {/* Sidebar */}
        <Sider width={250} className="profile-sider">
          <Menu
            mode="inline"
            theme="dark"
            defaultOpenKeys={["rental-history", "edit-profile", "loyalty"]}
          >
            {/* Rental History */}
            <SubMenu
              key="rental-history"
              icon={<ClockCircleOutlined />}
              title="Rental History"
            >
              {profileType === "host" ? (
                <>
                  <SubMenu key="as-host" title="As a Host">
                    <Menu.Item
                      key="host-previous"
                      onClick={() =>
                        navigateRentalHistory("Previous Rentals", "host")
                      }
                    >
                      Previous Rentals
                    </Menu.Item>
                    <Menu.Item
                      key="host-ongoing"
                      onClick={() =>
                        navigateRentalHistory("Ongoing Rentals", "host")
                      }
                    >
                      Ongoing Rentals
                    </Menu.Item>
                    <Menu.Item
                      key="host-upcoming"
                      onClick={() =>
                        navigateRentalHistory("Upcoming Rentals", "host")
                      }
                    >
                      Upcoming Rentals
                    </Menu.Item>
                  </SubMenu>
                  <SubMenu key="as-customer" title="As a Customer">
                    <Menu.Item
                      key="customer-previous"
                      onClick={() =>
                        navigateRentalHistory("Previous Rentals", "customer")
                      }
                    >
                      Previous Rentals
                    </Menu.Item>
                    <Menu.Item
                      key="customer-ongoing"
                      onClick={() =>
                        navigateRentalHistory("Ongoing Rentals", "customer")
                      }
                    >
                      Ongoing Rentals
                    </Menu.Item>
                    <Menu.Item
                      key="customer-upcoming"
                      onClick={() =>
                        navigateRentalHistory("Upcoming Rentals", "customer")
                      }
                    >
                      Upcoming Rentals
                    </Menu.Item>
                  </SubMenu>
                </>
              ) : (
                <>
                  <Menu.Item
                    key="customer-previous"
                    onClick={() =>
                      navigateRentalHistory("Previous Rentals", "customer")
                    }
                  >
                    Previous Rentals
                  </Menu.Item>
                  <Menu.Item
                    key="customer-ongoing"
                    onClick={() =>
                      navigateRentalHistory("Ongoing Rentals", "customer")
                    }
                  >
                    Ongoing Rentals
                  </Menu.Item>
                  <Menu.Item
                    key="customer-upcoming"
                    onClick={() =>
                      navigateRentalHistory("Upcoming Rentals", "customer")
                    }
                  >
                    Upcoming Rentals
                  </Menu.Item>
                </>
              )}
            </SubMenu>

            {/* Edit Profile */}
            <SubMenu
              key="edit-profile"
              icon={<EditOutlined />}
              title="Edit Profile"
            >
              <Menu.Item
                key="update-email"
                onClick={() => navigate("/updateemailandpassword")}
              >
                Update Password
              </Menu.Item>
              <Menu.Item
                key="update-profile"
                onClick={() => navigate("/updateprofile")}
              >
                Update Profile
              </Menu.Item>
              <Menu.Item
                key="update-license"
                onClick={() => navigate("/updatedrivinglicense")}
              >
                Update License Information
              </Menu.Item>
            </SubMenu>

            {/* Loyalty Program */}
            <SubMenu
              key="loyalty"
              icon={<CrownOutlined />}
              title="Loyalty Program"
            >
              <Menu.Item
                key="view-points"
                onClick={() => navigate("/LoyaltyProgram")}
              >
                View Your Points
              </Menu.Item>
              <Menu.Item
                key="how-it-works"
                onClick={() => navigate("/HowItWorks")}
              >
                How it works?
              </Menu.Item>
            </SubMenu>

            {/* Logout */}
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined />}
              className="logout"
              onClick={logout}
            >
              Logout
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Main Content */}
        <Content className="profile-content">
          <div className="profile-header-content">
            {profileType === "host" ? (
              <>
                <div className="user-profile">
                  <Avatar
                    size={50}
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <span className="host-tag">{profileType}</span>
                </div>
              </>
            ) : (
              <>
                <Avatar
                  size={50}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
              </>
            )}
            <span className="profile-username">{`${user.firstName}  ${user.lastName}`}</span>
          </div>

          <div className="profile-information-content">
            <div className="profile-info">
              <h2>Personal Information</h2>
              <div className="verified-item">
                <span>Driving License</span>
                <CheckCircleOutlined className="check-icon" />
              </div>
              <div className="verified-item">
                <span>Email</span>
                <CheckCircleOutlined className="check-icon" />
              </div>
              <div className="verified-item">
                <span>Phone Number</span>
                <CheckCircleOutlined className="check-icon" />
              </div>

              {profileType === "host" && (
                <div className="host-earnings">
                  <h2>Your Total Earnings</h2>
                  <p style={{ fontSize: "18px" }}>
                    {earnings?.totalEarnings?.toFixed(2) ?? "0.00"} EGP
                  </p>
                </div>
              )}
            </div>

            {profileType === "host" && (
              <div className="host-listings">
                <h2>Listed Cars</h2>
                <div className="listing-container">
                  {listedCars.length > 0 ? (
                    listedCars
                      .slice(0, 1)
                      .map((car) => (
                        <CarPreview key={car._id} car={car} width={200} />
                      ))
                  ) : (
                    <div className="no-listing-cars">
                      <p>No cars listed yet.</p>
                      <Button onClick={() => navigate("/carlisting")}>
                        Add Your First Car
                      </Button>
                    </div>
                  )}
                </div>
                <Button
                  className="view-more"
                  onClick={() =>
                    navigate("/Results", {
                      state: {
                        title: "Listed Cars",
                        bool: true,
                        car: listedCars,
                      },
                    })
                  }
                  style={{ display: listedCars.length == 1 ? "block" : "none" }}
                >
                  View More
                </Button>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
