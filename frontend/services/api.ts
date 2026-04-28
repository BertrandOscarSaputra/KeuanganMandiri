import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3535/api",
});

export default api;
