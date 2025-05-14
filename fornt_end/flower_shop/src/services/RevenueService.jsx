import axios from "../axiosInstance";

export const getRevenueData = async () => {
  const response = await axios.get("/api/revenue");
  return response.data;
};