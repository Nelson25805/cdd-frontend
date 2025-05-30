// src/Context/SortFilterContext.jsx
import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const SortFilterContext = createContext();

export const SortFilterProvider = ({ children }) => {
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [filterConsole, setFilterConsole] = useState('All');

  return (
    <SortFilterContext.Provider
      value={{ sortDirection, setSortDirection, filterConsole, setFilterConsole }}
    >
      {children}
    </SortFilterContext.Provider>
  );
};

SortFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
