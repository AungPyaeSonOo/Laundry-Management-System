import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <InputGroup style={{ maxWidth: '250px' }}>
      <InputGroup.Text className="bg-white border-end-0">
        <FiSearch className="text-secondary" />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border-start-0"
      />
    </InputGroup>
  );
};

export default SearchBar;