import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapView from "./MapView";
import Navigation from "./Navigation";
import AddShop from "./AddShop";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="content">
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/add" element={<AddShop />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
