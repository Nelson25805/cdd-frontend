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

  // 1) RESET sortDirection → "Ascending" every time this component mounts
  useEffect(() => {
    setSortDirection('Ascending');
  }, [setSortDirection]);

  // 2) RESET filterConsole → "All" every time this component mounts
  useEffect(() => {
    setFilterConsole('All');
  }, [setFilterConsole]);

  // Local state for the text input
  const [searchTerm, setSearchTerm] = useState(
    filterConsole === 'All' ? '' : filterConsole
  );
  // Whether to show the dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Ref on the wrapper to detect clicks outside
  const wrapperRef = useRef(null);

  // Sync local searchTerm whenever filterConsole changes
  useEffect(() => {
    if (filterConsole === 'All') {
      setSearchTerm('');
    } else {
      setSearchTerm(filterConsole);
    }
  }, [filterConsole]);

  // Filtered list of console names matching searchTerm (only once 2+ letters typed)
  const matchingConsoles =
    searchTerm.length >= 2
      ? CONSOLE_OPTIONS.filter((name) =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // Click‐outside logic: if user clicks outside of the wrapper, close dropdown
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

  // Handler when user types into the search box
  const onInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    // If they clear it fully, reset filterConsole to “All”
    if (val === '') {
      setFilterConsole('All');
      setShowDropdown(false);
    } else if (val.length >= 2) {
      setShowDropdown(true);
    } else {
      // If length < 2, don’t show any suggestions
      setShowDropdown(false);
    }
  };

  // Handler when user clicks a suggestion
  const onSelectConsole = (consoleName) => {
    setSearchTerm(consoleName);
    setFilterConsole(consoleName);
    setShowDropdown(false);
  };

  // If user hits Enter in the box when there’s exactly one match, pick it automatically
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
            if (searchTerm.length >= 2) {
              setShowDropdown(true);
            }
          }}
        />

        {/* Dropdown suggestions */}
        {showDropdown && matchingConsoles.length > 0 && (
          <ul className="console-suggestions">
            {matchingConsoles.map((name) => (
              <li
                key={name}
                className="console-suggestion-item"
                onMouseDown={(e) => {
                  // Prevent the input from losing focus before the click handler fires
                  e.preventDefault();
                }}
                onClick={() => onSelectConsole(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}

        {/* “Showing all consoles” hint */}
        {searchTerm === '' && filterConsole === 'All' && (
          <p className="console-hint">
            Showing all consoles
          </p>
        )}
      </div>
    </div>
  );
};

export default SortFilterControls;
