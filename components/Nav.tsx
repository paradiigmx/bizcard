'use client';

import { useRouter, usePathname } from 'next/navigation';
import { CameraIcon } from '@heroicons/react/24/solid';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'profile', label: 'Profile', emoji: '👤', path: '/profile' },
    { id: 'contacts', label: 'Contacts', emoji: '👥', path: '/' },
    { id: 'add', label: 'Scan Card', emoji: '➕', path: '/contacts/add?camera=true' },
    { id: 'events', label: 'Events', emoji: '📅', path: '/events' },
    { id: 'companies', label: 'Companies', emoji: '🏢', path: '/companies' },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (pathname.startsWith('/contacts') && item.path === '/') ||
            (pathname.startsWith('/events') && item.path === '/events') ||
            (pathname.startsWith('/companies') && item.path === '/companies') ||
            (pathname.startsWith('/profile') && item.path === '/profile');
          const isAddButton = item.id === 'add';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isAddButton
                  ? 'text-blue-600 dark:text-blue-400'
                  : isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isAddButton ? (
                <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-4 -mt-6 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center w-14 h-14">
                  <CameraIcon className="h-7 w-7 text-white" />
                </div>
              ) : (
                <>
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-xs font-medium truncate max-w-full px-1">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
