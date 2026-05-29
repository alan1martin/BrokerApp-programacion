
import api from "../api/axios";

export const getHelloMessage = async () => {
const response = await api.get("/hola/");

return response.data;
};
