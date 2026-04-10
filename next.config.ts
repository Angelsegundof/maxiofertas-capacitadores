import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  // Next.js config options here
  reactStrictMode: true,
  turbopack: {}, // Silencia el error de conflicto de Webpack v/s Turbopack
});
