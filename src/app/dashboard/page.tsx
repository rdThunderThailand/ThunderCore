import { redirect } from 'next/navigation'

import { logout } from '@/features/auth/actions'
import {
  getCurrentUser,
  getMyMemberships,
  isAxiosError,
  type CurrentUser,
  type Membership,
} from '@/lib/thunder-core'
import Link from 'next/link'

export default async function DashboardPage() {
  let user: CurrentUser
  let memberships: Membership[]

  try {
    ;[user, memberships] = await Promise.all([getCurrentUser(), getMyMemberships()])
  } catch (error) {
    // No/expired token → back to login. Anything else is a real fault; let it surface.
    if (isAxiosError(error) && error.response?.status === 401) redirect('/login')
    throw error
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—'

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cityzen-logo.png" alt="CityZen" className="h-6 w-6 object-contain" />
            <span className="text-lg font-bold uppercase tracking-tight text-slate-900">CityZen</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>

        <section className="rounded-[24px] bg-white p-8 shadow-xl shadow-blue-900/5">
          <div className="mb-6 flex items-center gap-4">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={fullName} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F172A] text-lg font-bold text-white">
                {(user.display_name ?? user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.display_name ?? fullName}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1677ff]">
              {user.role}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Field label="Full name" value={fullName} />
            <Field label="User code" value={user.global_user_code} />
            <Field label="Preferred language" value={user.preferred_language} />
            <Field label="Timezone" value={user.timezone} />
            <Field label="Default tenant" value={user.default_tenant_id ?? '—'} />
            <Field label="Super admin" value={user.is_super_admin ? 'Yes' : 'No'} />
          </dl>
        </section>

        <section className="rounded-[24px] bg-white p-8 shadow-xl shadow-blue-900/5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            Memberships ({memberships.length})
          </h2>

          {memberships.length === 0 ? (
            <p className="text-sm text-slate-500">No tenant memberships yet.</p>
          ) : (
            <ul className="space-y-3">
              {memberships.map((m) => (
                <li key={m.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{m.tenants.name}</span>
                    <div className="flex items-center gap-2">
                      {m.is_primary && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1677ff]">
                          Primary
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Roles: {m.membership_roles.map((r) => r.roles.name).join(', ') || '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <Link href="/tenants">
            <button
              type="submit"
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Go to tenants page (for super_admin only)
            </button>
          </Link>
        </section>

        <section>
          <Link href="/e316bbcf-2eb6-48ae-b5d9-74d631dec359/assets">
            <button
              type="submit"
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Go to assets page (for company_admin only)
            </button>
          </Link>
        </section>

      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}
