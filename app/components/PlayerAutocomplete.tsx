"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Props {
  players: string[];
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function PlayerAutocomplete({
  players, value, onChange, onSubmit, placeholder = "Type player name...", disabled, autoFocus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = value.trim().length > 0
    ? players.filter((p) => p.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    setHighlighted(0);
    setOpen(filtered.length > 0);
  }, [filtered.length]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlighted]) {
        select(filtered[highlighted]);
      } else {
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors text-sm disabled:bg-slate-50 disabled:text-slate-400"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          {filtered.map((name, i) => (
            <li
              key={name}
              onMouseDown={() => select(name)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${i === highlighted
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
                }
                ${i !== 0 ? "border-t border-slate-100" : ""}
              `}
            >
              {highlightMatch(name, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function highlightMatch(name: string, query: string) {
  if (!query.trim()) return <>{name}</>;
  const idx = name.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, idx)}
      <span className="text-teal-600 font-bold">{name.slice(idx, idx + query.length)}</span>
      {name.slice(idx + query.length)}
    </>
  );
}
