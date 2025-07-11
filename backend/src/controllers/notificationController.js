const Car = require("../models/carModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Notification = require("../models/notificationModel");
const { sendEmail } = require("../utils/emailService");

const createBookingNotification = async ({
  userId,
  carId,
  userEmail,
  startDate,
  endDate,
  pickupLocation,
  paymentMethod,
  totalCost,
}) => {
  if (
    !userId ||
    !carId ||
    !userEmail ||
    !startDate ||
    !endDate ||
    !pickupLocation ||
    !paymentMethod ||
    !totalCost
  ) {
    throw new Error("Missing required fields");
  }

  const car = await Car.findById(carId).populate("owner", "email");
  const user = await User.findById(userId);
  const owner = await User.findById(car.owner);
  if (!car) {
    throw new Error("Car not found");
  }

  const formattedStartDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startDate));
  const formattedEndDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(endDate));

  const message = `Car Rental Confirmation\n\nCar: ${car.make} ${car.model}\nPickup Location: ${pickupLocation.address.city}, ${pickupLocation.address.exactSpot}\nStart Date: ${formattedStartDate}\nEnd Date: ${formattedEndDate}\n\nThank you for choosing our service. Have a safe trip!`;

  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2E86C1;">Car Rental Confirmation</h2>
      <p><strong>Car:</strong> ${car.make} ${car.model}</p>
      <p><strong>Host Phone:</strong> ${owner.phone || "Not Provided"}</p>
      <p><strong>Pickup Location:</strong> ${pickupLocation.address.city}, ${pickupLocation.address.exactSpot}</p>
      <p><strong>Start Date:</strong> ${formattedStartDate}</p>
      <p><strong>End Date:</strong> ${formattedEndDate}</p>
      <p><strong>Total Cost:</strong> EGP ${totalCost.toFixed(2)}</p>
      <p>Thank you for choosing our service. Have a safe trip!</p>
    </div>
  `;

  const hostHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #27AE60;">Your Car Has Been Booked</h2>
      <p>${user.firstName }has booked your car</p>
      <p><strong>Car:</strong> ${car.make} ${car.model}</p>
      <p><strong>Pickup Location:</strong> ${pickupLocation.address.city}, ${pickupLocation.address.exactSpot}</p>
      <p><strong>Start Date:</strong> ${formattedStartDate}</p>
      <p><strong>End Date:</strong> ${formattedEndDate}</p>
      <p><strong>Renter Email:</strong> ${user.email}</p>
      <p><strong>Renter Phone:</strong> ${user.phone || "Not Provided"}</p>
      <p><strong>Total Cost:</strong> EGP ${totalCost.toFixed(2)}</p>
      <p>You can prepare your car and contact the renter if needed.</p>
    </div>
  `;

  const notification = new Notification({
    message: `Booking confirmed for ${car.make} ${car.model}`,
    user: userId,
    status: "sent",
  });
  await notification.save();

  // Send emails
  await sendEmail(userEmail, "Car Rental Confirmation", userHtml);
if (car.owner && car.owner.email) {
  try {
    console.log("Sending email to host:", car.owner.email);
    await sendEmail(car.owner.email, "New Booking for Your Car", hostHtml);
  } catch (err) {
    console.error("Failed to send email to host:", err.message);
  }
} else {
  console.warn("Car owner email not available or not populated.");
}

  return notification;
};

