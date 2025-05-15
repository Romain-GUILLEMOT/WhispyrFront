import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),                       // /
    route("/auth/login", "routes/auth/LoginContainer.tsx"),   // /auth/login
] satisfies RouteConfig;
