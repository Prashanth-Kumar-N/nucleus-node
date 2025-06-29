import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  /* index("routes/home.tsx"),
  route("files", "./modules/files/files.component.tsx"), */
  layout("layouts/root-layout.tsx", [
    index("layouts/home.tsx"),
    route("files", "./modules/files/files.component.tsx"),
  ]),
] satisfies RouteConfig;
