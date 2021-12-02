import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useState } from 'react';

type SelectStatusProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedStatus: string) => {};
  allowClear?: boolean;
  label?: string;
};

export const SelectStatus: React.FC<SelectStatusProps> = ({
  onChange,
  style,
  allowClear = true,
  label = 'Status',
}) => {
  const statusList = ['Live', 'Paused'];
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const _onChange = (value: string) => {
    setSelectedStatus(value);
    onChange(value);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedStatus}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
      >
        {statusList.map(statusName => (
          <Select.Option key={statusName} value={statusName}>
            {statusName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
