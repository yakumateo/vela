import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./BottomNav";

// Pantallas que NO muestran bottom nav
const NO_NAV_SCREENS = ["/", "/login", "/register", "/panic", "/bathroom"];

export function Layout() {
  const location = useLocation();
  const showNav = !NO_NAV_SCREENS.includes(location.pathname);

  return (
    // Forzar dark mode siempre
    <div className="dark flex flex-col h-full w-full bg-[#0A0A0F] overflow-hidden">
      {/* Área de contenido scrollable */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          // Padding bottom para el nav + home indicator de iPhone
          paddingBottom: showNav ? 'calc(72px + env(safe-area-inset-bottom, 0px))' : '0px',
        }}
      >
        <Outlet />
      </main>

      {/* Bottom Nav — sticky sobre el contenido */}
      {showNav && <BottomNav />}
    </div>
  );
}
