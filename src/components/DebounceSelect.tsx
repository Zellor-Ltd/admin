import React, { useMemo, useRef, useState } from 'react';

import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { useMount } from 'react-use';
import { SelectOption } from '../interfaces/SelectOption';

interface DebounceSelectProps {
  fetchOptions: (search: string) => Promise<any[]>;
  onChange: (value: string, entity?: any) => void;
  optionsMapping: SelectOption;
  disabled?: boolean;
  value?: string;
  debounceTimeout?: number;
}

const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  onChange,
  optionsMapping,
  disabled,
  value,
  debounceTimeout = 800,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const fetchedEntities = useRef<any[]>([]);
  const fetchRef = useRef(0);

  useMount(() => {
    if (value) {
      debounceFetcher(value);
    }
  });

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
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
        setOptions(
          entities.map(option => {
            return {
              label: option[optionsMapping.label],
              value: option[optionsMapping.value],
              key: option[optionsMapping.value],
            };
          })
        );
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
      placeholder="Type to search a Tag"
      labelInValue
      showSearch={true}
      filterOption={false}
      onChange={_onChange}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      disabled={disabled}
    />
  );
};

export default DebounceSelect;
