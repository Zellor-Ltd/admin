import React, { useEffect, useState } from 'react';
import { SelectOption } from '../../interfaces/SelectOption';
import { Select } from 'antd';

interface SimpleSelectProps {
  data: any[];
  optionsMapping: SelectOption;
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
  optionsMapping,
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

  useEffect(() => {
    const optionFactory = (option: any) => {
      return {
        label: option[optionsMapping.label],
        value: option[optionsMapping.value],
        key: option[optionsMapping.value],
      };
    };

    setOptions(data.map(optionFactory));
  }, [data, optionsMapping.label, optionsMapping.value]);

  useEffect(() => {
    _setSelectedOption(selectedOption);
  }, [selectedOption]);

  const _onSearch = (input: any, option: any) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  };

  const _onChange = (value: string) => {
    const selectedEntity = data.find(
      entity => entity[optionsMapping.value] === value
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
