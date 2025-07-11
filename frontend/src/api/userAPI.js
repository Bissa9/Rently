import axios from "axios";

const URL = "/api";

const signup = async (userData) => {
  try {
    const response = await axios.post(`${URL}/auth/register`, userData);
    return {
      success: true,
      message: response.data.message,
      data: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${URL}/auth/login`, {
      email,
      password,
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || error.message); // Rethrow error for further handling
  }
};

const becomeCarOwner = (token) => {
  return axios.put(
    `${URL}/users/become-car-owner`, 
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    }
  );
};

const requestPasswordReset = async (email) => {
  try {
    const res = await axios.post(`${URL}/auth/forgot-password`, { email });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};
const verifyResetCode = async ({ email, resetCode }) => {
  try {
    const res = await axios.post(`${URL}/auth/verify-reset-code`, {
      email,
      resetCode,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

const resetPassword = async ({ email, newPassword }) => {
  try {
    const res = await axios.post(`${URL}/auth/reset-password`, {
      email,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};
const updateUserProfile = async (updatedFields) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${URL}/users/update-profile`,
      updatedFields,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const checkOldPassword = async (oldPassword, token) => {
  try {
    const response = await axios.post(
      `${URL}/users/check-password`,
      { oldPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const updatePassword = async (oldPassword, newPassword, token) => {
  try {
    const response = await axios.post(
      `${URL}/users/update-password`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
const resendVerification = async (email) => {
  try {
    const response = await axios.post(`${URL}/auth/resend-verification-email`, {
      email,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Server error",
    };
  }
};
const getOwnerEarnings = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("/api/booking/owner/earnings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export {
  signup,
  login,
  getUserProfile,
  becomeCarOwner,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  updateUserProfile,
  checkOldPassword,
  updatePassword,
  resendVerification,
  getOwnerEarnings
};
