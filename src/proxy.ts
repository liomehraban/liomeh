import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todo excepto API, internos de Next, archivos estáticos (con punto) y /data
  matcher: "/((?!api|_next|_vercel|data|.*\\..*).*)",
};
