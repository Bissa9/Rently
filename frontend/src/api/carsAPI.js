import axios from "axios";

const URL = "/api/cars/";

export const getCars = async (queryParams) => {
  try {
    const response = await axios.get(URL, {
      params: queryParams,
    });
    return response;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};
export const getCarById = (id) =>
  axios.get(`${URL}${id}`).then((res) => res.data);

export const addCar = async (carData) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(URL, carData, config);
    return response.data;
  } catch (error) {
    console.error("Error adding car:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCar = async ({ carId, updateData, token }) => {
  const res = await axios.put(`${URL}${carId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteCar = async ({ carId, token }) => {
  const res = await axios.delete(`${URL}${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
