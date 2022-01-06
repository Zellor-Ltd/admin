import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { SelectOption } from '../interfaces/SelectOption';

interface DebounceSelectProps {
  fetchOptions: (search: string) => Promise<any[]>;
  onChange: (value: string, entity?: any) => void;
  optionsMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  value?: string;
  debounceTimeout?: number;
}

const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  onChange,
  optionsMapping,
  placeholder,
  disabled,
  value,
  debounceTimeout = 800,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [_selectedOption, _setSelectedOption] = useState<SelectOption>();
  const fetchedEntities = useRef<any[]>([]);
  const fetchRef = useRef(0);

  const optionFactory = (option: any) => {
    return {
      label: option[optionsMapping.label],
      value: option[optionsMapping.value],
      key: option[optionsMapping.value],
    };
  };

  useEffect(() => {
    if (value) {
      debounceFetcher(value, true);
    }
  }, [value]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string, isInit?: boolean) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then(entities => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        fetchedEntities.current = entities;
        const options = entities.map(optionFactory);
        setOptions(options);

        if (isInit) {
          const selectedOption = options.find(option => option.label === value);
          _setSelectedOption(selectedOption);
        } else {
          _setSelectedOption(undefined);
        }

        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const _onChange = (option: { value: string; label: string; key: string }) => {
    const selectedEntity = fetchedEntities.current.find(
      entity => entity[optionsMapping.value] === option.value
    );
    onChange(option.value, selectedEntity);
  };

  return (
    <Select
      placeholder={placeholder}
      labelInValue
      showSearch={true}
      filterOption={false}
      onChange={_onChange}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      disabled={disabled}
      value={_selectedOption}
      loading={fetching}
    />
  );
};

export default DebounceSelect;
