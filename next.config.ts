import type { NextConfig } from "next";

const nextConfig: NextConfig = 
  // tsconfig.json
  {
    "compilerOptions": {
      // ...
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
    // ...
  }

export default nextConfig;


