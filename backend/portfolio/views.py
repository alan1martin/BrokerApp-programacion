from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from decimal import Decimal
import yfinance as yf

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse

from .models import Portfolio, Position, Transaction
from .serializers import PortfolioSerializer, TransactionSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stock_history(request, symbol):
    try:
        ticker_symbol = symbol.upper()
        if ticker_symbol in ['BTC', 'ETH', 'SOL']:
            ticker_symbol = f"{ticker_symbol}-USD"

        ticker = yf.Ticker(ticker_symbol)
        hist = ticker.history(period="7d", interval="15m")
        
        if hist.empty:
            return JsonResponse({'error': f'No se encontraron datos para el activo {symbol}'}, status=404)

        history_data = []
        for index, row in hist.iterrows():
            history_data.append({
                'date': index.strftime('%Y-%m-%d %H:%M'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume'])
            })

        info = ticker.info
        company_name = info.get('longName', symbol)
        current_price = round(info.get('currentPrice', history_data[-1]['close']), 2)

        return JsonResponse({
            'symbol': symbol.upper(),
            'companyName': company_name,
            'currentPrice': current_price,
            'history': history_data
        }, safe=False)

    except Exception as e:
        print(f"Error en get_stock_history: {str(e)}")
        return JsonResponse({'error': 'Error interno al consultar Yahoo Finance'}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_portfolio(request):
    user = request.user
    Transaction.objects.filter(portfolio__user=user).delete()
    
    portfolio, created = Portfolio.objects.get_or_create(user=user)
    portfolio.cash_balance = Decimal('10000.00')
    portfolio.total_value = Decimal('10000.00')
    portfolio.save()
    
    Position.objects.filter(portfolio=portfolio).delete()
    
    return Response({"message": "Cuenta reseteada con éxito. Volvés a tener $10,000.00 USD!"}, status=status.HTTP_200_OK)

class TransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        portfolio = get_object_or_404(Portfolio, user=request.user)
        transactions = Transaction.objects.filter(portfolio=portfolio).order_by('-timestamp')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PortfolioDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        positions = Position.objects.filter(portfolio=portfolio)
        
        total_stocks_value = Decimal('0.00')
        
        for pos in positions:
            current_price = None
            try:
                symbol_yf = pos.symbol.upper()
                if symbol_yf in ['BTC', 'ETH', 'SOL']:
                    symbol_yf = f"{symbol_yf}-USD"

                ticker = yf.Ticker(symbol_yf)
                fast_info = ticker.fast_info
                last_price = fast_info.get('lastPrice')
                
                if last_price is not None:
                    current_price = Decimal(str(round(last_price, 2)))
                else:
                    hist = ticker.history(period="1d")
                    if not hist.empty:
                        close_price = hist['Close'].iloc[-1]
                        current_price = Decimal(str(round(close_price, 2)))
            
            except Exception as e:
                print(f"Error al consultar precio en vivo para {pos.symbol}: {e}")
            
            if current_price is None:
                print(f"Usando precio promedio como backup para {pos.symbol}")
                current_price = Decimal(str(pos.average_price))

            total_stocks_value += Decimal(str(pos.quantity)) * current_price

        portfolio.total_value = portfolio.cash_balance + total_stocks_value
        portfolio.save()
        
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ExecuteTradeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        serializer = TransactionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        symbol = serializer.validated_data['symbol'].upper()
        trade_type = serializer.validated_data['transaction_type']
        quantity = Decimal(str(serializer.validated_data['quantity']))
        price = Decimal(str(serializer.validated_data['price']))

        trade_total_cost = quantity * price

        position, created = Position.objects.get_or_create(
            portfolio=portfolio,
            symbol=symbol,
            defaults={'quantity': Decimal('0.00'), 'average_price': Decimal('0.00')}
        )

        if trade_type == 'BUY':
            if portfolio.cash_balance < trade_total_cost:
                return Response(
                    {"error": f"Saldo insuficiente. Necesitás ${trade_total_cost:,.2f} y tenés ${portfolio.cash_balance:,.2f} en cuenta."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            current_total_cost = position.quantity * position.average_price
            new_trade_cost = quantity * price
            
            position.quantity += quantity
            position.average_price = (current_total_cost + new_trade_cost) / position.quantity
            position.save()

            portfolio.cash_balance -= trade_total_cost
            portfolio.save()

        elif trade_type == 'SELL':
            if position.quantity < quantity:
                return Response(
                    {"error": f"No tenés suficientes unidades de {symbol}. Tenés {position.quantity} y querés vender {quantity}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            position.quantity -= quantity
            
            if position.quantity == 0:
                position.delete()
            else:
                position.save()

            portfolio.cash_balance += trade_total_cost
            portfolio.save()

        serializer.save(portfolio=portfolio, symbol=symbol)

        return Response({
            "message": f"Orden de {trade_type} ejecutada con éxito.",
            "cash": str(portfolio.cash_balance),
            "position": {
                "symbol": symbol,
                "current_quantity": str(position.quantity if position.id else 0),
                "average_price": str(position.average_price if position.id else 0)
            }
        }, status=status.HTTP_201_CREATED)

class DepositWithdrawCashView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        action_type = request.data.get('transaction_type')
        amount_str = request.data.get('amount')
        
        if not action_type or not amount_str:
            return Response({"error": "Faltan datos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(str(amount_str))
            if amount <= 0:
                return Response({"error": "El monto debe ser mayor a cero."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"error": "Monto inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if action_type == 'DEPOSIT':
            portfolio.cash_balance += amount
            db_type = 'DEP'
            msg = f"Depósito exitoso. Se sumaron ${amount:,.2f} a tu cuenta."
        
        elif action_type == 'WITHDRAW':
            if portfolio.cash_balance < amount:
                return Response(
                    {"error": f"Fondo insuficiente. Tenés ${portfolio.cash_balance:,.2f}."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            portfolio.cash_balance -= amount
            db_type = 'WIT'
            msg = f"Retiro exitoso. Se extrajeron ${amount:,.2f} de tu cuenta."
        else:
            return Response({"error": "Tipo de operación inválida."}, status=status.HTTP_400_BAD_REQUEST)

        portfolio.save()

        Transaction.objects.create(
            portfolio=portfolio,
            symbol="CASH",  
            transaction_type=db_type, 
            quantity=Decimal('1.00'),
            price=amount
        )

        return Response({
            "message": msg,
            "cash": str(portfolio.cash_balance)
        }, status=status.HTTP_200_OK)
    
class AssetCompositionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio = get_object_or_404(Portfolio, user=request.user)
        cash = float(portfolio.cash_balance)
        positions = Position.objects.filter(portfolio=portfolio)
        
        assets_data = []
        total_stocks_value = 0.0
        
        for pos in positions:
            qty = float(pos.quantity)
            if qty > 0:
                current_price = None
                try:
                    symbol_yf = pos.symbol.upper()
                    if symbol_yf in ['BTC', 'ETH', 'SOL']:
                        symbol_yf = f"{symbol_yf}-USD"
                        
                    ticker = yf.Ticker(symbol_yf)
                    fast_info = ticker.fast_info
                    last_price = fast_info.get('lastPrice')
                    
                    if last_price is not None:
                        current_price = float(last_price)
                    else:
                        hist = ticker.history(period="1d")
                        if not hist.empty:
                            current_price = float(hist['Close'].iloc[-1])
                except Exception as e:
                    print(f"Error composition yf para {pos.symbol}: {e}")
                
                if current_price is None:
                    current_price = float(pos.average_price)
                    
                value = qty * current_price
                total_stocks_value += value
                assets_data.append({
                    "name": pos.symbol.upper(),
                    "value": round(value, 2)
                })
        
        if cash > 0:
            assets_data.append({
                "name": "CASH",
                "value": round(cash, 2)
            })
            
        total_patrimonio = total_stocks_value + cash
        
        for asset in assets_data:
            asset["percentage"] = round((asset["value"] / total_patrimonio) * 100, 1) if total_patrimonio > 0 else 0

        return Response({
            "total_value": round(total_patrimonio, 2),
            "assets": sorted(assets_data, key=lambda x: x['value'], reverse=True)
        }, status=status.HTTP_200_OK)
    
class MarketQuotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickers_to_track = ["AAPL", "NVDA", "TSLA", "AMZN", "BTC", "ETH"]
        market_data = []
        
        for symbol in tickers_to_track:
            try:
                symbol_yf = symbol.upper()
                if symbol_yf in ['BTC', 'ETH', 'SOL']:
                    symbol_yf = f"{symbol_yf}-USD"
                
                ticker = yf.Ticker(symbol_yf)
                fast_info = ticker.fast_info
                current_price = fast_info.get('lastPrice')
                prev_close = fast_info.get('previousClose')
                
                if current_price is None or prev_close is None:
                    history = ticker.history(period="2d")
                    if len(history) >= 2:
                        prev_close = float(history['Close'].iloc[-2])
                        current_price = float(history['Close'].iloc[-1])
                    elif len(history) == 1:
                        current_price = float(history['Close'].iloc[-1])
                        prev_close = current_price
                
                current_price = float(current_price) if current_price else 0.0
                prev_close = float(prev_close) if prev_close else current_price
                
                change_percent = 0.0
                if prev_close > 0:
                    change_percent = round(((current_price - prev_close) / prev_close) * 100, 2)
                
                company_name = ticker.info.get('longName', f"{symbol} Inc.")
                
                market_data.append({
                    "symbol": symbol,
                    "name": company_name,
                    "current_price": round(current_price, 2),
                    "open_price": round(prev_close, 2),
                    "change_percent": change_percent
                })
            except Exception as e:
                print(f"Error procesando cotización para {symbol}: {e}")
                continue
                
        return Response(market_data, status=status.HTTP_200_OK)

# ================= NUEVO ENDPOINT INTEGRADO PARA NOTICIAS DEL PATRIMONIO =================
# Reemplazar la función del final de views.py por esta:
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_news(request):
    try:
        portfolio = get_object_or_404(Portfolio, user=request.user)
        positions = Position.objects.filter(portfolio=portfolio, quantity__gt=0)
        tickers = [pos.symbol.upper() for pos in positions]
        
        compiled_news = []
        
        # Si tiene activos, intentamos traer noticias específicas de sus empresas
        if tickers:
            for symbol in tickers:
                symbol_yf = f"{symbol}-USD" if symbol in ['BTC', 'ETH', 'SOL'] else symbol
                try:
                    ticker_obj = yf.Ticker(symbol_yf)
                    # Usamos .news de yfinance
                    ticker_news = ticker_obj.news
                    if ticker_news:
                        for news_item in ticker_news[:3]:
                            compiled_news.append({
                                "title": news_item.get("title") or news_item.get("summary"),
                                "link": news_item.get("link") or news_item.get("url"),
                                "publisher": news_item.get("publisher") or "Yahoo Finance",
                                "providerPublishTime": news_item.get("providerPublishTime") or news_item.get("pubDate"),
                                "related_ticker": symbol
                            })
                except Exception as yf_err:
                    print(f"Error extrayendo noticias individuales para {symbol}: {yf_err}")
                    continue

        # PLAN B: Si el usuario no tiene activos o las llamadas fallaron/devolvieron vacío,
        # traemos las noticias del mercado general (S&P 500 y Dow Jones) para poblar la sección amarilla
        if not compiled_news:
            print("Cargando noticias de mercado general (Fallback)...")
            for fallback_symbol in ['SPY', 'DIA']:
                try:
                    fallback_obj = yf.Ticker(fallback_symbol)
                    fallback_news = fallback_obj.news
                    if fallback_news:
                        for news_item in fallback_news[:4]:
                            compiled_news.append({
                                "title": news_item.get("title") or news_item.get("summary"),
                                "link": news_item.get("link") or news_item.get("url"),
                                "publisher": news_item.get("publisher") or "Financial News",
                                "providerPublishTime": news_item.get("providerPublishTime") or news_item.get("pubDate"),
                                "related_ticker": "MERCADO"
                            })
                except Exception as fb_err:
                    print(f"Error en fallback de noticias ({fallback_symbol}): {fb_err}")

        # Ordenamos cronológicamente (más nuevos primero)
        # Manejamos si providerPublishTime viene como string o int convirtiendo de forma segura
        def get_time(x):
            t = x.get("providerPublishTime", 0)
            return int(t) if isinstance(t, (int, float)) else 0

        compiled_news.sort(key=get_time, reverse=True)
        
        return Response({"news": compiled_news[:8]}, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error crítico en get_portfolio_news: {str(e)}")
        return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)