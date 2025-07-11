import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  Form,
  Input,
  Upload,
  Checkbox,
  InputNumber,
  Typography,
  Row,
  Col,
  Select,
} from "antd";
import BackButton from "../components/BackButton";
import { addCar } from "../api/carsAPI";
import "../resources/carListing.css";
const { Content } = Layout;
const { Title, Text } = Typography;

function CarListing() {
  const navigate = useNavigate();
  const { Option } = Select;
  const [city, setCity] = useState("");
  const [spotInput, setSpotInput] = useState("");
  const [spots, setSpots] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      location: {
        city,
        spots,
      },
    });
  }, [city, spots]);

  const handleAddSpot = () => {
    const trimmed = spotInput.trim();
    if (!trimmed) return;

    const capitalized = capitalizeFirstLetter(trimmed);
    if (spots.includes(capitalized)) {
      message.warning("Spot already added");
      return;
    }
    if (spots.length >= 5) {
      message.error("Maximum 5 spots allowed");
      return;
    }
    setSpots([...spots, capitalized]);
    setSpotInput("");
  };

  const handleRemoveSpot = (indexToRemove) => {
    const updatedSpots = spots.filter((_, i) => i !== indexToRemove);
    setSpots(updatedSpots);
  };

  const capitalizeFirstLetter = (str) => {
    if (typeof str !== "string" || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      if (values.disabled === undefined) {
        values.disabled = false;
      }
      if (values.model && values.year) {
        values.model = `${values.model} ${values.year}`;
        delete values.year;
      }
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === "string") {
          values[key] = capitalizeFirstLetter(values[key].trim());
        }
      });

      Object.entries(values).forEach(([key, value]) => {
        if (key === "images") {
          value.fileList.forEach((file) => {
            formData.append("images", file.originFileObj);
          });
        } else if (key === "location") {
          formData.append("location", JSON.stringify(value)); // ✅ Serialize location
        } else if (typeof value !== "undefined") {
          formData.append(key, value);
        }
      });
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await addCar(formData);
      console.log("Car added successfully:", response.data);
      navigate(-1);
    } catch (error) {
      console.error(
        "Failed to add car:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <Layout className="profile-layout">
      <BackButton />

      <Content style={{ padding: "2rem" }}>
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <div className="car-listing-box">
            <Title level={4}>Car Images</Title>
            <Text type="secondary">
              Upload High-Quality Images of Your Car (We recommend uploading at
              least three images: one of the car’s front, one from the back, and
              one of the interior for a complete view.)
            </Text>
            <Form.Item name="images" rules={[{ required: true }]}>
              <Upload
                listType="picture"
                multiple
                maxCount={5}
                beforeUpload={() => false}
                accept=".jpg,.jpeg,.png,.webp"
              >
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              </Upload>
            </Form.Item>
          </div>
          <div className="car-listing-box">
            <Title level={4}>Car Details</Title>
            <Row gutter={10}>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="make"
                  label="Make"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., Toyota, BMW" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="model"
                  label="Model"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., Corolla, C15" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="year"
                  label="Year"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    placeholder="e.g., 2020, 2021"
                    min={1990}
                    max={2025}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="licensePlate"
                  label="License Plate"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., ABC123" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select car type">
                    {[
                      "SUV",
                      "Sedan",
                      "Hatchback",
                      "Coupe",
                      "Cabriolet",
                      "Van",
                      "Truck",
                      "Minibus",
                      "Luxury",
                      "Sports",
                    ].map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="color"
                  label="Color"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g., Black, Blue" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="seats"
                  label="Seats"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder="e.g., 5, 7"
                  />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="transmissionType"
                  label="Transmission Type"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select transmission type">
                    {["Manual", "Automatic"].map((trans) => (
                      <Option key={trans} value={trans}>
                        {trans}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="fuelType"
                  label="Fuel Type"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select fuel type">
                    {["Gasoline", "Diesel", "Electric", "Hybrid"].map(
                      (fuel) => (
                        <Option key={fuel} value={fuel}>
                          {fuel}
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="mileage"
                  label="Mileage"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="e.g., 6000"
                  />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="carbonFootprint"
                  label="Carbon Footprint"
                  rules={[{ required: true}]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="e.g., 124"
                  />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8} md={12}>
                <Form.Item
                  name="disabled"
                  label="Accessibility"
                  valuePropName="checked"
                  tooltip="Mark this if the car is accessible for disabled people"
                >
                  <Checkbox>
                    This car is accessible for disabled people
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="car-listing-box">
            <Title level={4}>Pricing</Title>
            <Form.Item
              name="pricePerDay"
              label="Price per day (EGP)"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="e.g., 2000, 3000 EGP  "
              />
            </Form.Item>
          </div>
          <div className="car-listing-box">
            <Title level={4}>Location</Title>
            <Row gutter={10}>
              <Col sm={24} lg={12} md={12}>
                <Form.Item
                  name={["location", "city"]}
                  label="City"
                  rules={[{ required: true, message: "Please enter the city" }]}
                >
                  <Input
                    placeholder="e.g., Cairo, Giza"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim();
                      setCity(capitalizeFirstLetter(trimmed));
                    }}
                  />
                </Form.Item>
              </Col>

              <Col sm={24} lg={12} md={12}>
                <Form.Item label="Add Handover Spot">
                  <Input.Group compact>
                    <Input
                      style={{ width: "calc(100% - 80px)" }}
                      placeholder="e.g., Nasr City"
                      value={spotInput}
                      onChange={(e) => setSpotInput(e.target.value)}
                      onPressEnter={() => handleAddSpot()}
                    />
                    <Button icon={<PlusOutlined />} onClick={handleAddSpot}>
                      Add
                    </Button>
                  </Input.Group>
                </Form.Item>

                <div style={{ marginTop: "10px" }}>
                  {spots.map((spot, index) => (
                    <div key={index} className="add-spot">
                      <span>{spot}</span>
                      <CloseOutlined
                        onClick={() => handleRemoveSpot(index)}
                        className="remove-spot"
                      />
                    </div>
                  ))}
                </div>

                {/* Hidden Form field to include spots in final values */}
                <Form.Item
                  name={["location", "spots"]}
                  initialValue={[]}
                  rules={[
                    { required: true, message: "Please add at least one spot" },
                    {
                      validator: (_, value) =>
                        value.length <= 5
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("You can add up to 5 spots")
                            ),
                    },
                  ]}
                >
                  <Input type="hidden" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Title level={4}>Additional Features and Notes</Title>
          <Form.Item name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button className="car-list-submit" htmlType="submit">
              List My Car
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}

export default CarListing;
