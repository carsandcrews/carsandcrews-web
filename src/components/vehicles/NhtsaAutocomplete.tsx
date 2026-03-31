'use client'

import { useState, useEffect, useRef } from 'react'

interface NhtsaAutocompleteProps {
  label: string
  value: string
  onChange: (value: string) => void
  year?: number
  make?: string
  endpoint?: 'makes' | 'models'
  placeholder?: string
}

export function NhtsaAutocomplete({
  label,
  value,
  onChange,
  year,
  make,
  endpoint = 'makes',
  placeholder
}: NhtsaAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isPreVin = year !== undefined && year < 1981

  useEffect(() => {
    setInputValue(value)
  }, [value])

  function handleChange(newValue: string) {
    setInputValue(newValue)
    onChange(newValue)

    if (isPreVin || !year || newValue.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        let url: string
        if (endpoint === 'models' && make) {
          url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
        } else {
          url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?year=${year}&format=json`
        }

        const res = await fetch(url)
        if (!res.ok) return

        const data = await res.json()
        const results: string[] = (data.Results || []).map((r: Record<string, string>) =>
          endpoint === 'models' ? r.Model_Name : r.MakeName
        )

        const filtered = results.filter((r) =>
          r.toLowerCase().includes(newValue.toLowerCase())
        )
        setSuggestions(filtered.slice(0, 10))
        setShowDropdown(filtered.length > 0)
      } catch {
        setSuggestions([])
        setShowDropdown(false)
      }
    }, 300)
  }

  function handleSelect(selected: string) {
    setInputValue(selected)
    onChange(selected)
    setShowDropdown(false)
    setSuggestions([])
  }

  const inputId = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-white/20"
      />
      {isPreVin ? (
        <p className="text-xs text-[#666]">Free text — NHTSA data not available for pre-1981 vehicles</p>
      ) : null}
      {showDropdown && suggestions.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-[#1a1a1d] border border-white/10 py-1 shadow-xl">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full px-4 py-2 text-left text-sm text-[#f5f5f0] hover:bg-white/10 transition-colors duration-150"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
