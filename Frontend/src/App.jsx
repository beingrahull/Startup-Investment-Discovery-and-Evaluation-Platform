import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AskFeed from "./pages/AskFeed";
import AskDetail from "./pages/AskDetail";
import CreateAsk from "./pages/CreateAsk";
import MyConnections from "./pages/MyConnections";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/asks" element={<ProtectedRoute><AskFeed /></ProtectedRoute>} />
        <Route path="/asks/new" element={<ProtectedRoute><RoleRoute allow="founder"><CreateAsk /></RoleRoute></ProtectedRoute>} />
        <Route path="/asks/:id" element={<ProtectedRoute><AskDetail /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute><MyConnections /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
