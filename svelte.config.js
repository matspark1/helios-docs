import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    paths: {
      base: "",
      assets: "",
    },
  },
};

export default config;
