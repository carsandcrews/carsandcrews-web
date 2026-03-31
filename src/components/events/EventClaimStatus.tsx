const statusConfig = {
  pending: { label: 'Claim Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved: { label: 'Claim Approved', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected: { label: 'Claim Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' }
} as const

interface EventClaimStatusProps {
  status: 'pending' | 'approved' | 'rejected'
}

export function EventClaimStatus({ status }: EventClaimStatusProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  )
}
