import { Bell } from 'lucide-react';

const TopBar = ({ title, subtitle }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const hasNotifications = true; // Hardcoded true for demonstration

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
          <Bell size={20} />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
        
        {user && (
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-orange-600 transition-colors shadow-sm">
            {user.initials || user.name?.substring(0, 2).toUpperCase() || 'RK'}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
