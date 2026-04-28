import api from "./api";

export const chatService = {
  sendMessage: async (userId: number, message: string) => {
    const res = await api.post("/ai/chat", { userId, message });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get("/ai/chat/history");
    return res.data;
  }
};