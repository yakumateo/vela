import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "motion/react";

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
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{
          // Padding bottom para el nav + home indicator de iPhone
          paddingBottom: showNav ? 'calc(72px + env(safe-area-inset-bottom, 0px))' : '0px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="min-h-full flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav — sticky sobre el contenido */}
      {showNav && <BottomNav />}
    </div>
  );
}
