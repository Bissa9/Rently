import axios from "axios";

const URL = "/api/loyaltyprog";

export const getLoyaltyProgram = async (token) => {
  const res = await axios.get(URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const redeemPoints = async (token, pointsToRedeem) => {
  const res = await axios.post(
    `${URL}/redeem`,
    { pointsToRedeem },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
