import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCarById, updateCar } from "../api/carsAPI";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "../resources/editcar.css";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";

const MAX_ADDITIONAL = 4;

const EditCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    fuelType: "",
    seats: "",
    transmissionType: "",
    location: "",
    spots: [],
    pricePerDay: "",
    mileage: "",
    carbonFootprint: "",
    color: "",
    description: "",
  });
  const [mainFileList, setMainFileList] = useState([]);
  const [additionalFileList, setAdditionalFileList] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carId) {
      navigate(-1);
      return;
    }
    (async () => {
      try {
        const data = await getCarById(carId);
        setFormData({
          make: data.make,
          model: data.model,
          fuelType: data.fuelType || "",
          seats: data.seats || "",
          transmissionType: data.transmissionType || "",
          location: data.location?.city || "",
          spots: data.location?.spots || [],
          pricePerDay: data.pricePerDay || "",
          mileage: data.mileage || "",
          carbonFootprint: data.carbonFootprint || "",
          color: data.color || "",
          description: data.description || "",
        });
        if (data.mainPhoto) {
          setMainFileList([{ uid: "-1", status: "done", url: data.mainPhoto }]);
        }
        if (data.additionalPhotos) {
          setAdditionalFileList(
            data.additionalPhotos.map((url, idx) => ({
              uid: String(idx),
              status: "done",
              url,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [carId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!mainFileList.length) errs.mainPhoto = "Main photo is required";
    setErrors(errs);
    console.log(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("after validation");

    const token = localStorage.getItem("token");
    console.log("Token in handleSubmit:", token);
    const payload = new FormData();

    // Append all non-location fields
    Object.entries(formData).forEach(([key, val]) => {
      if (!(key == "location" || key == "spots")) {
        payload.append(key, val);
      }
    });

    // Special handling for location and spots fields - Option 1
    const city = formData.location || "";
    const spots = formData.spots || [];

    // Append location fields directly
    payload.append("location[city]", city);

    // Append spots as array
    spots.forEach((spot) => {
      payload.append("location[spots][]", spot);
    });

    // Handle file uploads
    const allPhotos = [...mainFileList, ...additionalFileList];
    allPhotos.forEach((file) => {
      if (file.originFileObj) payload.append("images", file.originFileObj);
    });

    try {
      await updateCar({
        carId,
        updateData: payload,
        token,
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      message.error("Failed to update car");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="edit-car-container">
      <BackButton />
      <h2>Edit Your Car</h2>
      <form onSubmit={handleSubmit} className="edit-car-form">
        <div className="form-row two-cols">
          <div className="form-group">
            <label>Make</label>
            <input name="make" value={formData.make} disabled />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input name="model" value={formData.model} disabled />
          </div>
        </div>

        <div className="form-row two-cols">
          <div className="form-group">
            <label>Fuel Type</label>
            <input name="fuelType" value={formData.fuelType} disabled />
          </div>
          <div className="form-group">
            <label>Seats</label>
            <input name="seats" value={formData.seats} disabled />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Transmission</label>
            <input
              name="transmissionType"
              value={formData.transmissionType}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Mileage</label>
            <input name="mileage" value={formData.mileage} disabled />
          </div>
          <div className="form-group">
            <label>Price Per Day</label>
            <input
              name="pricePerDay"
              type="number"
              value={formData.pricePerDay}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Carbon Footprint</label>
            <input
              name="carbonFootprint"
              value={formData.carbonFootprint}
              disabled
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Spots (max 5)</label>
            {formData.spots.map((spot, idx) => (
              <div key={idx} className="spots-edit-row">
                <input
                  value={spot}
                  onChange={(e) => {
                    const updatedSpots = [...formData.spots];
                    updatedSpots[idx] = e.target.value;
                    setFormData({ ...formData, spots: updatedSpots });
                  }}
                />
                <button
                  type="button"
                  className="remove-spots-btn"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      spots: formData.spots.filter((_, i) => i !== idx),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.spots.length < 5 && (
              <button
                type="button"
                className="addphoto"
                onClick={() =>
                  setFormData({ ...formData, spots: [...formData.spots, ""] })
                }
              >
                Add Spot
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            style={{ height: "auto" }}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Main Photo</label>
          <Upload
            accept=".jpg,.jpeg,.png,.webp"
            listType="picture-card"
            fileList={mainFileList}
            maxCount={1}
            beforeUpload={() => false}
            onChange={({ fileList }) => setMainFileList(fileList)}
          >
            {mainFileList.length < 1 && (
              <div>
                <UploadOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
          {errors.mainPhoto && <p className="error-text">{errors.mainPhoto}</p>}
        </div>

        <div className="form-group">
          <label>Additional Photos (up to {MAX_ADDITIONAL})</label>
          <Upload
            accept=".jpg,.jpeg,.png,.webp"
            listType="picture-card"
            multiple
            fileList={additionalFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => {
              if (fileList.length > MAX_ADDITIONAL) {
                message.warning(`Maximum of ${MAX_ADDITIONAL} photos allowed.`);
                return;
              }
              setAdditionalFileList(fileList);
            }}
            onRemove={(file) =>
              setAdditionalFileList((prev) =>
                prev.filter((f) => f.uid !== file.uid)
              )
            }
          >
            {additionalFileList.length < MAX_ADDITIONAL && (
              <div>
                <UploadOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <div className="edit-car-btns-container">
          <button className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCar;
