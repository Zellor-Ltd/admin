import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useState } from 'react';

type SelectVideoTypeProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedStatus: string) => {};
  allowClear?: boolean;
  label?: string;
};

export const SelectVideoType: React.FC<SelectVideoTypeProps> = ({
  onChange,
  style,
  allowClear = true,
  label = 'Video Type',
}) => {
  const videoTypeList = ['Feed', 'Brand', 'Review'];
  const [selectedVideoType, setSelectedVideoType] = useState<string>('');

  const _onChange = (value: string) => {
    setSelectedVideoType(value);
    onChange(value);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedVideoType}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
      >
        {videoTypeList.map(value => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
