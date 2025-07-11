const Car = require("../models/carModel");
const Booking = require("../models/bookingModel");
const cloudinary = require("cloudinary").v2;

const mongoose = require("mongoose");

const uploadImages = async (files) => {
  return await Promise.all(
    files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "rently_cars",
      });
      return result.secure_url;
    })
  );
};

const deleteImages = async (urls) => {
  await Promise.all(
    urls.map(async (url) => {
      const publicId = url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`rently_cars/${publicId}`);
    })
  );
};

const addCar = async (req, res) => {
  try {
    // Parse location from stringified JSON
    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch (err) {
      return res.status(400).json({ message: "Invalid location format" });
    }

    const {
      make,
      model,
      licensePlate,
      color,
      mileage,
      pricePerDay,
      carbonFootprint,
      type,
      fuelType,
      transmissionType,
      description,
      disabled,
      seats
    } = req.body;

    // Validate required fields
    if (
      !make ||
      !model ||
      !licensePlate ||
      !color ||
      !mileage ||
      !pricePerDay ||
      !type ||
      !fuelType ||
      !transmissionType ||
      !location?.city ||
      !Array.isArray(location?.spots) ||
      location.spots.length === 0 ||
      !seats ||
      typeof disabled === "undefined"
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Upload image files
    const uploadedImages = await uploadImages(req.files);
    const mainPhoto = uploadedImages[0];
    const additionalPhotos = uploadedImages.slice(1, 5);

    // Create car in DB
    const car = await Car.create({
      mainPhoto,
      additionalPhotos,
      make,
      model,
      licensePlate,
      color,
      mileage: Number(mileage),
      pricePerDay: Number(pricePerDay),
      carbonFootprint,
      type,
      fuelType,
      transmissionType,
      description,
      location,
      disabled,
      seats: Number(seats),
      owner: req.user._id
    });

    res.status(201).json(car);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let toDelete = [];
    if (req.body.photosToDelete) {
      toDelete = Array.isArray(req.body.photosToDelete)
        ? req.body.photosToDelete
        : JSON.parse(req.body.photosToDelete);

      if (toDelete.length) {
        await deleteImages(toDelete);

        car.additionalPhotos = car.additionalPhotos.filter(
          (url) => !toDelete.includes(url)
        );
        if (toDelete.includes(car.mainPhoto)) car.mainPhoto = null;
      }
    }

    if (req.files && req.files.length) {
      const uploaded = await uploadImages(req.files);

      const replaceMain =
        req.body.replaceMain === "true" || car.mainPhoto === null;

      if (replaceMain) {
        if (car.mainPhoto && !toDelete.includes(car.mainPhoto)) {
          await deleteImages([car.mainPhoto]);
        }
        car.mainPhoto = uploaded.shift();
      }
      car.additionalPhotos.push(...uploaded);
      car.additionalPhotos = car.additionalPhotos.slice(0, 5);
    }

    if (typeof req.body.location === "string") {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (_) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    Object.assign(car, req.body);
    await car.save();

    res.status(200).json(car);
  } catch (err) {
    console.error("Error in updateCar:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const hasActiveBookings = await Booking.exists({
      car: req.params.id,
      status: { $in: ["pending", "completed"] },
    });

    if (hasActiveBookings) {
      return res
        .status(400)
        .json({ message: "Cannot delete a car with active bookings" });
    }

    await deleteImages([car.mainPhoto, ...car.additionalPhotos]);
    await car.deleteOne();

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const {
      type,
      make,
      model,
      minPrice,
      maxPrice,
      sort,
      location,
      seats,
      transmissionType,
      fuelType,
      disabled,
      owner,
      search,
      startDate,
      endDate,
    } = req.query;

    let filter = {};
    if (owner) {
      filter.owner = new mongoose.Types.ObjectId(owner);
    }
    if (make) {
      const makes = Array.isArray(make) ? make : [make];
      filter.make = {
        $in: makes.map((m) => new RegExp(m, "i")),
      };
    }
    if (model) filter.model = model;
    if (type) filter.type = Array.isArray(type) ? { $in: type } : type;
    if (seats) {
      const seatLabels = Array.isArray(seats) ? seats : [seats];

      const seatConditions = seatLabels
        .map((label) => {
          if (label === "6 seats or more") return { $gte: 6 };
          if (label === "5 seats") return 5;
          if (label === "2 seats") return 2;
          return null;
        })
        .filter((val) => val !== null);

      if (seatConditions.length > 0) {
        filter.seats = seatConditions.some((s) => typeof s === "object")
          ? {
              $or: seatConditions.map((s) =>
                typeof s === "object" ? s : { $eq: s }
              ),
            }
          : { $in: seatConditions };
      }
    }

    if (transmissionType) {
      filter.transmissionType = Array.isArray(transmissionType)
        ? { $in: transmissionType }
        : transmissionType;
    }

    if (fuelType) filter.fuelType = fuelType;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {
        ...(minPrice && { $gte: parseFloat(minPrice) }),
        ...(maxPrice && { $lte: parseFloat(maxPrice) }),
      };
    }
    if (location) {
      filter["location.city"] = { $regex: new RegExp(location, "i") };
    }

    if (disabled === "true") {
      filter.disabled = true;
    }
    if (search) {
      const normalizedSearch = search.toLowerCase();
      filter["location.city"] = { $regex: normalizedSearch, $options: "i" };
    }

    //date range filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      //find cars that don't have overlapping bookings
      const overlappingBookings = await Booking.find({
        $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
        status: { $in: ["pending", "completed"] },
      }).distinct("car");

      filter._id = { $nin: overlappingBookings };
    }

    const sortOptions =
      sort === "priceAsc"
        ? { pricePerDay: 1 }
        : sort === "priceDesc"
        ? { pricePerDay: -1 }
        : {};

    const cars = await Car.find(filter).sort(sortOptions);
    const totalCars = await Car.countDocuments(filter);

    res.status(200).json({
      cars,
      totalCars,
    });
  } catch (error) {
    console.error("Error in getAllCars:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addCar, updateCar, deleteCar, getCarById, getAllCars };
