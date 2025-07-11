import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../resources/card.css";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import { UserOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { Avatar, Rate } from "antd";
import ReactSelect from "react-select";
import { jwtDecode } from "jwt-decode";

import {
  getCarReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../api/reviewsAPI";
import { getLoyaltyProgram } from "../api/loyaltyAPI";
import { UserContext } from "../contexts/UserContext";
import Swal from "sweetalert2";
import { checkAvailability, hasUserRentedThisCar } from "../api/bookingAPI";
import axios from "axios";
import { deleteCar } from "../api/carsAPI";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const Cardetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const car = location.state?.car;

  const { user } = useContext(UserContext);
  const isUserLoaded = user?.profile?._id !== undefined;
  const [owner, setOwner] = useState(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [voucher, setVoucher] = useState(null);

  const pickupCity = car?.location?.city;
  const pickupSpot = pickupLocation;

  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [errors, setErrors] = useState({});

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [textError, setTextError] = useState("");
  const [ratingError, setRatingError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const getRentalDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const parsePercentageFromCode = (code) => {
    const parts = code.split("-");
    if (parts.length >= 2) {
      const cost = parseInt(parts[1], 10);
      if (!isNaN(cost)) {
        return cost / 1000;
      }
    }
    return 0;
  };

  const price = car?.pricePerDay || 0;
  const rentalDays = getRentalDays();
  const totalPrice = price * rentalDays;
  const getDiscountAmount = () => {
    if (!voucher) return 0;
    const discountPercent = parsePercentageFromCode(voucher);
    return (totalPrice * discountPercent) / 100;
  };
  const finalPrice = totalPrice - getDiscountAmount();

  const carDetails = [
    { label: car.fuelType, iconClass: "ri-gas-station-fill" },
    { label: `${car.seats} seats`, iconClass: "ri-user-fill" },
    { label: car.transmissionType, iconClass: "ri-settings-3-fill" },
    { label: car.location.city, iconClass: "ri-map-pin-fill" },
  ];

  const voucherOptions = (vouchers?.filter((v) => !v.used) || []).map((v) => ({
    value: v.code,
    label: `${parsePercentageFromCode(v.code)}% Discount`,
  }));

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const averageRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const validateForm = () => {
    const newErrors = {};
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (!pickupLocation) {
      newErrors.pickupLocation = "Please select a pickup spot";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRentClick = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    if (!car?._id) {
      console.error("Car ID is missing. Cannot proceed to payment.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await checkAvailability({
        token,
        carId: car._id,
        startDate,
        endDate,
      });
      if (!res.available) {
        const conflict = res.conflictingBookings?.[0];
        const conflictMsg = conflict
          ? `This car is already booked from ${conflict.startDate.slice(
              0,
              10
            )} to ${conflict.endDate.slice(0, 10)}.`
          : `This car is not available from ${startDate} to ${endDate}.`;
        setErrors((prev) => ({ ...prev, endDate: conflictMsg }));
        return;
      }
      navigate(
        `/paymentprocess?carId=${
          car._id
        }&startDate=${startDate}&endDate=${endDate}&pickupCity=${encodeURIComponent(
          pickupCity
        )}&pickupSpot=${encodeURIComponent(pickupSpot)}&price=${
          car.pricePerDay
        }${voucher ? `&voucher=${voucher}` : ""}`
      );
    } catch (error) {
      console.error("Failed to check availability:", error);
      setErrors((prev) => ({
        ...prev,
        endDate: "Failed to check car availability. Please try again.",
      }));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this review?",
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#A8A8A8",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await deleteReview({ reviewId, token });
        toast.success("Review deleted");
        fetchReviews(car._id);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleDeleteCar = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this car?",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#f0f0f0",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, keep it",
      customClass: {
        cancelButton: "swal2-cancel-custom",
        actions: "swal2-actions-tight",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await deleteCar({ token, carId: car._id });
          Swal.fire({
            title: "Deleted!",
            text: "Your car has been deleted.",
            icon: "success",
            confirmButtonColor: "#FF6B35",
          });
          navigate(-1);
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Failed to delete the car. Please try again.",
            icon: "error",
            confirmButtonColor: "#FF6B35",
          });
          console.error("Error deleting car:", error);
        }
      }
    });
  };

  const handleSubmitReview = async () => {
    setTextError("");
    setRatingError("");

    if (reviewRating < 1 || reviewRating > 5) {
      setRatingError("Please select a rating between 1 and 5.");
      return;
    }
    const trimmed = reviewText.trim();
    if (trimmed.length < 10) {
      setTextError(
        `Review must be at least 10 characters. You wrote ${trimmed.length}.`
      );
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Not Logged In",
        text: "You must be logged in to leave a review.",
        icon: "warning",
      });
      return;
    }

    try {
      if (editMode && editingReviewId) {
        await updateReview({
          reviewId: editingReviewId,
          updateData: { comment: trimmed, rating: reviewRating },
          token,
        });
        toast.success("Review updated");
      } else {
        const reviewData = {
          carId: car._id,
          rating: reviewRating,
          comment: trimmed,
        };
        await createReview({ reviewData, token });
        toast.success("Thank you! Your review has been submitted.");
      }

      setReviewRating(0);
      setReviewText("");
      setEditMode(false);
      setEditingReviewId(null);

      fetchReviews(car._id);
    } catch (err) {
      console.error("Review submission error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to submit review.",
        icon: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewText("");
    setTextError("");
    setRatingError("");
  };

  const fetchReviews = async (carId) => {
    try {
      const res = await getCarReviews(carId);
      setReviews(res.data);
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (!car) return;

    const fetchCarOwnerData = async (carOwnerId) => {
      try {
        const response = await axios.get(`/api/users/${carOwnerId}`);
        setOwner(response.data);
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          const currentUser = await axios.get(`/api/users/${decoded.id}`);
          setUserEmail(currentUser.data.email);
        }
      } catch (error) {
        console.error(
          "Error fetching car owner data:",
          error.response ? error.response.data : error.message
        );
      }
    };
    if (car.owner) {
      fetchCarOwnerData(car.owner);
    }

    fetchReviews(car._id);

    const fetchLoyaltyData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getLoyaltyProgram(token);
        const { loyaltyProgram, noLoyaltyYet } = res;
        if (!loyaltyProgram || noLoyaltyYet) {
          setVouchers([]);
        } else {
          setVouchers(
            (loyaltyProgram.discountCodes || []).filter((v) => !v.used)
          );
        }
      } catch (error) {
        console.error(
          "Error fetching loyalty program:",
          error.response?.data || error.message
        );
      }
    };
    fetchLoyaltyData();

    const checkRental = async () => {
      if (!user || !car._id) {
        setCanLeaveReview(false);
        return;
      }
      const token = localStorage.getItem("token");
      const rentedBefore = await hasUserRentedThisCar({
        token,
        carId: car._id,
      });
      setCanLeaveReview(rentedBefore);
    };
    checkRental();
  }, [car, user]);

  const allFeatures = [
    ...carDetails,
    car.mileage && {
      label: `${car.mileage} km`,
      iconClass: "ri-timer-2-fill",
    },
    car.carbonFootprint && {
      label: `${car.carbonFootprint}`,
      iconClass: "ri-leaf-fill",
    },
  ].filter(Boolean);

  // build items for react-image-gallery
  const galleryItems = [car.mainPhoto, ...(car.additionalPhotos || [])].map(
    (src) => ({
      original: src,
      thumbnail: src,
    })
  );
  const galleryRef = useRef();

  console.log({ owner });

  console.log(userEmail);

  return (
    <>
      <div style={{ marginTop: "20px", marginLeft: "10px" }}>
        <BackButton color="var(--dark-grey)" />
      </div>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="car-details-container">
        <div className="car-images">
          <ImageGallery
            ref={galleryRef}
            items={galleryItems}
            showPlayButton={false}
            showFullscreenButton={true}
            lazyLoad={true}
            useBrowserFullscreen={true}
            thumbnailPosition="bottom"
            swipeable={true}
            renderLeftNav={(onClick, disabled) => (
              <button
                className="custom-nav left"
                onClick={onClick}
                disabled={disabled}
              >
                ‹
              </button>
            )}
            renderRightNav={(onClick, disabled) => (
              <button
                className="custom-nav right"
                onClick={onClick}
                disabled={disabled}
              >
                ›
              </button>
            )}
            renderItem={(item) => (
              <img
                src={item.original}
                alt={item.originalAlt}
                onClick={() => galleryRef.current.fullScreen()}
                style={{ cursor: "pointer" }}
              />
            )}
          />
        </div>

        <div className="car-details">
          <h1 id="mobile-car-title">
            {car.make} {car.model}
          </h1>
          <div className="left-side">
            <div className="second">
              <h1>
                {car.make} {car.model}
              </h1>
              <div className="description">
                <h3>Description</h3>
                <p>{car.description}</p>
              </div>
            </div>
            <div className="features">
              <h3>Car Details</h3>
              <div className="features-grid">
                {(allFeatures || []).map((feature, index) => {
                  const isHidden = index >= 4 && !showAllFeatures;

                  return (
                    <div
                      className={`feature-item ${isHidden ? "hidden" : ""}`}
                      key={index}
                    >
                      <i
                        className={feature.iconClass}
                        style={{
                          marginRight: "8px",
                          ...(feature.iconStyle || {}),
                        }}
                      ></i>
                      <span>{feature.label}</span>
                    </div>
                  );
                })}
              </div>

              {allFeatures.length > 4 && (
                <button
                  className="show-more-btn"
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                >
                  {showAllFeatures ? "Less" : "More"}
                </button>
              )}
            </div>
            <div className="reviews-section">
              <div className="reviews-header">
                <h3>Ratings and Reviews</h3>
                <div className="rating">
                  {reviews.length > 0 && (
                    <>
                      {averageRating.toFixed(2)}
                      <Rate
                        disabled
                        value={1}
                        count={1}
                        style={{ fontSize: "24px" }}
                        className="rating-stars"
                      />
                    </>
                  )}
                </div>
              </div>

              <h4 className="reviews-title">REVIEWS</h4>
{(reviews?.length === 0) ? (
  <p className="no-reviews">No reviews yet.</p>
) : (
  (reviews || []).map((review) => (
    <div className="review" key={review._id}>
      <div className="review-header">
        <Avatar
          size={50}
          icon={<UserOutlined />}
          className="profile-avatar"
        />
        <section>
          <h4 className="reviewer-name">
            {`${review.user?.firstName || ""} ${review.user?.lastName || ""}`.trim() || "Anonymous"}
          </h4>
          <Rate
            disabled
            value={review.rating}
            className="rating-stars"
          />
        </section>
      </div>

      <div className="review-content">
        {editMode && editingReviewId === review._id ? (
          <>
            <label>
              Rating:&nbsp;
              <Rate
                value={reviewRating}
                onChange={(value) => setReviewRating(value)}
                className="rating-stars"
              />
            </label>
            {ratingError && (
              <p className="error-text">{ratingError}</p>
            )}

            <textarea
              rows={4}
              className="review-input"
              placeholder="Edit your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            {textError && <p className="error-text">{textError}</p>}

            <div className="edit-review-actions">
              <button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: "white",
                  color: "#A8A8A8",
                  border: "1px solid #A8A8A8",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                style={{
                  backgroundColor: "#ff6b35",
                  color: "white",
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="review-text">{review.comment}</p>
            <p className="review-date">{formatDate(review.reviewDate)}</p>

            {isUserLoaded && review.user?._id === user.profile._id && (
              <div className="review-actions">
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  style={{ color: "crimson", marginRight: "1rem" }}
                >
                  Delete Review
                </button>
                <button
                  onClick={() => {
                    setReviewText(review.comment);
                    setReviewRating(review.rating);
                    setEditingReviewId(review._id);
                    setEditMode(true);
                    setTextError("");
                    setRatingError("");
                  }}
                  style={{ color: "#888" }}
                >
                  Edit Review
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ))
)}

              {canLeaveReview && !editMode && (
                // ─── LEAVE A NEW REVIEW ───
                <div className="leave-review-section">
                  <h3>Leave a Review</h3>

                  <label>
                    Rating:&nbsp;
                    <Rate
                      value={reviewRating}
                      onChange={(value) => setReviewRating(value)}
                      className="rating-stars"
                    />
                  </label>
                  {ratingError && <p className="error-text">{ratingError}</p>}

                  <textarea
                    rows={4}
                    className="review-input"
                    placeholder="Write your review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  {textError && <p className="error-text">{textError}</p>}

                  <Button text={"Share Review"} onClick={handleSubmitReview} />
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT SIDE: Host info or booking form ─── */}
          <div className="right-side">
            <h2>Hosted by</h2>
            <div className="host-info">
              <Avatar
                size={50}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              {owner && (
                <div className="host-details">
                  <p>
                    <strong>
                      {userEmail === owner.email
                        ? "You"
                        : `${owner.firstName} ${owner.lastName}`}
                    </strong>
                  </p>
                  <p>{owner.rating}</p>
                </div>
              )}
            </div>

            {owner && userEmail === owner?.email ? (
              <div className="host-actions">
                <Button
                  text={"Edit Car"}
                  color={"white"}
                  textColor={"#A8A8A8"}
                  border={"1px solid #A8A8A8"}
                  onClick={() => navigate(`/editcar/${car._id}`)}
                />
                <Button
                  text={"Delete Car"}
                  color={"red"}
                  onClick={handleDeleteCar}
                />
              </div>
            ) : (
              <div className="booking">
                <label>Start date</label>
                <div className="date-time-group">
                  <div className="input-group">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="date-picker"
                    />
                    {errors.startDate && (
                      <p className="error-text">{errors.startDate}</p>
                    )}
                  </div>
                </div>

                <label>End date</label>
                <div className="date-time-group">
                  <div className="input-group">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="date-picker"
                    />
                    {errors.endDate && (
                      <p className="error-text">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                <label
                  htmlFor="pickup-spot"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Pickup & Return Spot
                </label>
                <ReactSelect
                  options={(car.location?.spots || []).map((spot) => ({
                    value: spot,
                    label: spot,
                  }))}
                  value={
                    pickupLocation
                      ? { value: pickupLocation, label: pickupLocation }
                      : null
                  }
                  onChange={(selected) =>
                    setPickupLocation(selected?.value || "")
                  }
                  placeholder="Select pickup spot »"
                  isClearable
                  components={{ DropdownIndicator: null }}
                  styles={{
                    container: (base) => ({ ...base, marginBottom: "10px" }),
                    option: (base, state) => ({
                      ...base,
                      cursor: "pointer",
                      backgroundColor: state.isSelected ? "#FF6B35" : "white",
                      color: state.isSelected ? "white" : "black",
                      "&:hover": {
                        backgroundColor: state.isSelected
                          ? "#FF6B35"
                          : "#ffe0b2",
                        color: state.isSelected ? "white" : "black",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    control: (base, state) => ({
                      ...base,
                      height: "40px",
                      borderRadius: "8px",
                      borderColor: "#ddd",
                      padding: "0 10px",
                      fontSize: "16px",
                      boxShadow: "none",
                      backgroundColor: "white",
                      "&:hover": { borderColor: "#888" },
                      minHeight: "40px",
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                    }),
                    input: (base) => ({ ...base, margin: "0", padding: "0" }),
                    placeholder: (base) => ({ ...base, color: "#FF6B35" }),
                    clearIndicator: (base) => ({
                      ...base,
                      "&:hover": { color: "red" },
                      padding: "5px",
                      cursor: "pointer",
                    }),
                  }}
                />

                <label>Save on your ride</label>
                <ReactSelect
                  components={{ DropdownIndicator: () => null }}
                  options={voucherOptions}
                  value={
                    voucherOptions.find((opt) => opt.value === voucher) || null
                  }
                  onChange={(selectedOption) => {
                    setVoucher(selectedOption?.value || "");
                  }}
                  placeholder="Select your voucher »"
                  isClearable
                  styles={{
                    container: (base) => ({ ...base, marginBottom: "10px" }),
                    option: (base, state) => ({
                      ...base,
                      cursor: "pointer",
                      backgroundColor: state.isSelected ? "#FF6B35" : "white",
                      color: state.isSelected ? "white" : "black",
                      "&:hover": {
                        backgroundColor: state.isSelected
                          ? "#FF6B35"
                          : "#ffe0b2",
                        color: state.isSelected ? "white" : "black",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    control: (base, state) => ({
                      ...base,
                      height: "40px",
                      borderRadius: "8px",
                      borderColor: "#ddd",
                      padding: "0 10px",
                      fontSize: "16px",
                      boxShadow: "none",
                      backgroundColor: "white",
                      "&:hover": { borderColor: "#888" },
                      minHeight: "40px",
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                    }),
                    input: (base) => ({ ...base, margin: "0", padding: "0" }),
                    placeholder: (base) => ({ ...base, color: "#FF6B35" }),
                    clearIndicator: (base) => ({
                      ...base,
                      "&:hover": { color: "red" },
                      padding: "5px",
                      cursor: "pointer",
                    }),
                  }}
                />

                {voucher ? (
                  <p className="voucher-selected">
                    <strong>{`${parsePercentageFromCode(
                      voucher
                    )}% Discount code`}</strong>
                  </p>
                ) : (
                  <p className="voucher-placeholder">No voucher selected</p>
                )}

                <p className="price">
                  {finalPrice.toFixed(2)} EGP total
                  {voucher && (
                    <span className="discount-note">
                      (Discount applied: {getDiscountAmount().toFixed(2)} EGP)
                    </span>
                  )}
                </p>

                <button onClick={handleRentClick} className="rent-btn">
                  Rent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cardetails;
