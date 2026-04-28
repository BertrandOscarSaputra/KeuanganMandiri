import api from "./api";

export const analyticsService = {
  getDashboard: async () => {
    const res = await api.get("/analytics/dashboard");
    return res.data;
  }
};
