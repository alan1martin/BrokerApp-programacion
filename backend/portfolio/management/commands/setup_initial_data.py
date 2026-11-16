import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from portfolio.models import Portfolio, MarketNews

class Command(BaseCommand):
    help = "Inicializa superusuario seguro, elimina usuario hardcodeado martin y puebla noticias clave del dashboard"

    def handle(self, *args, **options):
        # 1. Eliminar usuario hardcodeado martin
        deleted, _ = User.objects.filter(username='martin').delete()
        if deleted:
            self.stdout.write(self.style.SUCCESS(f"Usuario hardcodeado 'martin' eliminado correctamente."))

        # 2. Configurar superusuario admin
        su_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        su_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@academia.ar')
        su_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'UnPasswordSeguroParaAdmin123')

        admin_user, created = User.objects.get_or_create(
            username=su_username,
            defaults={'email': su_email, 'is_staff': True, 'is_superuser': True}
        )
        admin_user.set_password(su_password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email = su_email
        admin_user.first_name = "Administrador"
        admin_user.last_name = "Peak"
        admin_user.save()
        self.stdout.write(self.style.SUCCESS(f"Superusuario '{su_username}' verificado y actualizado."))

        # 3. Asegurar Portfolio y Cuenta Comitente
        portfolio, _ = Portfolio.objects.get_or_create(
            user=admin_user,
            defaults={
                'account_number': 'CC-000001',
                'full_name': 'Administrador General',
                'cash_balance': 100000.00,
                'total_value': 100000.00
            }
        )
        if not portfolio.account_number:
            portfolio.account_number = 'CC-000001'
        if not portfolio.full_name:
            portfolio.full_name = 'Administrador General'
        portfolio.save()

        # 4. Sembrar noticias clave si la tabla está vacía
        if not MarketNews.objects.exists():
            MarketNews.objects.create(
                title='Récord histórico: Wall Street impulsa los índices globales por rally de semiconductores',
                summary='Las acciones del sector tecnológico lideradas por Nvidia y Apple marcan nuevos máximos anuales con gran volumen de negociación.',
                link='https://www.tradingview.com/news/',
                publisher='Peak Market Intelligence',
                related_ticker='NVDA',
                is_active=True
            )
            MarketNews.objects.create(
                title='Mercado local: Crece el volumen en Cauciones y Bonos Soberanos en la plaza financiera',
                summary='Inversores aceleran colocaciones a tasa garantizada y posicionamiento en instrumentos de renta fija ante nuevas medidas de liquidez.',
                link='https://www.tradingview.com/news/',
                publisher='Ámbito Financiero / BrokerApp',
                related_ticker='AL30',
                is_active=True
            )
            MarketNews.objects.create(
                title='Apple presenta nuevos avances en computación espacial y expande servicios financieros',
                summary='La compañía de Cupertino reportó ingresos récord en su división de servicios y prevé una sólida demanda para el próximo trimestre.',
                link='https://www.tradingview.com/news/',
                publisher='Bloomberg / Peak News',
                related_ticker='AAPL',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS("Noticias iniciales de mercado sembradas."))

        self.stdout.write(self.style.SUCCESS("Setup inicial finalizado con éxito."))
