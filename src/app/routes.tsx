import { createBrowserRouter, Navigate, useLocation } from "react-router";
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
import { useAuth } from "./context/AuthContext";
import type { ReactNode } from "react";

/** Redirect logged-in users away from splash/login/register */
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

/** Redirect unauthenticated users to login */
function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // Public
      {
        index: true,
        element: (
          <PublicRoute>
            <Splash />
          </PublicRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },

      // Private
      {
        path: "home",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "lobby",
        element: (
          <PrivateRoute>
            <Lobby />
          </PrivateRoute>
        ),
      },
      {
        path: "radar",
        element: (
          <PrivateRoute>
            <Radar />
          </PrivateRoute>
        ),
      },
      {
        path: "bathroom",
        element: (
          <PrivateRoute>
            <BathroomMode />
          </PrivateRoute>
        ),
      },
      {
        path: "panic",
        element: (
          <PrivateRoute>
            <PanicAlert />
          </PrivateRoute>
        ),
      },
      {
        path: "taxi",
        element: (
          <PrivateRoute>
            <TaxiRegistration />
          </PrivateRoute>
        ),
      },
      {
        path: "bot",
        element: (
          <PrivateRoute>
            <BotVela />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
