import { NavLink } from 'react-router-dom';
import './NavBar.css';

const tabs = [
  { to: '/', label: 'Home', icon: '\u25CB' },
  { to: '/north-star', label: 'North Star', icon: '\u2726' },
  { to: '/history', label: 'History', icon: '\u2248' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `navbar__tab${isActive ? ' navbar__tab--active' : ''}`}
        >
          <span className="navbar__icon">{tab.icon}</span>
          <span className="navbar__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
