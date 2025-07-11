import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './screens/auth';
import Home from './screens/Home';
import ProjectDetails from './screens/ProjectDetails';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/project/:projectId" element={<ProjectDetails />} />
      </Routes>
    </Router>
  );
}

export default App;