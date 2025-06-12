// src/Context/SortFilterControls.jsx
import { useState, useRef, useEffect } from 'react';
import { useSortFilter } from './useSortFilter';
import { CONSOLE_OPTIONS } from './consoleOptions';
import '../App.css';

const SortFilterControls = () => {
  const {
    sortDirection,
    setSortDirection,
    filterConsole,
    setFilterConsole,
  } = useSortFilter();

  // 1) RESET sortDirection → "Ascending" every mount
  useEffect(() => {
    setSortDirection('Ascending');
  }, [setSortDirection]);

  // 2) RESET filterConsole → "All" every mount
  useEffect(() => {
    setFilterConsole('All');
  }, [setFilterConsole]);

  // Local state for the text input
  const [searchTerm, setSearchTerm] = useState(
    filterConsole === 'All' ? '' : filterConsole
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // Sync local searchTerm whenever filterConsole changes
  useEffect(() => {
    if (filterConsole === 'All') {
      setSearchTerm('');
    } else {
      setSearchTerm(filterConsole);
    }
  }, [filterConsole]);

  // 3) Safely coerce CONSOLE_OPTIONS into an array of strings
  const consoleNames = CONSOLE_OPTIONS.map(opt =>
    typeof opt === 'string' ? opt : opt.name
  );

  // 4) Filter suggestions only when searchTerm >= 2 chars
  const matchingConsoles =
    searchTerm.length >= 2
      ? consoleNames.filter(name =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // Click‐outside logic to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Handle typing
  const onInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (val === '') {
      setFilterConsole('All');
      setShowDropdown(false);
    } else if (val.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // When user picks a console
  const onSelectConsole = (consoleName) => {
    setSearchTerm(consoleName);
    setFilterConsole(consoleName);
    setShowDropdown(false);
  };

  // Enter to select if only one match
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && matchingConsoles.length === 1) {
      onSelectConsole(matchingConsoles[0]);
    }
  };

  return (
    <div className="sort-filter-section">
      <p>Sort By:</p>
      <div className="sort-by-options">
        <label className="sort-by-option">
          <input
            type="radio"
            name="sortDirection"
            value="Ascending"
            checked={sortDirection === 'Ascending'}
            onChange={(e) => setSortDirection(e.target.value)}
          />
          Ascending
        </label>
        <label className="sort-by-option">
          <input
            type="radio"
            name="sortDirection"
            value="Descending"
            checked={sortDirection === 'Descending'}
            onChange={(e) => setSortDirection(e.target.value)}
          />
          Descending
        </label>
      </div>

      <div ref={wrapperRef} className="filter-console-wrapper">
        <p>Filter By Console:</p>
        <input
          type="text"
          className="console-search-input"
          placeholder="Type at least 2 letters..."
          value={searchTerm}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (searchTerm.length >= 2) setShowDropdown(true);
          }}
        />

        {showDropdown && matchingConsoles.length > 0 && (
          <ul className="console-suggestions">
            {matchingConsoles.map((name) => (
              <li
                key={name}
                className="console-suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectConsole(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}

        {searchTerm === '' && filterConsole === 'All' && (
          <p className="console-hint">Showing all consoles</p>
        )}
      </div>
    </div>
  );
};

export default SortFilterControls;
