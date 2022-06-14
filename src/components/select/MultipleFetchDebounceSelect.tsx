import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import Spin from 'antd/es/spin';
import 'antd/es/spin/style/css';
import debounce from 'lodash/debounce';
import { SelectOption } from '../../interfaces/SelectOption';

interface MultipleFetchDebounceSelectProps {
  fetchOptions: (search?: string, loadNextPage?: boolean) => Promise<any[]>;
  onChange: (value?: string, entity?: any) => void;
  onClear?: () => void;
  optionMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  debounceTimeout?: number;
  style?: React.CSSProperties;
}

const MultipleFetchDebounceSelect: React.FC<
  MultipleFetchDebounceSelectProps
> = ({
  fetchOptions,
  onChange,
  onClear,
  optionMapping,
  placeholder,
  disabled,
  debounceTimeout = 1000,
  style,
}) => {
  const didMount = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [eoo, setEoo] = useState<boolean>(false);
  const fetchedEntities = useRef<any[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>();
  const loadNextPage = useRef(false);

  const optionFactory = (option: any) => {
    return {
      label: option[optionMapping.label],
      value: option[optionMapping.value],
      key: option[optionMapping.key],
    };
  };

  useEffect(() => {
    if (isFetching) {
      getOptions();
    }
  }, [isFetching]);

  useEffect(() => {
    if (!didMount.current) didMount.current = true;
    else debounceFetcher();
  }, [searchFilter]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = () => {
      setIsFetching(true);
      setOptions([]);
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, searchFilter]);

  const getOptions = () => {
    fetchOptions(searchFilter?.toLowerCase(), loadNextPage.current).then(
      entities => {
        if (loadNextPage.current) loadNextPage.current = false;
        if (entities.length < 30) setEoo(true);

        fetchedEntities.current = entities;
        const fetchedOptions = entities?.map(optionFactory);
        setOptions(prev => [...prev.concat(fetchedOptions)]);
        setIsFetching(false);
      }
    );
  };

  const _onChange = (option?: SelectOption) => {
    if (!option) return;
    const selectedEntity = fetchedEntities.current.find(entity =>
      entity[optionMapping.value]
        .toLowerCase()
        .includes(option.value.toLowerCase())
    );
    onChange(option.value, selectedEntity);
  };

  const _onClear = () => {
    setSearchFilter('');
    onClear?.();
  };

  const handlePopupScroll = (target: any) => {
    //following check makes sure getOptions isn't called midfetch, there's still more fans to fetch, user has scrolled all the way down
    if (
      target.scrollTop + target.offsetHeight === target.scrollHeight &&
      !isFetching &&
      !eoo
    ) {
      loadNextPage.current = true;
      setIsFetching(true);
      target.scrollTo(0, target.scrollHeight);
    }
  };

  return (
    <Select
      style={style}
      placeholder={placeholder}
      labelInValue
      showSearch
      allowClear
      filterOption={false}
      onFocus={() => setSearchFilter('')}
      onChange={_onChange}
      onClear={_onClear}
      onSearch={setSearchFilter}
      onPopupScroll={event => handlePopupScroll(event.target)}
      notFoundContent={isFetching ? <Spin size="small" /> : null}
      options={
        isFetching
          ? options.concat({
              label: (<Spin size="small" />) as unknown as string,
              value: 'loading',
              key: 'loading',
            })
          : options
      }
      disabled={disabled}
    ></Select>
  );
};

export default MultipleFetchDebounceSelect;
