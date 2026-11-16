from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Portfolio, Position, Transaction, MarketNews

class PositionSerializer(serializers.ModelSerializer):
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'symbol', 'quantity', 'average_price', 'total_cost']

    def get_total_cost(self, obj):
        return obj.quantity * obj.average_price


class PortfolioSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    total_value = serializers.ReadOnlyField(source='calculated_total_value')
    cash = serializers.ReadOnlyField(source='cash_balance')

    class Meta:
        model = Portfolio
        fields = ['id', 'account_number', 'full_name', 'dni', 'total_value', 'cash', 'positions']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'symbol', 'transaction_type', 'quantity', 'price', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    dni = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return normalized

    def validate_dni(self, value):
        cleaned_dni = ''.join(filter(str.isalnum, str(value).strip()))
        if not cleaned_dni:
            raise serializers.ValidationError("Por favor, ingresá un DNI válido.")
        if Portfolio.objects.filter(dni=cleaned_dni).exists():
            raise serializers.ValidationError("Este DNI ya se encuentra registrado con otra cuenta.")
        return cleaned_dni

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        full_name = validated_data['full_name']
        dni = validated_data['dni']
        password = validated_data['password']

        username = validated_data.get('username')
        if not username or not username.strip():
            base_user = email.split('@')[0].lower()
            clean_user = ''.join(c for c in base_user if c.isalnum() or c in ['_', '.']) or "inversor"
            username = clean_user
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{clean_user}{counter}"
                counter += 1

        first_name = full_name.split()[0] if full_name else ""
        last_name = " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        Portfolio.objects.create(
            user=user,
            full_name=full_name,
            dni=dni,
            cash_balance=10000.00,
            total_value=10000.00
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    account_number = serializers.SerializerMethodField()
    dni = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    cash = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'dni',
            'account_number', 'cash', 'total_value', 'is_staff', 'is_superuser'
        ]

    def get_account_number(self, obj):
        portfolio = getattr(obj, 'portfolio', None)
        acc = portfolio.account_number if portfolio else None
        if not acc:
            return f"CC N° {obj.id:05d}"
        digits = ''.join(filter(str.isdigit, str(acc)))
        num = int(digits) if digits else obj.id
        return f"CC N° {num:05d}"

    def get_dni(self, obj):
        portfolio = getattr(obj, 'portfolio', None)
        return portfolio.dni if portfolio else ""

    def get_full_name(self, obj):
        portfolio = getattr(obj, 'portfolio', None)
        if portfolio and portfolio.full_name:
            return portfolio.full_name
        full = obj.get_full_name()
        return full if full else obj.username

    def get_cash(self, obj):
        portfolio = getattr(obj, 'portfolio', None)
        return float(portfolio.cash_balance) if portfolio else 0.0

    def get_total_value(self, obj):
        portfolio = getattr(obj, 'portfolio', None)
        return float(portfolio.calculated_total_value) if portfolio else 0.0


class MarketNewsSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = MarketNews
        fields = ['id', 'title', 'summary', 'link', 'publisher', 'related_ticker', 'priority', 'formatted_date', 'created_at']

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
