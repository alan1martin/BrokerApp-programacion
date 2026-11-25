# market/views.py

import yfinance as yf
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .constants import USA_MARKET_SYMBOLS, POPULAR_TICKERS

class MarketSearchAPIView(APIView):
    """
    Buscador ligero y rápido. Filtra tickers o nombres de empresas en memoria.
    No realiza consultas a Yahoo Finance.
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip().upper()
        
        # Si no hay query, retornar los más operados por defecto
        if not query:
            popular_assets = [item for item in USA_MARKET_SYMBOLS if item['ticker'] in POPULAR_TICKERS]
            return Response({"results": popular_assets, "popular": True})

        # Filtrar coincidencias por ticker o nombre comercial
        results = [
            item for item in USA_MARKET_SYMBOLS
            if query in item['ticker'] or query in item['name'].upper()
        ]
        
        return Response({"results": results[:10], "popular": False})


class AssetDetailAPIView(APIView):
    """
    Obtiene la cotización en tiempo real de un activo mediante yfinance.
    Aplica caché de 60 segundos por ticker para evitar desbordes de rate limit.
    """
    def get(self, request, ticker):
        ticker = ticker.upper()
        cache_key = f"market_data_{ticker}"
        
        # 1. Intentar obtener de la caché local de Django
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # 2. Si no está en caché, consultar a yfinance
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            current_price = info.get("currentPrice") or info.get("regularMarketPrice")
            previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
            
            if not current_price:
                return Response(
                    {"error": f"No se pudo obtener la cotización para {ticker}."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0

            response_data = {
                "ticker": ticker,
                "name": info.get("shortName") or info.get("longName") or ticker,
                "price": round(current_price, 2),
                "previous_close": round(previous_close, 2) if previous_close else None,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "currency": "USD",
                "market_cap": info.get("marketCap"),
                "volume": info.get("regularMarketVolume"),
                "high_52": info.get("fiftyTwoWeekHigh"),
                "low_52": info.get("fiftyTwoWeekLow"),
            }

            # 3. Guardar en caché por 60 segundos
            cache.set(cache_key, response_data, timeout=60)

            return Response(response_data)

        except Exception as e:
            return Response(
                {"error": f"Error al consultar el activo {ticker}: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )