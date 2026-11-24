import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MapView from "./MapView";
import Navigation from "./Navigation";
import AddShop from "./AddShop";
import AuthGate, { useAuth } from "./AuthGate";
import "./App.css";

// Viewers can only see the map; the add/edit pages send them back to it.
function EditorsOnly({ children }) {
  const { canEdit } = useAuth();
  return canEdit ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthGate>
      <Router>
        <div className="App">
          <Navigation />
          <div className="content">
            <Routes>
              <Route path="/" element={<MapView />} />
              <Route path="/add" element={<EditorsOnly><AddShop /></EditorsOnly>} />
              <Route path="/edit/:id" element={<EditorsOnly><AddShop /></EditorsOnly>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthGate>
  );
}

export default App;
