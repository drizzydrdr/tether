import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CheckIn from './components/CheckIn';
import History from './components/History';
import Settings from './components/Settings';
import NorthStar from './components/NorthStar';
import TriggerKiller from './components/TriggerKiller';
import MusicPrecommit from './components/MusicPrecommit';
import NavBar from './components/NavBar';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/trigger-killer" element={<TriggerKiller />} />
        <Route path="/north-star" element={<NorthStar />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/music" element={<MusicPrecommit />} />
      </Routes>
      <NavBar />
    </HashRouter>
  );
}
