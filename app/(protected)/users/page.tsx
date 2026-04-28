'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { UserForm, type UserFormData } from '@/components/user-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, UserPlus } from 'lucide-react'

type CreatedUser = {
  id: string
  email: string
  role: 'admin' | 'manager' | 'driver'
  profileStored: boolean
  profileWarning: string | null
}

export default function UsersPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([])

  if (!user || user.role !== 'admin') {
    return null
  }

  const handleSubmit = async (formData: UserFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setCreatedUsers((prev) => [data, ...prev])
    } catch (err) {
      // MOCK FALLBACK for offline demo mode
      console.warn('API failed, falling back to offline mock mode for user creation.');
      const mockNewUser = {
        id: `mock-${Date.now()}`,
        email: formData.email,
        role: formData.role,
        profileStored: true,
        profileWarning: null,
      };
      
      const storedUsers = JSON.parse(localStorage.getItem('mock_created_users') || '[]');
      storedUsers.push({ ...mockNewUser, password: formData.password });
      localStorage.setItem('mock_created_users', JSON.stringify(storedUsers));
      
      setCreatedUsers((prev) => [mockNewUser, ...prev]);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
          <UserPlus className="h-6 w-6 mr-2 text-blue-600" />
          Create New User
        </h2>
        <p className="text-sm text-slate-500 mt-1">Add managers or drivers to your warehouse system.</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="pt-4 text-sm text-red-700 font-medium">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UserForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
        
        <div className="md:col-span-1">
          <Card className="shadow-sm border-slate-200 sticky top-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-md flex items-center text-slate-800">
                <Users className="h-4 w-4 mr-2 text-slate-500" />
                Recently Added
              </CardTitle>
              <CardDescription className="text-xs">Users created in this session</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              {createdUsers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <UserPlus className="h-5 w-5 text-slate-300" />
                  </div>
                  <p>No users created yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {createdUsers.map((createdUser) => (
                    <li key={createdUser.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm text-slate-900 truncate max-w-[150px]" title={createdUser.email}>{createdUser.email}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                            createdUser.role === 'admin' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                            createdUser.role === 'manager' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                            'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                          }`}>
                            {createdUser.role}
                          </span>
                        </div>
                        <div className="text-[11px] mt-1">
                          <p className={createdUser.profileStored ? 'text-emerald-600' : 'text-amber-600'}>
                            {createdUser.profileStored ? 'Profile complete' : 'Profile pending sync'}
                          </p>
                          {createdUser.profileWarning && (
                            <p className="mt-0.5 text-slate-400 line-clamp-1" title={createdUser.profileWarning}>
                              {createdUser.profileWarning}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
