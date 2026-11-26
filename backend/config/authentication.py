from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class JWTCookieAuthentication(JWTAuthentication):
    """
    Autenticación JWT robusta para Fintech/Broker:
    1. Intenta leer el token desde la Cookie segura HttpOnly ('access_token').
    2. Si no viene en cookie, permite el header Authorization Bearer como fallback.
    Esto permite migración transparente sin romper ningún cliente existente y elimina
    el almacenamiento en localStorage protegiendo contra robo de sesión por XSS.
    """
    def authenticate(self, request):
        # 1. Intentar obtener el token desde la cookie HttpOnly
        raw_token = request.COOKIES.get('access_token')

        # 2. Si no hay cookie, buscar en el Header Authorization Bearer (compatibilidad)
        if raw_token is None:
            header = self.get_header(request)
            if header is not None:
                raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        # 3. Validar token y resolver usuario
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
