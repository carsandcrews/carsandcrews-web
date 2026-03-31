import Link from 'next/link'

interface Member {
  username: string
  displayName: string
  avatarUrl: string | null
  tagline: string | null
}

interface FeedMembersProps {
  members: Member[]
}

export function FeedMembers({ members }: FeedMembersProps) {
  if (members.length === 0) return null

  return (
    <div className="border-b border-border py-5">
      <h3 className="mb-3.5 text-[11px] uppercase tracking-[1.5px] text-text-faint">New Members</h3>
      <div className="flex gap-5 overflow-x-auto">
        {members.map((m) => (
          <Link
            key={m.username}
            href={`/@${m.username}`}
            className="flex flex-shrink-0 items-center gap-2.5 transition-colors duration-150 hover:opacity-80"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a3a] to-[#3a3a4a]">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <svg className="h-4 w-4 text-text-faint" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary">@{m.username}</p>
              {m.tagline && <p className="text-[11px] text-text-faint">{m.tagline}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
