import { createRequestHandler } from "react-router";
const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("./assets/server-build-Cu90aWP2.js"),
  "production"
);
const app = {
  fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx }
    });
  }
};
export {
  app as default
};
