import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Tag, ShoppingBag, AlertTriangle, Search, MessageCircle, MapPin, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: '/marketplace', label: 'Marketplace', icon: Tag },
    { path: '/pet-shop', label: 'Pet Shop', icon: ShoppingBag },
    { path: '/rescue-report', label: 'Rescue Report', icon: AlertTriangle },
    { path: '/lost-found', label: 'Lost & Found', icon: Search },
    { path: '/ai-chat', label: 'AI Chat', icon: MessageCircle },
    { path: '/vet-locator', label: 'Vet Locator', icon: MapPin },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 w-[160px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-6">
      <div>
        <div className="flex items-center gap-2 px-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
            K
          </div>
          <span className="font-bold text-xl text-gray-800">KitPup</span>
        </div>
        
        <nav className="flex flex-col gap-2 px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-full transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="px-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {user.initials || user.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
              <span className="text-xs text-gray-500 truncate">{user.plan || 'Free Plan'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
