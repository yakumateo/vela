import { createBrowserRouter, Outlet } from "react-router";
import { Layout } from "./components/Layout";
import { Splash } from "./screens/Splash";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Home } from "./screens/Home";
import { Lobby } from "./screens/Lobby";
import { Radar } from "./screens/Radar";
import { BathroomMode } from "./screens/BathroomMode";
import { PanicAlert } from "./screens/PanicAlert";
import { TaxiRegistration } from "./screens/TaxiRegistration";
import { BotVela } from "./screens/BotVela";
import { Profile } from "./screens/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Splash },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "home", Component: Home },
      { path: "lobby", Component: Lobby },
      { path: "radar", Component: Radar },
      { path: "bathroom", Component: BathroomMode },
      { path: "panic", Component: PanicAlert },
      { path: "taxi", Component: TaxiRegistration },
      { path: "bot", Component: BotVela },
      { path: "profile", Component: Profile },
    ],
  },
]);
