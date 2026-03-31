'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface User {
  id: string
  username: string
  display_name: string
  role: string
  created_at: string
  city: string | null
  state: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, created_at, city, state')
      .order('created_at', { ascending: false })
    setUsers((data || []) as User[])
  }

  async function toggleAdmin(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`${newRole === 'admin' ? 'Grant' : 'Remove'} admin role for ${user.display_name}?`)) return

    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    loadUsers()
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Manage Users</h1>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#f5f5f0]">{u.display_name}</div>
                  <div className="text-xs text-[#666]">{u.username}</div>
                </td>
                <td className="px-4 py-3 text-[#f5f5f0]/70">
                  {u.city && u.state ? `${u.city}, ${u.state}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${u.role === 'admin' ? 'text-amber-400 bg-amber-500/10' : 'text-[#888] bg-white/5'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#888]">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAdmin(u)}
                    className="text-xs text-amber-500/70 hover:text-amber-500 transition-colors"
                  >
                    {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#555]">
                  No users found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
