import axios from "axios";

const URL = "/api/booking";

export const getRentalHistory = async (token) => {
  try {
    const response = await axios.get(`${URL}/historyrents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rental history:", error);
    throw error;
  }
};

export const createBooking = async ({ token, payload }) => {
  const response = await axios.post(`${URL}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.booking;
};

// Process payment
export const makePayment = async ({ token, bookingId }) => {
  const response = await axios.post(
    `${URL}/${bookingId}/payment`,
    {}, // No body needed
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data; // So you can access `res.url` for redirect
};


export const completeBooking = async ({ token, bookingId }) => {
  await axios.post(
    `${URL}/${bookingId}/complete`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Update a booking
export const updateBooking = async ({ token, bookingId, updatedData }) => {
  try {
    const response = await axios.put(
      `${URL}/${bookingId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking:", error.response?.data || error.message);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async ({ token, bookingId }) => {
  try {
    const response = await axios.delete(
      `${URL}/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking:", error.response?.data || error.message);
    throw error;
  }
};

export const checkAvailability = async ({ token, carId, startDate, endDate }) => {
  try {
    const response = await axios.post(
      `${URL}/check-availability`,
      { carId, startDate, endDate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking availability:", error.response?.data || error.message);
    throw error;
  }
};

export const hasUserRentedThisCar = async ({token, carId}) => {
  try {
    // 1) fetch the user’s rental history
    const data = await getRentalHistory(token);

    // 2) grab just the “previous” array under asCustomer
    const previousBookings = Array.isArray(data.asCustomer?.previous)
      ? data.asCustomer.previous
      : [];

    // 3) see if any booking’s carId matches the given carId
    const found = previousBookings.some((booking) => {
      // Adjust the field name if your booking model uses “car” instead of “carId”
      return booking.carId?.toString() === carId.toString();
    });

    return found;
  } catch (err) {
    console.error("Error in hasUserRentedThisCar():", err);
    return false;
  }
};