'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Users, Package, Activity, ShieldCheck, UserCog, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isManagement } = useAuth() as any; // We can derive isManagement

  if (!user) {
    return null;
  }

  const isMgmt = user.role === 'admin' || user.role === 'manager';

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back!</h2>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening in your warehouse today.</p>
        </div>
        <div className="hidden sm:block">
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            System Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Vehicles</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowRight className="h-4 w-4 mr-1 -rotate-45" />
              <span className="font-medium">2 new</span>
              <span className="text-slate-500 ml-2">since yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Deliveries</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">8</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowRight className="h-4 w-4 mr-1 -rotate-45" />
              <span className="font-medium">5 completed</span>
              <span className="text-slate-500 ml-2">today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Drivers Available</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">4</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
              <span className="font-medium text-slate-700">12 total</span>
              <span className="ml-2">in fleet</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">System Status</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">99.9%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
              <span className="font-medium text-green-600">Optimal</span>
              <span className="ml-2">performance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="xl:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Manage your daily operations efficiently</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isMgmt ? (
                <>
                  <button onClick={() => router.push('/tracking')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all group text-left">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                        <Truck className="h-5 w-5 text-blue-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-blue-700">Live Map</p>
                        <p className="text-xs text-slate-500">Track fleet in real-time</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500" />
                  </button>
                  
                  <button onClick={() => router.push('/deliveries')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all group text-left">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4 group-hover:bg-indigo-600 transition-colors">
                        <Package className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-indigo-700">Dispatch</p>
                        <p className="text-xs text-slate-500">Assign new deliveries</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500" />
                  </button>
                  
                  <button onClick={() => router.push('/vehicles')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 transition-all group text-left">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-4 group-hover:bg-emerald-600 transition-colors">
                        <Truck className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-emerald-700">Vehicles</p>
                        <p className="text-xs text-slate-500">Manage fleet details</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push('/my-deliveries')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all group text-left">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4 group-hover:bg-indigo-600 transition-colors">
                        <Package className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-indigo-700">My Deliveries</p>
                        <p className="text-xs text-slate-500">View and update status</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500" />
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Users Card */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-slate-500" />
              System Roles Overview
            </CardTitle>
            <CardDescription>The 3 primary user access levels</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ul className="divide-y divide-slate-100">
              <li className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Administrator</p>
                    <p className="text-xs text-slate-500 truncate">Full system access, manage users</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Admin</span>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Manager</p>
                    <p className="text-xs text-slate-500 truncate">Dispatch, tracking, reporting</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">Manager</span>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Driver</p>
                    <p className="text-xs text-slate-500 truncate">Update status, share location</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">Driver</span>
                  </div>
                </div>
              </li>
            </ul>
          </CardContent>
          {user.role === 'admin' && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <Button variant="outline" className="w-full text-sm" onClick={() => router.push('/users')}>
                Manage Users
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
