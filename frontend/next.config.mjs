/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'export',  // Exportar como sitio estático
  trailingSlash: true,  // Agregar slash final a las URLs
  images: {
    unoptimized: true  // Desactivar optimización de imágenes para export estático
  }
};

export default nextConfig;