const cancelBookingNotification = async ({ bookingId, userEmail }) => {
  // Find the booking with populated car and owner data
  const booking = await Booking.findById(bookingId).populate({
    path: "car",
    populate: { path: "owner", select: "email" },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Common details
  const city = booking.pickupLocation.address.city;
  const exactSpot = booking.pickupLocation.address.exactSpot;
  const formattedStart = new Date(booking.startDate).toLocaleString();
  const formattedEnd = new Date(booking.endDate).toLocaleString();
  const carName = `${booking.car.make} ${booking.car.model}`;

  // Email for renter
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #E74C3C;">Car Rental Cancellation</h2>
      <p><strong>Car:</strong> ${carName}</p>
      <p><strong>Pickup Location:</strong> ${city}, ${exactSpot}</p>
      <p><strong>Start Date:</strong> ${formattedStart}</p>
      <p><strong>End Date:</strong> ${formattedEnd}</p>
      <p>Your booking has been cancelled. If this was a mistake, you can book again anytime.</p>
    </div>
  `;

  // Email for host
  const hostHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #C0392B;">Booking Cancelled for Your Car</h2>
      <p><strong>Car:</strong> ${carName}</p>
      <p><strong>Pickup Location:</strong> ${city}, ${exactSpot}</p>
      <p><strong>Start Date:</strong> ${formattedStart}</p>
      <p><strong>End Date:</strong> ${formattedEnd}</p>
      <p>The renter has cancelled their booking.</p>
    </div>
  `;

  // Save notification for renter
  const notification = new Notification({
    message: `Car Rental Cancellation\n\nYour booking for ${carName} has been cancelled.`,
    user: booking.user,
    status: "sent",
  });
  await notification.save();

  // Send email to renter
  await sendEmail(userEmail, "Car Rental Cancellation", userHtml);

  // Send email to host if email exists
  if (booking.car.owner?.email) {
    await sendEmail(
      booking.car.owner.email,
      "Booking Cancelled for Your Car",
      hostHtml
    );
  } else {
    console.warn("Car owner email not found. Skipping host cancellation email.");
  }

  return notification;
};

const modifyBookingNotification = async ({ bookingId, newStartDate, newEndDate, userEmail , totalCost }) => {
  try {
    // 1. Populate car and car.owner
    const booking = await Booking.findById(bookingId).populate({
      path: "car",
      populate: { path: "owner", select: "email" },
    });
    if (!booking) {
      throw new Error("Booking not found");
    }

    // 2. Update start and end dates
    const parsedStart = new Date(newStartDate);
    const parsedEnd = new Date(newEndDate);
    if (newStartDate && !isNaN(parsedStart)) booking.startDate = parsedStart;
    if (newEndDate && !isNaN(parsedEnd)) booking.endDate = parsedEnd;

    await booking.save();

    // 3. Format date/time and location
    const formattedStartDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(booking.startDate);

    const formattedEndDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(booking.endDate);

    const city = booking.pickupLocation?.address?.city || "N/A";
    const exactSpot = booking.pickupLocation?.address?.exactSpot || "N/A";

    // 4. Email message for renter
    const userHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #F39C12;">Car Rental Update</h2>
        <p><strong>Car:</strong> ${booking.car.make} ${booking.car.model}</p>
        <p><strong>New Start Date:</strong> ${formattedStartDate}</p>
        <p><strong>New End Date:</strong> ${formattedEndDate}</p>
        <p><strong>Pickup Location:</strong> ${city}, ${exactSpot}</p>
        <p><strong>Total Cost:</strong> EGP ${totalCost.toFixed(2)}</p>
        <p>Your booking has been successfully updated.</p>
      </div>
    `;

    // 5. Email message for host
    const hostHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3498DB;">Booking Updated for Your Car</h2>
        <p><strong>Car:</strong> ${booking.car.make} ${booking.car.model}</p>
        <p><strong>Updated Start Date:</strong> ${formattedStartDate}</p>
        <p><strong>Updated End Date:</strong> ${formattedEndDate}</p>
        <p><strong>Pickup Location:</strong> ${city}, ${exactSpot}</p>
        <p><strong>Total Cost:</strong> EGP ${totalCost.toFixed(2)}</p>
        <p>A renter has modified their booking details.</p>
      </div>
    `;

    // 6. Save notification for user
    const notification = new Notification({
      message: `Car Rental Update\n\nYour booking for ${booking.car.make} ${booking.car.model} has been updated.`,
      user: booking.user,
      status: "sent",
    });
    await notification.save();

    // 7. Send email to renter
    await sendEmail(userEmail, "Car Rental Update", userHtml);

    // 8. Send email to host (car owner)
    if (booking.car.owner && booking.car.owner.email) {
      await sendEmail(booking.car.owner.email, "Booking Updated for Your Car", hostHtml);
    } else {
      console.warn("Car owner email missing. Skipping host email.");
    }

    return notification;
  } catch (error) {
    console.error("Error modifying booking:", error.message);
    throw error;
  }
};

module.exports = {
  createBookingNotification,
  cancelBookingNotification,
  modifyBookingNotification,
};
