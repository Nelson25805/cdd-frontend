// src/Context/useSortFilter.js
import { useContext } from 'react';
import { SortFilterContext } from './SortFilterContext';

export function useSortFilter() {
  const ctx = useContext(SortFilterContext);
  if (!ctx) throw new Error('useSortFilter must be inside SortFilterProvider');
  return ctx;
}
