//frontend/src/hooks/use-market-data.js
import { useQuery } from "@tanstack/react-query";

import {
getHelloMessage,
} from "../services/market-service";

export const useMarketData = () => {
return useQuery({
queryKey: ["market-data"],
queryFn: getHelloMessage,
});
};
