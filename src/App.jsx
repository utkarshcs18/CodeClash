import { Component } from "react";
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

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="wrap">
        <div className="card missing">
          <h1>Something broke</h1>
          <p>Go back to the hall and try that again.</p>
          <a className="btn btn-dark" href="/">Back home</a>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthController mode="login" />} />
        <Route path="/signup" element={<AuthController mode="signup" />} />
        <Route path="/room/:code" element={<RequireAuth><RoomController /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
