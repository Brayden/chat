import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),

    layout("components/layouts/AuthLayout.tsx", [
        route("overview", "routes/overview.tsx"),
        route("channel/:id", "routes/channel.tsx"),
    ]),
] satisfies RouteConfig;
