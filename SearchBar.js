import React from 'react';

const SearchBar = ({ value, onChange }) => (
  <div className="search-bar">
    <input
      type="text"
      placeholder="Search notes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
