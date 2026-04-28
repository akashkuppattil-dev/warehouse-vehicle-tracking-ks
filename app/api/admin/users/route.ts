import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type AppRole = 'admin' | 'manager' | 'driver'

function splitName(name: string) {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

export async function POST(request: NextRequest) {
  try {
    const serverSupabase = await createServerClient()
    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await serverSupabase.auth.getUser()

    if (currentUserError || !currentUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requesterRole = currentUser.user_metadata?.role
    const requesterIsAdmin =
      currentUser.email.toLowerCase() === 'admin@example.com' ||
      requesterRole === 'admin'

    if (!requesterIsAdmin) {
      return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 })
    }

    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const role = body.role as AppRole
    const phone = String(body.phone ?? '').trim()
    const licenseNumber = String(body.licenseNumber ?? '').trim()

    if (!name || !email || !password || !['admin', 'manager', 'driver'].includes(role)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      )
    }

    const adminSupabase = createAdminClient()
    const { firstName, lastName } = splitName(name)
    const username = email.split('@')[0]

    const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role,
        licenseNumber: role === 'driver' ? licenseNumber : undefined,
      },
    })

    if (createError || !createdUser.user) {
      return NextResponse.json(
        { error: createError?.message ?? 'Failed to create auth user' },
        { status: 400 },
      )
    }

    // Best-effort profile insert. This will work once warehouse_users exists.
    const { error: profileError } = await adminSupabase
      .from('warehouse_users')
      .upsert(
        {
          id: createdUser.user.id,
          username,
          first_name: firstName,
          last_name: lastName,
          role,
          phone: phone || null,
          is_active: true,
        },
        { onConflict: 'id' },
      )

    const response = {
      id: createdUser.user.id,
      email,
      role,
      profileStored: !profileError,
      profileWarning: profileError?.message ?? null,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[admin] Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
