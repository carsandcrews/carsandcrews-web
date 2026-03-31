export const EVENT_TYPES = [
  'car_show',
  'cars_and_coffee',
  'cruise_in',
  'cruise',
  'swap_meet',
  'track_day',
  'auction',
  'workshop',
  'meetup',
  'other'
] as const

export type EventType = typeof EVENT_TYPES[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  car_show: 'Car Show',
  cars_and_coffee: 'Cars & Coffee',
  cruise_in: 'Cruise-In',
  cruise: 'Cruise',
  swap_meet: 'Swap Meet',
  track_day: 'Track Day',
  auction: 'Auction',
  workshop: 'Workshop',
  meetup: 'Meetup',
  other: 'Other'
}

export const VEHICLE_STATUS_TAGS = [
  'restored',
  'modified',
  'survivor',
  'in_progress',
  'barn_find',
  'original',
  'tribute',
  'custom'
] as const

export type VehicleStatusTag = typeof VEHICLE_STATUS_TAGS[number]

export const VEHICLE_STATUS_LABELS: Record<VehicleStatusTag, string> = {
  restored: 'Restored',
  modified: 'Modified',
  survivor: 'Survivor',
  in_progress: 'In Progress',
  barn_find: 'Barn Find',
  original: 'Original',
  tribute: 'Tribute',
  custom: 'Custom'
}

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
] as const

export const RESERVED_USERNAMES = [
  'events',
  'vehicles',
  'admin',
  'settings',
  'dashboard',
  'sign-in',
  'sign-up',
  'map',
  'api',
  'about',
  'help',
  'privacy',
  'terms',
  'search',
  'explore',
  'garage',
  'new',
  'edit',
  'delete',
  'null',
  'undefined'
] as const

export const ADMIN_ACTION_TYPES = [
  'create',
  'update',
  'delete',
  'approve',
  'reject'
] as const

export type AdminActionType = typeof ADMIN_ACTION_TYPES[number]

export const ADMIN_TARGET_TYPES = [
  'event',
  'vehicle',
  'profile',
  'submission',
  'claim'
] as const

export type AdminTargetType = typeof ADMIN_TARGET_TYPES[number]
