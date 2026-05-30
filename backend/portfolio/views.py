from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Portfolio, Position, Transaction
from .serializers import PortfolioSerializer, TransactionSerializer

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
        # Traemos el portfolio del usuario autenticado
        portfolio = get_object_or_404(Portfolio, user=request.user)
        
        # Validamos los datos recibidos mediante el serializer
        serializer = TransactionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Extraemos los datos validados
        symbol = serializer.validated_data['symbol'].upper()
        trade_type = serializer.validated_data['transaction_type']
        quantity = Decimal(str(serializer.validated_data['quantity']))
        price = Decimal(str(serializer.validated_data['price']))

        # Buscamos si ya existe una posición para este activo
        position, created = Position.objects.get_or_create(
            portfolio=portfolio,
            symbol=symbol,
            defaults={'quantity': Decimal('0.00'), 'average_price': Decimal('0.00')}
        )

        # LÓGICA DE COMPRA (BUY)
        if trade_type == 'BUY':
            # Calculamos el costo total nuevo y el viejo para sacar el promedio ponderado
            current_total_cost = position.quantity * position.average_price
            new_trade_cost = quantity * price
            
            position.quantity += quantity
            # Fórmula de precio promedio ponderado
            position.average_price = (current_total_cost + new_trade_cost) / position.quantity
            position.save()

        # LÓGICA DE VENTA (SELL)
        elif trade_type == 'SELL':
            if position.quantity < quantity:
                return Response(
                    {"error": f"No tenés suficientes unidades de {symbol}. Tenés {position.quantity} y querés vender {quantity}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            position.quantity -= quantity
            
            # Si vendió todo, borramos la fila de la base de datos para limpiar la pantalla
            if position.quantity == 0:
                position.delete()
            else:
                position.save()

        # Guardamos el registro de la transacción en el historial
        serializer.save(portfolio=portfolio, symbol=symbol)

        return Response({
            "message": f"Orden de {trade_type} ejecutada con éxito.",
            "position": {
                "symbol": symbol,
                "current_quantity": str(position.quantity if position.id else 0),
                "average_price": str(position.average_price if position.id else 0)
            }
        }, status=status.HTTP_201_CREATED)