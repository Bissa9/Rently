// src/components/Rentals.js
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getRentalHistory,
  updateBooking,
  cancelBooking,
} from "../api/bookingAPI";
import { getCarById } from "../api/carsAPI";
import BackButton from "./BackButton";
import Button from "./Button";
import Swal from "sweetalert2";
import "../resources/rentalCar.css";
import Loading from "./Loading";

function Rentals() {
  const { title } = useParams();
  const { state } = useLocation();
  const role = state?.role;

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(!!role);

  // New state for inline editing
  const [editingRentalId, setEditingRentalId] = useState(null);
  const [editDates, setEditDates] = useState({ startDate: "", endDate: "" });

  const attachCars = async (plainRentals) => {
    const ids = [...new Set(plainRentals.map((r) => r.carId))];

    const idToCar = Object.fromEntries(
      await Promise.all(
        ids.map((id) =>
          getCarById(id)
            .then((car) => [id, car])
            .catch(() => [id, null])
        )
      )
    );

    return plainRentals.map(({ carId, ...rest }) => ({
      car: idToCar[carId],
      ...rest,
    }));
  };

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        const history = await getRentalHistory(token);

        const table = role === "host" ? history.asHost : history.asCustomer;

        const keyMap = {
          previous: "previous",
          ongoing: "ongoing",
          upcoming: "upcoming",
        };
        const firstWord = title.toLowerCase().split(" ")[0]; // previous / ongoing / upcoming
        const slice = table[keyMap[firstWord]] ?? [];

        const withCars = await attachCars(slice);
        setRentals(withCars);
      } catch (err) {
        console.error("Error while loading rentals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [role, title]);

  const dateFormat = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Start editing handler, checks 24h rule before allowing edit
  const startEditing = (rental) => {
    const now = new Date();
    const startDate = new Date(rental.startDate);
    if (startDate - now < 24 * 60 * 60 * 1000) {
      Swal.fire({
        icon: "error",
        title: "Modification Not Allowed",
        text: "You cannot modify a booking less than 24 hours before the rental start date.",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }
    setEditingRentalId(rental._id);
    setEditDates({
      startDate: rental.startDate.slice(0, 10),
      endDate: rental.endDate.slice(0, 10),
      exactSpot: rental.pickupLocation?.exactSpot,
    });
  };

  // Handle input change
  const handleDateChange = (e) => {
    setEditDates((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Confirm modification
  const confirmModify = async (rental) => {
    if (!editDates.startDate || !editDates.endDate) {
      Swal.fire({
        title: "Error",
        text: "Please fill both start and end dates.",
        icon: "error",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }
    if (editDates.startDate > editDates.endDate) {
      Swal.fire({
        title: "Error",
        text: "End date must be after start date.",
        icon: "error",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await updateBooking({
        token,
        bookingId: rental.id,
        updatedData: {
          startDate: editDates.startDate,
          endDate: editDates.endDate,
          pickupLocation: {
            exactSpot: editDates.exactSpot,
          },
        },
      });
      Swal.fire({
        title: "Updated!",
        text: "Your booking has been updated.",
        icon: "success",
        confirmButtonColor: "#FF6B35",
      });
      setEditingRentalId(null);

      // Refresh list
      const history = await getRentalHistory(token);
      const table = role === "host" ? history.asHost : history.asCustomer;
      const keyMap = {
        previous: "previous",
        ongoing: "ongoing",
        upcoming: "upcoming",
      };
      const firstWord = title.toLowerCase().split(" ")[0];
      const slice = table[keyMap[firstWord]] ?? [];
      const withCars = await attachCars(slice);
      setRentals(withCars);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update booking.",
        icon: "error",
        confirmButtonColor: "#FF6B35",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel modification editing
  const cancelModify = () => {
    setEditingRentalId(null);
  };

  // Cancel booking handler
  const handleCancel = (rental) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this booking?",
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#f0f0f0",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      customClass: {
        cancelButton: "swal2-cancel-custom",
        actions: "swal2-actions-tight",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          console.log(rental);
          await cancelBooking({ token, bookingId: rental.id });

          Swal.fire({
            title: "Cancelled!",
            text: "Your booking has been cancelled.",
            icon: "success",
            confirmButtonColor: "#FF6B35",
          });

          // Refresh rentals after cancellation
          setLoading(true);
          const history = await getRentalHistory(token);
          const table = role === "host" ? history.asHost : history.asCustomer;
          const keyMap = {
            previous: "previous",
            ongoing: "ongoing",
            upcoming: "upcoming",
          };
          const firstWord = title.toLowerCase().split(" ")[0];
          const slice = table[keyMap[firstWord]] ?? [];
          const withCars = await attachCars(slice);
          setRentals(withCars);
        } catch (error) {
          Swal.fire({
            titlle: "Error",
            text: "Failed to cancel booking.",
            icon: "error",
          });
          console.error("Error cancelling booking:", error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="container">
      <BackButton />

      <div className="rental-car-body">
        <h2>{`${title} ${role === "host" ? "As Host" : "As Customer"}`}</h2>

        {rentals.length === 0 ? (
          <p className="no-rentals">No rentals found.</p>
        ) : (
          rentals.map((rental, index) => (
            <div key={rental.car?._id + index} className="rental-car-details">
              <div className="rental-car-title">
                {rental.car
                  ? `${rental.car.make} ${rental.car.model}`
                  : "Unknown car"}
              </div>

              <div className="rental-car-info-container">
                <div className="rental-car-image">
                  <img
                    src={rental.car?.mainPhoto}
                    alt={rental.car?.model || "car"}
                  />
                </div>
                <div className="rental-car-info">
                  <p>{`${dateFormat(rental.startDate)} – ${dateFormat(
                    rental.endDate
                  )}`}</p>
                  {rental.pickupLocation && (
                    <p>
                      {rental.pickupLocation.exactSpot},{" "}
                      {rental.pickupLocation.city}
                    </p>
                  )}

                  {typeof rental.totalCost === "number" && (
                    <div className="rental-cost">
                      {rental.discountApplied > 0 ? (
                        <>
                          <span>Total Cost : &nbsp;</span>
                          <span
                            className="currency"
                            style={{
                              textDecoration: "line-through",
                              color: "#999",
                            }}
                          >
                            {(
                              rental.totalCost + rental.discountApplied
                            ).toLocaleString(undefined, {
                              style: "currency",
                              currency: "EGP",
                            })}
                          </span>
                          &nbsp;&nbsp;
                          <span className="currency">
                            {rental.totalCost.toLocaleString(undefined, {
                              style: "currency",
                              currency: "EGP",
                            })}
                          </span>
                        </>
                      ) : (
                        <p>
                          Total cost: &nbsp;
                          <span className="currency">
                            {rental.totalCost.toLocaleString(undefined, {
                              style: "currency",
                              currency: "EGP",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                  {rental.status === "cancelled" && <p className="rental-status-cancelled">Cancelled</p>}

                  {/* Inline modify inputs & buttons */}
                  {editingRentalId === rental._id && (
                    <>
                      <div className="modify-inline">
                        <div className="modify-dates-input">
                          <input
                            type="date"
                            name="startDate"
                            value={editDates.startDate}
                            onChange={handleDateChange}
                          />
                        </div>
                        <div className="modify-dates-input">
                          <input
                            type="date"
                            name="endDate"
                            value={editDates.endDate}
                            onChange={handleDateChange}
                          />
                        </div>
                      </div>
                      <div className="modify-spot">
                        <select
                          name="exactSpot"
                          value={editDates.exactSpot}
                          onChange={(e) =>
                            setEditDates((prev) => ({
                              ...prev,
                              exactSpot: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Pickup Spot</option>
                          {rental.car.location.spots.map((spot, index) => (
                            <option key={index} value={spot}>
                              {spot}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="modify-btns">
                        <Button
                          text="Cancel"
                          color="white"
                          border="1px solid #A8A8A8"
                          textColor="#A8A8A8"
                          onClick={cancelModify}
                        />
                        <Button
                          text="Confirm"
                          onClick={() => confirmModify(rental)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {title === "Upcoming Rentals" &&
                  role === "customer" &&
                  editingRentalId !== rental._id && (
                    <div className="upcomming-rentals-btns">
                      <Button
                        text={"Modify"}
                        onClick={() => startEditing(rental)}
                      />
                      <Button
                        text={"Cancel"}
                        color={"red"}
                        onClick={() => handleCancel(rental)}
                      />
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rentals;
