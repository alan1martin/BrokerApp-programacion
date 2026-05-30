from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Portfolio, Position, Transaction
from .serializers import PortfolioSerializer, TransactionSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction, Portfolio # Asegurate de usar tus modelos reales

import random
from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stock_history(request, symbol):
    # Simulamos un fetch a una cotización base estable para armar una serie temporal consistente
    prices = {
        "AAPL": 175.50,
        "BTC": 62000.00,
        "TSLA": 189.44,
        "NVDA": 901.11
    }
    
    current_price = prices.get(symbol.upper(), 100.0)
    history = []
    now = datetime.now()
    
    # Generamos 12 puntos de tiempo estables directo desde el servidor
    base = current_price * 0.97 # arrancamos un 3% abajo
    for i in range(12, -1, -1):
        point_time = now - timedelta(minutes=i * 15)
        change = (random.random() - 0.48) * (base * 0.005)
        base += change
        
        # Guardamos la estructura limpia
        history.append({
            "time": point_time.strftime("%H:%M"),
            "price": round(base if i != 0 else current_price, 2) # el último es exacto
        })
        
    return JsonResponse({"symbol": symbol.upper(), "data": history})

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def reset_portfolio(request):
    user = request.user
    
    # 1. Borramos todas las transacciones del usuario
    Transaction.objects.filter(user=user).delete()
    
    # 2. Buscamos su portfolio/perfil y reseteamos el cash a 10000
    portfolio, created = Portfolio.objects.get_or_create(user=user)
    portfolio.cash = 10000.00
    portfolio.save()
    
    return Response({"message": "Cuenta reseteada con éxito. Volvés a tener $10,000.00 USD!"}, status=status.HTTP_200_OK)

class TransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Traemos el portfolio del usuario
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        # 2. Buscamos sus transacciones ordenadas por fecha (las más nuevas primero)
        transactions = portfolio.transactions.all().order_by('-timestamp')
        
        # 3. Serializamos los datos y los escupimos al frontend
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ➔ 1. RECUPERAMOS LA VISTA QUE SE HABÍA BORRADO
class PortfolioDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Buscamos el portfolio del usuario actual o creamos uno si no tiene
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        
        # Sincronizamos el total_value usando la propiedad calculada antes de serializar
        portfolio.total_value = portfolio.calculated_total_value
        portfolio.save()
        
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ➔ 2. MANTENEMOS LA NUEVA VISTA DE TRADING
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

        # Calculamos el costo bruto de esta operación en particular
        trade_total_cost = quantity * price

        # Buscamos o creamos la posición del activo
        position, created = Position.objects.get_or_create(
            portfolio=portfolio,
            symbol=symbol,
            defaults={'quantity': Decimal('0.00'), 'average_price': Decimal('0.00')}
        )

        # ➔ LÓGICA DE COMPRA (BUY) CON VALIDACIÓN DE EFECTIVO
        if trade_type == 'BUY':
            # Control de saldo disponible
            if portfolio.cash_balance < trade_total_cost:
                return Response(
                    {"error": f"Saldo insuficiente. Necesitás ${trade_total_cost:,.2f} y tenés ${portfolio.cash_balance:,.2f} en cuenta."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Si tiene saldo: calculamos promedio ponderado y descontamos efectivo
            current_total_cost = position.quantity * position.average_price
            new_trade_cost = quantity * price
            
            position.quantity += quantity
            position.average_price = (current_total_cost + new_trade_cost) / position.quantity
            position.save()

            # Restamos el dinero del saldo de la cuenta
            portfolio.cash_balance -= trade_total_cost
            portfolio.save()

        # ➔ LÓGICA DE VENTA (SELL) CON CONTROL DE ACCIONES Y REINTEGRO DE EFECTIVO
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

            # Sumamos el dinero de la venta al saldo de la cuenta
            portfolio.cash_balance += trade_total_cost
            portfolio.save()

        # Guardamos el registro en el historial
        serializer.save(portfolio=portfolio, symbol=symbol)

        return Response({
            "message": f"Orden de {trade_type} ejecutada con éxito.",
            "cash_balance": str(portfolio.cash_balance),
            "position": {
                "symbol": symbol,
                "current_quantity": str(position.quantity if position.id else 0),
                "average_price": str(position.average_price if position.id else 0)
            }
        }, status=status.HTTP_201_CREATED)
    