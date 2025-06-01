import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('autobots', 'routes/autobots.tsx'),
] satisfies RouteConfig;
