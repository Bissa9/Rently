import axios from "axios";

const URL = "/api/review/";

const createReview = async ({reviewData, token}) => {
  const res = await axios.post(`${URL}`,reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const getCarReviews = async (carId) => {
  const res = await axios.get(`${URL}car/${carId}`);
  return res.data;
};

const updateReview = async ({reviewId, updateData, token}) => {
  const res = await axios.put(`${URL}${reviewId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const deleteReview = async ({reviewId, token}) => {
  const res = await axios.delete(`${URL}${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export{createReview, getCarReviews,updateReview,deleteReview};