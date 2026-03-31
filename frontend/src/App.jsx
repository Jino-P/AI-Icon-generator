import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SmartIconGenerator from "./pages/SmartIconGenerator";
import ImageGallery from "./pages/gallery";
import Landing from "./pages/Initial";
import Layout from "./layouts/Layout";
// import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import ImageStudio from "./pages/ImageStudio";
import VerifyEmail from "./pages/verify_email";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><Layout><SmartIconGenerator /></Layout></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Layout><ImageGallery /></Layout></ProtectedRoute>} />
        <Route path="/studio" element={<ProtectedRoute><Layout><ImageStudio /></Layout></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
