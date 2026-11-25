// src/utils/get-logo.js

/**
 * Devuelve la URL del logo oficial en base al símbolo del activo
 * @param {string} symbol - Ejemplo: "AAPL", "BTC", "TSLA"
 * @returns {string} URL de la imagen
 */
export const getAssetLogo = (symbol) => {
  const cleanSymbol = symbol?.toUpperCase().trim();

  // Mapeo con links alternativos y ultra estables de alta definición
  const logoMap = {
    // Acciones (Usando un servicio multicanal muy estable)
    AAPL: "https://unavatar.io/twitter/apple",
    TSLA: "https://unavatar.io/twitter/tesla",
    NVDA: "https://unavatar.io/twitter/nvidia",
    MSFT: "https://unavatar.io/twitter/microsoft",
    AMZN: "https://unavatar.io/twitter/amazon",
    META: "https://unavatar.io/twitter/meta",
    GOOGL: "https://unavatar.io/twitter/google",
    
    // Criptos usando el CDN oficial de CoinGecko (que ya vimos que te funcionó perfecto)
    BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    USDT: "https://assets.coingecko.com/coins/images/325/large/tether.png",
    // Cash / Dólares
    CASH: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%231b281e'/><circle cx='50' cy='50' r='45' stroke='%234caf50' stroke-width='4' fill='none'/><text x='50%' y='68%' font-size='56' font-family='Arial, sans-serif' font-weight='bold' fill='%234caf50' text-anchor='middle'>$</text></svg>",
    USD: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%231b281e'/><circle cx='50' cy='50' r='45' stroke='%234caf50' stroke-width='4' fill='none'/><text x='50%' y='68%' font-size='56' font-family='Arial, sans-serif' font-weight='bold' fill='%234caf50' text-anchor='middle'>$</text></svg>",
  };

  // Si el activo está en el mapa lo devuelve, sino genera un avatar con un color aleatorio basado en el símbolo
  return logoMap[cleanSymbol] || `https://ui-avatars.com/api/?name=${cleanSymbol}&background=2196f3&color=fff&bold=true`;
};