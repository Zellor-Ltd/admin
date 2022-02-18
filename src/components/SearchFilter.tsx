import { Input, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

interface SearchFilterProps {
  filterFunction: (filterText: string) => void;
  label?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filterFunction,
  label = 'Search',
}) => {
  const onChangeFilter = (evt: React.ChangeEvent<HTMLInputElement>) => {
    filterFunction(evt.target.value);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
    </div>
  );
};
