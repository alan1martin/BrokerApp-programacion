
from rest_framework import serializers
from .models import Portfolio, Position, Transaction

class PositionSerializer(serializers.ModelSerializer):
    # Calculamos el costo total invertido en esta posición (Cantidad * Precio Promedio)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'symbol', 'quantity', 'average_price', 'total_cost']

    def get_total_cost(self, obj):
        return obj.quantity * obj.average_price


class PortfolioSerializer(serializers.ModelSerializer):
    # Traemos las posiciones reales anidadas dentro del portfolio
    positions = PositionSerializer(many=True, read_only=True)
    
    # Apuntamos total_value a la función dinámica 'calculated_total_value' que creamos en el modelo
    total_value = serializers.ReadOnlyField(source='calculated_total_value')

    class Meta:
        model = Portfolio
        fields = ['id', 'total_value', 'positions']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'symbol', 'transaction_type', 'quantity', 'price', 'timestamp']
        read_only_fields = ['id', 'timestamp']
        