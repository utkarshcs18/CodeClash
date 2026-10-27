import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthController } from "./controllers/AuthController.jsx";
import { LobbyController } from "./controllers/LobbyController.jsx";
import { RoomController } from "./controllers/RoomController.jsx";
import { GateView } from "./views/GateView.jsx";
import { authToken } from "./services/socket.js";

function RequireAuth({ children }) {
  if (!authToken()) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  if (!authToken()) return <GateView />;
  return <LobbyController />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthController mode="login" />} />
        <Route path="/signup" element={<AuthController mode="signup" />} />
        <Route path="/room/:code" element={<RequireAuth><RoomController /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
