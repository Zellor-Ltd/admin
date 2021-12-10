import Select from 'antd/lib/select';
import React, { useContext, useEffect, useState } from 'react';
import { fetchFans } from '../services/DiscoClubService';
import { Fan } from '../interfaces/Fan';
import { Typography } from 'antd';
import { AppContext } from 'contexts/AppContext';

type SelectFanProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedFan: Fan) => {};
  allowClear?: boolean;
  label?: string;
};

export const SelectFan: React.FC<SelectFanProps> = ({
  onChange,
  placeholder = 'Select a fan',
  allowClear = true,
  style,
  label = 'Fan Filter',
}) => {
  const { filterValues, setFilterValues } = useContext(AppContext);
  const [fans, setFans] = useState<Fan[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>(filterValues[label]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedFan(filterValues[label]);
  }, [filterValues, label]);

  useEffect(() => {
    const getFans = async () => {
      try {
        setIsLoading(true);
        const { results }: any = await fetchFans();
        setFans(results.filter(fan => !!fan.user));
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    getFans();
  }, []);

  const _onChange = (value: string) => {
    setSelectedFan(value);
    setFilterValues(prev => ({ ...prev, [label]: value }));
    onChange(fans.find(fan => fan.user === value) as Fan);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedFan}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
        placeholder={placeholder}
        loading={isLoading}
      >
        {fans.map(fan => (
          <Select.Option key={fan.id} value={fan.user}>
            {fan.user}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
