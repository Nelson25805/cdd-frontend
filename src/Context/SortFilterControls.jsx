// src/Context/SortFilterControls.jsx
import { useSortFilter }   from './useSortFilter';
import { CONSOLE_OPTIONS } from './consoleOptions';

const SortFilterControls = () => {
  const { sortDirection, setSortDirection, filterConsole, setFilterConsole } = useSortFilter();

  return (
    <div className="sort-filter-section">
      <p>Sort & Filter</p>
      <div>
        <p>Sort By:</p>
        <select value={sortDirection} onChange={e => setSortDirection(e.target.value)}>
          <option value="Ascending">Ascending</option>
          <option value="Descending">Descending</option>
        </select>
      </div>
      <div>
        <p>Filter By Console:</p>
        <select value={filterConsole} onChange={e => setFilterConsole(e.target.value)}>
          <option value="All">All</option>
          {CONSOLE_OPTIONS.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortFilterControls;
