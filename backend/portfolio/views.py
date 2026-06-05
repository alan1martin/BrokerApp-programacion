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
    # CORREGIDO: Ajustado al campo real de la Base de Datos
    portfolio.cash_balance = Decimal('10000.00')
    portfolio.total_value = Decimal('10000.00')
    portfolio.save()
    
    # Limpiamos posiciones viejas asociadas
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
        
        # CONEXIÓN EN TIEMPO REAL: Calculamos el valor del portfolio usando yfinance al vuelo
        total_stocks_value = Decimal('0.00')
        
        for pos in positions:
            try:
                ticker = yf.Ticker(pos.symbol)
                # Obtenemos de forma ultra rápida el último precio de cierre de mercado
                fast_info = ticker.fast_info
                current_price = Decimal(str(round(fast_info.get('lastPrice', pos.average_price), 2)))
                
                # Sumamos la valuación actualizada al total invertido
                total_stocks_value += Decimal(str(pos.quantity)) * current_price
            except Exception as e:
                print(f"No se pudo actualizar el precio en tiempo real de {pos.symbol}, usando precio promedio: {e}")
                total_stocks_value += Decimal(str(pos.quantity)) * Decimal(str(pos.average_price))

        # CORREGIDO: El Patrimonio Total usa cash_balance + acciones valuadas a mercado
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
            # CORREGIDO: Control de saldo usando cash_balance
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

            # CORREGIDO: Descontamos efectivo de cash_balance
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

            # CORREGIDO: Reintegramos efectivo a cash_balance
            portfolio.cash_balance += trade_total_cost
            portfolio.save()

        serializer.save(portfolio=portfolio, symbol=symbol)

        return Response({
            "message": f"Orden de {trade_type} ejecutada con éxito.",
            "cash": str(portfolio.cash_balance), # Enviamos mapeado como 'cash' para mantener feliz a React
            "position": {
                "symbol": symbol,
                "current_quantity": str(position.quantity if position.id else 0),
                "average_price": str(position.average_price if position.id else 0)
            }
        }, status=status.HTTP_201_CREATED)