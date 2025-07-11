import React from "react";
import "../resources/loyaltyprogram.css";
import { Col, Row } from "antd";

function Vouchers({ vouchers, parsePercentageFromCode }) {
  // Filter unused vouchers only
  const unusedVouchers = vouchers?.filter((voucher) => !voucher.used);

  return (
    <div className="vouchers-display">
      <h1>Your Available Vouchers</h1>

      {unusedVouchers && unusedVouchers.length > 0 ? (
        <Row gutter={[16, 16]}>
          {unusedVouchers.map((voucher, index) => (
            <Col key={index} lg={12} sm={24}>
              <div className="voucher-card">
                <img
                  src={`/images/voucher${parsePercentageFromCode(
                    voucher.code
                  )}.png`}
                  alt={`voucher ${parsePercentageFromCode(voucher.code)}%`}
                />
                <p className="voucher-date">
                  Redeemed: {new Date(voucher.redeemedAt).toLocaleDateString()}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="no-vouchers-message">No available vouchers at the moment.</p>
      )}
    </div>
  );
}

export default Vouchers;
