import React, { useState } from "react";
import { Form, Col, Collapse, Button } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "../resources/paymentprocess.css";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { createBooking, makePayment } from "../api/bookingAPI";


const { Panel } = Collapse;

const PaymentProcess = () => {


  const [searchParams] = useSearchParams();
  const carId = searchParams.get("carId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const price = parseFloat(searchParams.get("price"));
  const voucherCode = searchParams.get("voucher");
  const pickupCity = decodeURIComponent(searchParams.get("pickupCity")).trim();
const pickupSpot = decodeURIComponent(searchParams.get("pickupSpot")).trim();

  const [currentStep, setCurrentStep] = useState("4");
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [licenseComplete, setLicenseComplete] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  //create booking state
  const [newBooking, setNewBooking] = useState(false);

  const [form] = Form.useForm();

  const navigate = useNavigate();


 const handlePayment = async () => {
  setIsProcessing(true);
  try {
    const payload = {
      carId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      pickupLocation: {
        city: pickupCity,
        exactSpot: pickupSpot,
      },
      paymentMethod: selectedPayment,
      voucherCode,
    };

    const token = localStorage.getItem("token");

    const bookingResponse = await createBooking({ token, payload });
    setNewBooking(bookingResponse);

    if (selectedPayment === "credit-card") {
      const paymentRes = await makePayment({
        token,
        bookingId: bookingResponse._id,
      });

      window.location.href = paymentRes.url;
    } else {
      toast.success("Booking confirmed. Pay at pickup.", { autoClose: 2000 });
      navigate("/allset");
    }

    console.log("Booking created, payment successful, points added");
  } catch (error) {
    console.error("Error during booking/payment/points:", error);
    toast.error("Something went wrong during payment.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="payment-process-page">
      <BackButton color="var(--dark-grey)" />
      <ToastContainer />
      <Form form={form} layout="vertical">
        <h1>Final steps to drive</h1>

        <Collapse activeKey={currentStep} accordion>
          <Panel
            header="Verify your email"
            key="1"
            extra={emailVerified && <CheckCircleOutlined />}
          ></Panel>

          {emailVerified && (
            <Panel
              header="Verify your phone number"
              key="2"
              extra={phoneVerified && <CheckCircleOutlined />}
            ></Panel>
          )}

          {phoneVerified && (
            <Panel
              header="Your license"
              key="3"
              extra={licenseComplete && <CheckCircleOutlined />}
            ></Panel>
          )}

          {licenseComplete && (
  <Panel
    key="4"
    header="Select Payment Method"
    extra={paymentComplete && <CheckCircleOutlined />}
  >
    <div
      className="payment-option"
      onClick={() => setSelectedPayment("credit-card")}
    >
      <div className={`radio-circle ${selectedPayment === "credit-card" ? "active" : ""}`}></div>
      <span>Credit/Debit Card</span>
    </div>

    <div
      className="payment-option"
      onClick={() => setSelectedPayment("cash")}
    >
      <div className={`radio-circle ${selectedPayment === "cash" ? "active" : ""}`}></div>
      <span>Cash on Pickup</span>
    </div>

    <Col xs={24} style={{ textAlign: "left", marginTop: 30 }}>
      <Button
        className="proceed-button"
        onClick={handlePayment}
        loading={isProcessing}
        disabled={!selectedPayment}
      >
        {selectedPayment === "cash" ? "Proceed with Cash" : "Proceed to Payment"}
      </Button>
    </Col>
  </Panel>
)}

        </Collapse>
      </Form>
    </div>
  );
};

export default PaymentProcess;
