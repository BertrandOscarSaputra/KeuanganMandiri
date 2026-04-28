import api from "./api";

export const getTransactions = async () => {
  const res = await api.get("/transactions");
  return res.data;
};

export const addTransaction = async (data:any) => {
  const res = await api.post("/transactions", data);
  return res.data;
};