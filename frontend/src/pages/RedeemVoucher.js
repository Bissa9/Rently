import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Layout, Row, notification } from "antd";
import BackButton from "../components/BackButton";
import { getLoyaltyProgram, redeemPoints } from "../api/loyaltyAPI";

const voucherList = [
  { discount: 10, cost: 10000, image: "/images/voucher10.png" },
  { discount: 20, cost: 20000, image: "/images/voucher20.png" },
  { discount: 30, cost: 30000, image: "/images/voucher30.png" },
  { discount: 40, cost: 40000, image: "/images/voucher40.png" },
];

function RedeemVoucher() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem("token");
        const data= await getLoyaltyProgram(token);
        setPoints(data.loyaltyProgram.pointsBalance);
      } catch (err) {
        console.error("Failed to fetch points", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const availableVouchers = voucherList.filter((v) => points >= v.cost);

  const handleRedeem = async (cost) => {
    const token = localStorage.getItem("token");
    try {
      const result = await redeemPoints(token, cost);
      api.success({
        message: "Success",
        description: `Redeemed! Your discount code: ${result.discountCode}`,
        placement: "top",
        duration: 2,
      });
      navigate("/loyaltyprogram");
    } catch (err) {
      alert(err.response?.data?.message || "Redeem failed");
    }
  };

  if (loading) {
    return <p>Loading your points...</p>;
  }

  return (
    <Layout className="profile-layout">
      {contextHolder}
      <div className="redeem-voucher-container">
        <BackButton />
        <h2>Your points: {points}</h2>

        {availableVouchers.length === 0 && (
          <p className="no-vouchers-message">
            Not enough points to redeem any vouchers.
          </p>
        )}

        <Row gutter={[16, 16]}>
          {availableVouchers.map((voucher) => (
            <Col key={voucher.discount} lg={12} sm={24}>
              <div
                className={`voucher-card ${
                  selectedVoucher?.discount === voucher.discount
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelectedVoucher(voucher)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={voucher.image}
                  alt={`voucher ${voucher.discount}`}
                  width={300}
                  height={180}
                />
                <p>
                  Redeem {voucher.discount}% ({voucher.cost} pts)
                </p>
              </div>
            </Col>
          ))}
        </Row>

        {availableVouchers.length > 0 && (
          <Button
            disabled={!selectedVoucher}
            onClick={() => handleRedeem(selectedVoucher.cost)}
            style={{ marginTop: "20px" }}
          >
            Redeem Voucher
          </Button>
        )}
      </div>
    </Layout>
  );
}

export default RedeemVoucher;
