import { Link, useLocation } from "react-router";
import { Home, Crosshair, User } from "lucide-react";

const tabs = [
  { path: "/home",    label: "Inicio",  Icon: Home      },
  { path: "/radar",   label: "Radar",   Icon: Crosshair },
  { path: "/profile", label: "Perfil",  Icon: User      },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
                 bg-[#14141C]/90 backdrop-blur-xl border-t border-[#2A2A38]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {tabs.map(({ path, label, Icon }) => {
          const active = pathname === path || (path === "/radar" && pathname === "/lobby");
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full
                         transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={active ? "text-[#39FF6E]" : "text-[#8888AA]"}
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2
                                   w-1 h-1 rounded-full bg-[#39FF6E]
                                   shadow-[0_0_6px_#39FF6E]" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide
                  ${active ? "text-[#39FF6E]" : "text-[#8888AA]"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
