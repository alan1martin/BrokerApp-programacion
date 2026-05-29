
import api from "./api";

export async function getPortfolio() {
  const response =
    await api.get("/portfolio/");

  return response.data;
}
