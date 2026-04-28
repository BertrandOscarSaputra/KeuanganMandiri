import api from "./api";

export const sendMessage = async (message:string) => {
  const res = await api.post("/chat", { message });
  return res.data;
};