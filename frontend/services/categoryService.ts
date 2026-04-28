import api from "./api";

export const getCategories = async (type?: string) => {
  const url = type ? `/categories?type=${type}` : "/categories";
  const res = await api.get(url);
  return res.data;
};

export const addCategory = async (data: { name: string; type: string }) => {
  const res = await api.post("/categories", data);
  return res.data;
};
