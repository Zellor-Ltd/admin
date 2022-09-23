/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { SelectOption } from '../../interfaces/SelectOption';
import { Select } from 'antd';

interface SimpleSelectProps {
  data: any[];
  optionMapping: SelectOption;
  onChange?: (value: string, entity?: any) => void;
  selectedOption?: string | null;
  allowClear?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
  className?: string;
  id?: string;
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
  id,
  data,
  optionMapping,
  onChange,
  selectedOption,
  allowClear,
  placeholder,
  style,
  loading,
  disabled,
  showSearch = true,
  className,
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [_selectedOption, _setSelectedOption] = useState<string | null>();

  const optionFactory = (option: any) => {
    return {
      label: option[optionMapping.label],
      value: option[optionMapping.value],
      key: option[optionMapping.value],
    };
  };

  useEffect(() => {
    setOptions(data.map(optionFactory));
  }, [data]);

  useEffect(() => {
    _setSelectedOption(selectedOption);
  }, [selectedOption]);

  const _filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const _onChange = (value: string) => {
    const selectedEntity = data.find(
      entity => entity[optionMapping.value] === value
    );
    _setSelectedOption(value);
    onChange?.(value, selectedEntity);
  };

  return (
    <Select
      id={id}
      placeholder={placeholder}
      style={style}
      onChange={_onChange}
      options={options}
      allowClear
      value={_selectedOption}
      loading={loading}
      disabled={disabled}
      showSearch
      filterOption={_filterOption}
      className={className}
    ></Select>
  );
};

export default SimpleSelect;
