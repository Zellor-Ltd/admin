import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { SelectOption } from '../../interfaces/SelectOption';

interface DebounceSelectProps {
  fetchOptions: (search: string) => any;
  onChange: (value: string, entity?: any) => void;
  optionMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  value?: string;
  debounceTimeout?: number;
  style?: React.CSSProperties;
}

export const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  onChange,
  optionMapping,
  placeholder,
  disabled,
  value,
  debounceTimeout = 800,
  style,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [_selectedOption, _setSelectedOption] = useState<SelectOption>();
  const fetchedEntities = useRef<any[]>([]);
  const fetchRef = useRef(0);

  const optionFactory = (option: any) => {
    console.log(`${optionMapping.label}: ${option[optionMapping.label]}`)
    return {
      label: option[optionMapping.label],
      value: option[optionMapping.value],
      key: option[optionMapping.key],
    };
  };

  useEffect(() => {
    if (value) {
      debounceFetcher(value, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string, isInit?: boolean) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value?.toUpperCase()).then(entities => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        fetchedEntities.current = entities;
        const options = entities.map(optionFactory);
        setOptions(options);

        if (isInit) {
          const selectedOption = options.find(option =>
            (option.label as string)
              ?.toUpperCase()
              .includes(value?.toUpperCase())
          );
          _setSelectedOption(selectedOption);
        } else {
          _setSelectedOption(undefined);
        }

        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOptions, debounceTimeout]);

  const _onChange = (option: { value: string; label: string; key: string }) => {
    const selectedEntity = fetchedEntities.current.find(entity =>
      entity[optionMapping.value]
        ?.toUpperCase()
        .includes(option.value?.toUpperCase())
    );
    onChange(option.value, selectedEntity);
  };

  return (
    <div style={style}>
      <Select
        placeholder={placeholder}
        labelInValue
        showSearch
        filterOption={false}
        onChange={_onChange}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        options={options}
        disabled={disabled}
        value={_selectedOption}
        loading={fetching}
        style={style}
      />
    </div>
  );
};

export default DebounceSelect;
