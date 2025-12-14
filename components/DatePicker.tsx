"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  allowPresent = false,
  className = ""
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse existing value
  useEffect(() => {
    if (value === "Present" || value === "") {
      setSelectedMonth(null);
      setSelectedYear(null);
      return;
    }

    // Try to parse "Month Year" format (e.g., "January 2024")
    const monthMatch = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (monthMatch) {
      const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthMatch[1].toLowerCase());
      if (monthIndex !== -1) {
        setSelectedMonth(monthIndex);
        setSelectedYear(parseInt(monthMatch[2]));
        return;
      }
    }

    // Try to parse "MMM YYYY" format (e.g., "Jan 2024")
    const shortMonthMatch = value.match(/^([A-Za-z]{3})\s+(\d{4})$/);
    if (shortMonthMatch) {
      const shortMonths = MONTHS.map(m => m.substring(0, 3));
      const monthIndex = shortMonths.findIndex(m => m.toLowerCase() === shortMonthMatch[1].toLowerCase());
      if (monthIndex !== -1) {
        setSelectedMonth(monthIndex);
        setSelectedYear(parseInt(shortMonthMatch[2]));
        return;
      }
    }

    // Try to parse year only (e.g., "2024")
    const yearMatch = value.match(/^(\d{4})$/);
    if (yearMatch) {
      setSelectedYear(parseInt(yearMatch[1]));
      setSelectedMonth(null);
      return;
    }
  }, [value]);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    updateValue(monthIndex, selectedYear);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    updateValue(selectedMonth, year);
  };

  const updateValue = (month: number | null, year: number | null) => {
    if (year === null) return;
    
    if (month !== null) {
      onChange(`${MONTHS[month]} ${year}`);
    } else {
      onChange(`${year}`);
    }
  };

  const handlePresent = () => {
    if (allowPresent) {
      onChange("Present");
      setSelectedMonth(null);
      setSelectedYear(null);
      setShowPicker(false);
    }
  };

  const handleClearMonth = () => {
    setSelectedMonth(null);
    if (selectedYear) onChange(`${selectedYear}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format display value
  const getDisplayValue = () => {
    if (value === "Present") return "Present";
    if (value === "" || (!selectedMonth && !selectedYear)) return placeholder;
    if (selectedMonth !== null && selectedYear) return `${MONTHS[selectedMonth]} ${selectedYear}`;
    if (selectedYear) return `${selectedYear}`;
    return placeholder;
  };

  const displayValue = getDisplayValue();
  const hasValue = value !== "" && value !== placeholder;

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={`flex-1 flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all ${className} ${
            hasValue ? "text-gray-900" : "text-gray-500"
          }`}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${showPicker ? "rotate-180" : ""}`} />
        </button>
        {allowPresent && (
          <button
            type="button"
            onClick={handlePresent}
            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all whitespace-nowrap ${
              value === "Present" 
                ? "bg-blue-600 text-white border-blue-600 font-medium shadow-sm" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            Present
          </button>
        )}
      </div>

      {showPicker && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5">
          <div className="grid grid-cols-2 gap-0">
            {/* Month Picker */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Month</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <button
                  onClick={handleClearMonth}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    selectedMonth === null && selectedYear ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600"
                  }`}
                >
                  Year only
                </button>
                {MONTHS.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleMonthSelect(index)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedMonth === index ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Picker */}
            <div>
              <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedYear === year ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
