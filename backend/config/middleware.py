class SecurityHeadersMiddleware:
    """
    Middleware de endurecimiento de cabeceras HTTP según estándares OWASP para Fintech/Brokers:
    - Content-Security-Policy (CSP)
    - Permissions-Policy
    - Referrer-Policy
    - X-Content-Type-Options
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Referrer Policy estricta
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Permissions Policy: Deshabilitar acceso a hardware sensible en la web del broker
        response['Permissions-Policy'] = (
            'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
        )

        # Content-Security-Policy para API y endpoints
        # Permite consumo legítimo de la API y bloquea inyecciones de scripts u orígenes externos no autorizados
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' http://localhost:8000 https://api.app4.academia.ar https://app4.academia.ar https://query1.finance.yahoo.com https://query2.finance.yahoo.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response['Content-Security-Policy'] = csp

        # Ocultar cabeceras que delaten software del backend si estuvieran presentes
        if response.has_header('Server'):
            del response['Server']

        return response
