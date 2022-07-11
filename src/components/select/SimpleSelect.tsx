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
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
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

  const _onSearch = (input: any, option: any) => {
    return option.label.toUpperCase().includes(input?.toUpperCase());
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
      placeholder={placeholder}
      style={style}
      onChange={_onChange}
      options={options}
      allowClear={allowClear}
      value={_selectedOption}
      loading={loading}
      disabled={disabled}
      showSearch={showSearch}
      filterOption={_onSearch}
    ></Select>
  );
};

export default SimpleSelect;
