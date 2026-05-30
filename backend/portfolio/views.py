from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Portfolio, Position, Transaction
from .serializers import PortfolioSerializer, TransactionSerializer


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