import { Flame } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E1E2A&color=39FF6E&bold=true&size=64`;

export function Header({ subtitle = "" }: { subtitle?: string }) {
  const { profile } = useAuth();
  const avatarUrl =
    profile?.avatar_url || AVATAR_PLACEHOLDER(profile?.full_name || "U");

  return (
    <div className="h-[72px] px-6 flex items-center justify-between z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A38]/50">
      <Link to="/home" className="flex items-center gap-2 group">
        <Flame
          className="text-[#39FF6E] drop-shadow-[0_0_8px_rgba(57,255,110,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(57,255,110,0.8)] transition-all"
          size={28}
        />
        <div className="flex flex-col">
          <span className="font-bold text-[20px] tracking-tight leading-none text-[#F0F0F5]">
            Vela
          </span>
          {subtitle && (
            <span className="text-[12px] text-[#8888AA] font-medium mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </Link>
      <Link to="/profile">
        <div className="w-10 h-10 rounded-full bg-[#1E1E2A] border-2 border-[#2A2A38] hover:border-[#39FF6E] transition-colors flex items-center justify-center overflow-hidden">
          <img
            src={avatarUrl}
            alt={profile?.full_name || "Perfil"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER(
                profile?.full_name || "U"
              );
            }}
          />
        </div>
      </Link>
    </div>
  );
}
