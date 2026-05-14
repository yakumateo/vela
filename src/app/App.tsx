import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </SessionProvider>
    </AuthProvider>
  );
}
