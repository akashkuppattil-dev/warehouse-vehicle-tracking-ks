'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Users, Package, Activity, ShieldCheck, UserCog, User, Settings } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isManagement = user.role === 'admin' || user.role === 'manager';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItemClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return `flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-600/10 text-blue-400'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;
  };
  
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard Overview';
    if (pathname.includes('/tracking')) return 'Live Tracking';
    if (pathname.includes('/deliveries')) return 'Deliveries';
    if (pathname.includes('/vehicles')) return 'Vehicles';
    if (pathname.includes('/drivers')) return 'Drivers';
    if (pathname.includes('/users')) return 'System Users';
    if (pathname.includes('/my-deliveries')) return 'My Assignments';
    if (pathname.includes('/my-location')) return 'Live Location';
    if (pathname.includes('/settings')) return 'Settings';
    return 'WMS Pro';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Truck className="h-6 w-6 text-blue-400 mr-2" />
          <span className="text-lg font-bold text-white tracking-tight">WMS Pro</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </div>
            <button onClick={() => router.push('/dashboard')} className={navItemClass('/dashboard')}>
              <Activity className="h-4 w-4 mr-3" />
              Dashboard
            </button>
            {isManagement && (
              <>
                <button onClick={() => router.push('/tracking')} className={navItemClass('/tracking')}>
                  <MapPin className="h-4 w-4 mr-3" />
                  Live Tracking
                </button>
                <button onClick={() => router.push('/deliveries')} className={navItemClass('/deliveries')}>
                  <Package className="h-4 w-4 mr-3" />
                  Deliveries
                </button>
                <button onClick={() => router.push('/vehicles')} className={navItemClass('/vehicles')}>
                  <Truck className="h-4 w-4 mr-3" />
                  Vehicles
                </button>
                <button onClick={() => router.push('/drivers')} className={navItemClass('/drivers')}>
                  <Users className="h-4 w-4 mr-3" />
                  Drivers
                </button>
              </>
            )}
            {user.role === 'admin' && (
              <button onClick={() => router.push('/users')} className={navItemClass('/users')}>
                <ShieldCheck className="h-4 w-4 mr-3" />
                System Users
              </button>
            )}
            {user.role === 'driver' && (
              <>
                <button onClick={() => router.push('/my-deliveries')} className={navItemClass('/my-deliveries')}>
                  <Package className="h-4 w-4 mr-3" />
                  My Assignments
                </button>
                <button onClick={() => router.push('/my-location')} className={navItemClass('/my-location')}>
                  <MapPin className="h-4 w-4 mr-3" />
                  Live Location
                </button>
              </>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="md:hidden flex items-center">
            <Truck className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold text-slate-900">WMS Pro</span>
          </div>
          <div className="hidden md:flex items-center">
            <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500" onClick={() => router.push('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex border-slate-200">
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

