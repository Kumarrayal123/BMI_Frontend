import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiSearch, FiX, FiCheck } from "react-icons/fi";

export default function SearchableCheckboxDropdown({
  label,
  placeholder = "-- Select Options --",
  searchPlaceholder = "Search...",
  items = [], // Array of { id, title, subtitle, badge }
  selectedIds = [], // Array of selected ids
  onChange, // Callback: (newSelectedIds) => void
  accentColor = "indigo" // "indigo" | "emerald"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveChip = (e, id) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchTitle = (item.title || "").toLowerCase().includes(term);
    const matchSubtitle = (item.subtitle || "").toLowerCase().includes(term);
    return matchTitle || matchSubtitle;
  });

  const isEmerald = accentColor === "emerald";
  const themeClasses = {
    ring: isEmerald ? "focus:ring-emerald-500" : "focus:ring-indigo-500",
    borderActive: isEmerald ? "border-emerald-500" : "border-indigo-500",
    badgeBg: isEmerald ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200",
    chipBg: isEmerald ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-indigo-100 text-indigo-800 border-indigo-200",
    chipRemove: isEmerald ? "text-emerald-500 hover:text-emerald-900" : "text-indigo-500 hover:text-indigo-900",
    accent: isEmerald ? "accent-emerald-600" : "accent-indigo-600",
    checkedRowBg: isEmerald ? "bg-emerald-50/70 hover:bg-emerald-100/70" : "bg-indigo-50/70 hover:bg-indigo-100/70",
    checkIconColor: isEmerald ? "text-emerald-600" : "text-indigo-600"
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="relative w-full space-y-1.5" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${themeClasses.badgeBg}`}>
            {selectedCount} selected
          </span>
        </div>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl transition-all shadow-sm ${
          isOpen ? `ring-2 ${themeClasses.ring} ${themeClasses.borderActive}` : "hover:border-gray-300"
        }`}
      >
        <span className={selectedCount > 0 ? "font-medium text-gray-900" : "text-gray-400"}>
          {selectedCount > 0
            ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected`
            : placeholder}
        </span>
        <FiChevronDown
          className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <FiSearch className="text-gray-400 flex-shrink-0" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full text-xs bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                No matching results found
              </div>
            ) : (
              filteredItems.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors select-none ${
                      isChecked ? themeClasses.checkedRowBg : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(item.id)}
                      className={`w-4 h-4 rounded ${themeClasses.accent} cursor-pointer flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold truncate ${isChecked ? "text-gray-900" : "text-gray-700"}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span className="text-[10px] text-gray-400 block truncate">{item.subtitle}</span>
                      )}
                    </div>
                    {isChecked && <FiCheck className={themeClasses.checkIconColor} size={14} />}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected Items Chips Display */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedIds.map((id) => {
            const itemObj = items.find((it) => it.id === id);
            const displayTitle = itemObj ? itemObj.title : id;
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs ${themeClasses.chipBg}`}
              >
                <span>{displayTitle}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveChip(e, id)}
                  className={`ml-0.5 focus:outline-none ${themeClasses.chipRemove}`}
                >
                  <FiX size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
