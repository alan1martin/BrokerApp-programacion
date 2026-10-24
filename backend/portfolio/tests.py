from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from .models import Portfolio, Position, Transaction, Favorite


class PortfolioModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.portfolio = Portfolio.objects.create(
            user=self.user,
            cash_balance=Decimal("10000.00"),
            total_value=Decimal("10000.00")
        )

    def test_calculated_total_value(self):
        Position.objects.create(
            portfolio=self.portfolio,
            symbol="AAPL",
            quantity=Decimal("10.00"),
            average_price=Decimal("150.00")
        )
        # 10000 + (10 * 150) = 11500
        self.assertEqual(self.portfolio.calculated_total_value, Decimal("11500.00"))


class TradeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="trader", password="password123")
        self.portfolio = Portfolio.objects.create(
            user=self.user,
            cash_balance=Decimal("5000.00"),
            total_value=Decimal("5000.00")
        )
        self.client.force_authenticate(user=self.user)

    def test_buy_stock_success(self):
        response = self.client.post("/api/portfolio/trade/", {
            "symbol": "AAPL",
            "transaction_type": "BUY",
            "quantity": "2.0",
            "price": "150.00"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.portfolio.refresh_from_db()
        # 5000 - 300 = 4700
        self.assertEqual(self.portfolio.cash_balance, Decimal("4700.00"))

        pos = Position.objects.get(portfolio=self.portfolio, symbol="AAPL")
        self.assertEqual(pos.quantity, Decimal("2.000000"))
        self.assertEqual(pos.average_price, Decimal("150.00"))

    def test_buy_insufficient_funds(self):
        response = self.client.post("/api/portfolio/trade/", {
            "symbol": "BTC",
            "transaction_type": "BUY",
            "quantity": "1.0",
            "price": "60000.00"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Saldo insuficiente", response.data.get("error", ""))

    def test_sell_stock_success(self):
        Position.objects.create(
            portfolio=self.portfolio,
            symbol="NVDA",
            quantity=Decimal("5.0"),
            average_price=Decimal("100.00")
        )

        response = self.client.post("/api/portfolio/trade/", {
            "symbol": "NVDA",
            "transaction_type": "SELL",
            "quantity": "2.0",
            "price": "120.00"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.portfolio.refresh_from_db()
        # 5000 + 240 = 5240
        self.assertEqual(self.portfolio.cash_balance, Decimal("5240.00"))


class CashAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="casher", password="password123")
        self.portfolio = Portfolio.objects.create(
            user=self.user,
            cash_balance=Decimal("1000.00"),
            total_value=Decimal("1000.00")
        )
        self.client.force_authenticate(user=self.user)

    def test_deposit_cash(self):
        response = self.client.post("/api/portfolio/cash/", {
            "transaction_type": "DEPOSIT",
            "amount": "500.00"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.portfolio.refresh_from_db()
        self.assertEqual(self.portfolio.cash_balance, Decimal("1500.00"))

    def test_withdraw_cash(self):
        response = self.client.post("/api/portfolio/cash/", {
            "transaction_type": "WITHDRAW",
            "amount": "400.00"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.portfolio.refresh_from_db()
        self.assertEqual(self.portfolio.cash_balance, Decimal("600.00"))


class FavoritesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="favuser", password="password123")
        self.client.force_authenticate(user=self.user)

    def test_toggle_and_get_favorites(self):
        # Toggle ON
        res_on = self.client.post("/api/markets/favorites/toggle/", {"symbol": "AAPL"}, format="json")
        self.assertEqual(res_on.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_on.data["is_favorite"])

        # GET
        res_list = self.client.get("/api/markets/favorites/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertIn("AAPL", res_list.data)

        # Toggle OFF
        res_off = self.client.post("/api/markets/favorites/toggle/", {"symbol": "AAPL"}, format="json")
        self.assertEqual(res_off.status_code, status.HTTP_200_OK)
        self.assertFalse(res_off.data["is_favorite"])


class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_new_user(self):
        response = self.client.post("/api/register/", {
            "username": "newinvestor",
            "email": "investor@test.com",
            "password": "strongPassword123",
            "password_confirm": "strongPassword123"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        # Check portfolio created with 10000 balance
        user = User.objects.get(username="newinvestor")
        self.assertEqual(user.portfolio.cash_balance, Decimal("10000.00"))
