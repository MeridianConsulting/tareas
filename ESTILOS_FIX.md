# Problema de Estilos - Análisis y Solución

## Causa Probable del Problema

Cuando Next.js genera un sitio estático con `output: 'export'`, por defecto genera rutas **absolutas** que empiezan con `/` para los assets estáticos (CSS, JS, imágenes). Esto funciona bien cuando la aplicación se sirve desde la raíz del dominio, pero falla cuando:

1. **El servidor no está configurado correctamente**: Los archivos en `_next/static/` no se resuelven correctamente
2. **Rutas absolutas vs relativas**: Si la app se sirve desde una subcarpeta o hay problemas de configuración del servidor, las rutas absolutas `/` no apuntan al lugar correcto
3. **BasePath no configurado**: Next.js necesita saber si se sirve desde una subcarpeta

## Solución Aplicada

### 1. Configuración de Next.js (`next.config.mjs`)

Se agregaron explícitamente:
- `basePath: ''` - Indica que la app se sirve desde la raíz (sin subcarpeta)
- `assetPrefix: ''` - Los assets estáticos también se sirven desde la raíz

Esto asegura que Next.js genere rutas relativas correctas para los assets.

### 2. Estructura del ZIP

El script ahora:
- Coloca el contenido de `frontend/out/*` directamente en la raíz del ZIP
- Mantiene la estructura `_next/static/` intacta
- Asegura que todos los archivos estén en la ubicación correcta

## Verificación Post-Despliegue

Si los estilos aún no se cargan, verifica:

1. **Servidor web**: Asegúrate de que el servidor (Apache/Nginx) sirve correctamente los archivos estáticos de `_next/static/`
2. **Permisos**: Los archivos deben tener permisos de lectura
3. **Console del navegador**: Revisa errores 404 en la pestaña Network para ver qué archivos no se cargan
4. **Rutas**: Verifica que las rutas en el HTML apuntan correctamente a `/_next/static/...`

## Configuración Adicional del Servidor (si es necesario)

### Apache (.htaccess en la raíz del frontend)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Servir archivos estáticos de _next
  RewriteRule ^_next/static/(.*)$ _next/static/$1 [L]
  
  # Redirigir todo a index.html para SPA
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

### Nginx
```nginx
location /_next/static/ {
  alias /ruta/a/tu/app/_next/static/;
  expires 365d;
  add_header Cache-Control "public, immutable";
}
```

