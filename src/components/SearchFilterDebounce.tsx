import { SearchOutlined } from '@ant-design/icons';
import { Input, Typography } from 'antd';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

interface SearchFilterDebounceProps {
  filterFunction: (filterText: string) => void;
  initialValue?: string;
  label?: string;
  style?: React.CSSProperties;
  onPressEnter?: any;
  placeholder?: string;
}

export const SearchFilterDebounce: React.FC<SearchFilterDebounceProps> = ({
  filterFunction,
  initialValue = '',
  label = 'Search',
  style,
  onPressEnter,
  placeholder,
}) => {
  const [text, setText] = useState<string>(initialValue);

  const debounced = useRef(
    debounce(newText => {
      filterFunction(newText);
    }, 1000)
  );

  useEffect(() => debounced.current(text), [text]);

  return (
    <div style={style}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Input
        placeholder={placeholder}
        onPressEnter={onPressEnter}
        onChange={evt => {
          setText(evt.target.value);
        }}
        value={text}
        suffix={<SearchOutlined />}
      />
    </div>
  );
};
