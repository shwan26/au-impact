// next.config.ts
const nextConfig = {
  images: {
    // Allow images from ANY domain (http + https)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],

    // If you ever serve SVGs, enable this (SVGs can be risky—CSP added below)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
export default nextConfig;
