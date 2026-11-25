# market/views.py

import yfinance as yf
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .constants import USA_MARKET_SYMBOLS, POPULAR_TICKERS

class MarketSearchAPIView(APIView):
    """
    Buscador de mercado de 2 niveles:
    1. Si no hay query: retorna los activos más operados (populares) por defecto.
    2. Si hay query: busca primero en memoria y complementa con Yahoo Finance Search en tiempo real
       permitiendo encontrar cualquier acción o ETF de NYSE / NASDAQ.
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        # Si no hay query, retornar los más operados por defecto
        if not query:
            popular_assets = [item for item in USA_MARKET_SYMBOLS if item['ticker'] in POPULAR_TICKERS]
            return Response({"results": popular_assets, "popular": True})

        query_upper = query.upper()
        cache_key = f"market_search_{query_upper}"
        cached_results = cache.get(cache_key)
        if cached_results is not None:
            return Response({"results": cached_results, "popular": False})

        # Nivel 1: Filtrar en memoria por ticker o nombre
        results = [
            item for item in USA_MARKET_SYMBOLS
            if query_upper in item['ticker'] or query_upper in item['name'].upper()
        ]

        # Nivel 2: Si hay pocas o ninguna coincidencia, buscar en vivo en Yahoo Finance
        if len(results) < 5:
            try:
                search_obj = yf.Search(query, max_results=8)
                existing_tickers = {item['ticker'] for item in results}
                
                for quote in (search_obj.quotes or []):
                    ticker = (quote.get('symbol') or '').upper()
                    # Descartar derivados, futuros o símbolos ya incluidos
                    if not ticker or ticker in existing_tickers or '=' in ticker or '^' in ticker:
                        continue
                    
                    quote_type = quote.get('quoteType', '')
                    if quote_type not in ['EQUITY', 'ETF']:
                        continue

                    name = quote.get('shortname') or quote.get('longname') or ticker
                    exchange = quote.get('exchDisp') or quote.get('exchange') or 'USA'
                    sector = quote.get('sectorDisp') or quote.get('sector') or 'Acción / ETF'

                    results.append({
                        "ticker": ticker,
                        "name": name,
                        "sector": sector,
                        "exchange": exchange
                    })
                    existing_tickers.add(ticker)
                    if len(results) >= 10:
                        break
            except Exception as e:
                # Silencioso para garantizar que siempre responda aunque Yahoo tenga demoras
                pass

        final_results = results[:10]
        cache.set(cache_key, final_results, timeout=300) # Caché de 5 min por término de búsqueda
        return Response({"results": final_results, "popular": False})


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

        # 2. Si no está en caché, consultar a yfinance con soporte para mercado cerrado
        try:
            stock = yf.Ticker(ticker)
            
            # fast_info provee last_price y previous_close de forma inmediata incluso fuera de horario
            fast_info = getattr(stock, 'fast_info', None)
            fast_last = getattr(fast_info, 'last_price', None) if fast_info else None
            fast_prev = getattr(fast_info, 'previous_close', None) if fast_info else None

            info = stock.info or {}
            
            current_price = (
                fast_last or
                info.get("currentPrice") or 
                info.get("regularMarketPrice") or 
                info.get("previousClose")
            )
            previous_close = (
                fast_prev or
                info.get("previousClose") or 
                info.get("regularMarketPreviousClose") or
                current_price
            )
            
            # Si aún no lo encuentra (por ejemplo fin de semana o feriado), recurrir al último cierre histórico
            if not current_price:
                hist = stock.history(period="5d")
                if not hist.empty:
                    current_price = float(hist['Close'].iloc[-1])
                    previous_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else current_price
            
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
                "exchange": info.get("exchange") or "NASDAQ",
                "price": round(float(current_price), 2),
                "previous_close": round(float(previous_close), 2) if previous_close else None,
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "currency": "USD",
                "market_cap": info.get("marketCap"),
                "volume": info.get("regularMarketVolume"),
                "high_52": info.get("fiftyTwoWeekHigh"),
                "low_52": info.get("fiftyTwoWeekLow"),
            }

            # 3. Guardar en caché (120 segundos para evitar saturación de Yahoo)
            cache.set(cache_key, response_data, timeout=120)

            return Response(response_data)

        except Exception as e:
            return Response(
                {"error": f"Error al consultar el activo {ticker}: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )