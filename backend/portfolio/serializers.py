from rest_framework import serializers
from django.contrib.auth.models import User
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
    
    # Apuntamos total_value a la función dinámica 'calculated_total_value' del modelo
    total_value = serializers.ReadOnlyField(source='calculated_total_value')
    
    # PUENTE CLAVE: Mapeamos 'cash_balance' de la BD para que viaje a React como 'cash'
    cash = serializers.ReadOnlyField(source='cash_balance')

    class Meta:
        model = Portfolio
        fields = ['id', 'total_value', 'cash', 'positions']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'symbol', 'transaction_type', 'quantity', 'price', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        Portfolio.objects.get_or_create(
            user=user,
            defaults={'cash_balance': 10000.00, 'total_value': 10000.00}
        )
        return user
