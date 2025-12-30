/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'export',  // Exportar como sitio estático
  trailingSlash: true,  // Agregar slash final a las URLs
  basePath: '',  // Rutas relativas desde la raíz
  assetPrefix: '',  // Assets relativos desde la raíz
  images: {
    unoptimized: true  // Desactivar optimización de imágenes para export estático
  }
};

export default nextConfig;
