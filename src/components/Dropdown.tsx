import React, { useState, useRef, useEffect, useId } from 'react';
import { X } from 'lucide-react';
import type { DropdownItem } from '@/types';

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  closeOnClick?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const menuId = `${triggerId}-menu`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  const handleKeyDownItem = (event: React.KeyboardEvent, item: DropdownItem, index: number) => {
    const enabledItems = items.filter((i) => !i.divider && !i.disabled);
    const currentIndex = enabledItems.findIndex((i) => i === item);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextItem = enabledItems[currentIndex + 1];
        if (nextItem) {
          document.getElementById(`${menuId}-item-${items.indexOf(nextItem)}`)?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevItem = enabledItems[currentIndex - 1];
        if (prevItem) {
          document.getElementById(`${menuId}-item-${items.indexOf(prevItem)}`)?.focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        document.getElementById(`${menuId}-item-${items.findIndex((i) => !i.divider && !i.disabled)}`)?.focus();
        break;
      case 'End':
        event.preventDefault();
        const lastEnabled = [...enabledItems].pop();
        if (lastEnabled) {
          document.getElementById(`${menuId}-item-${items.indexOf(lastEnabled)}`)?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleItemClick(item);
        break;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        id={triggerId}
        aria-label="Abrir menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={`
            absolute top-full mt-1.5 z-[var(--z-dropdown)]
            min-w-[180px] max-w-[280px]
            bg-[var(--bg-card)] border border-[var(--border-default)]
            rounded-xl shadow-xl shadow-black/30
            overflow-hidden animate-in animate-slide-down
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={index}
                  role="separator"
                  className="border-t border-[var(--border-default)] my-1"
                  aria-orientation="horizontal"
                />
              );
            }

            return (
              <button
                key={index}
                id={`${menuId}-item-${index}`}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDownItem(e, item, index)}
                disabled={item.disabled}
                role="menuitem"
                tabIndex={-1}
                className={`
                  w-full px-4 py-2.5 text-left flex items-center gap-3
                  text-sm transition-colors duration-100
                  focus:bg-[var(--bg-card-hover)] focus:outline-none
                  ${item.danger
                    ? 'text-[var(--error)] hover:bg-[var(--error-bg)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {item.icon && <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--bg-input)] rounded text-[var(--text-tertiary)]" aria-hidden="true">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;