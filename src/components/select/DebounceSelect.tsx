import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { SelectOption } from '../../interfaces/SelectOption';
import { LoadingOutlined } from '@ant-design/icons';

interface DebounceSelectProps {
  fetchOptions: (search?: string, loadNextPage?: boolean) => Promise<any[]>;
  onChange: (value?: string, entity?: any) => void;
  optionMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  value?: SelectOption;
  debounceTimeout?: number;
  style?: React.CSSProperties;
}

const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  onChange,
  optionMapping,
  placeholder,
  disabled,
  value,
  debounceTimeout = 800,
  style,
}) => {
  const [notFirstRender, setNotFirstRender] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [eoo, setEoo] = useState<boolean>(false);
  const [_value, _setValue] = useState<SelectOption | undefined>(value);
  const fetchedEntities = useRef<any[]>([]);
  const counter = useRef(0);
  const currentCounterValue = useRef<number>();
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
      setIsFetching(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (notFirstRender) {
      debounceSearch();
    } else {
      setNotFirstRender(true);
    }
  }, [searchFilter]);

  const debounceSearch = useMemo(() => {
    const loadOptions = () => {
      counter.current += 1;
      currentCounterValue.current = counter.current;
      setOptions([]);
      setIsFetching(true);
    };

    _setValue({
      key: searchFilter ?? '',
      label: searchFilter ?? '',
      value: searchFilter ?? '',
    });

    return debounce(loadOptions, debounceTimeout);
  }, [searchFilter]);

  const getOptions = () => {
    fetchOptions(searchFilter, loadNextPage.current).then(entities => {
      if (currentCounterValue.current !== counter.current) {
        // for fetch callback order
        return;
      }

      if (loadNextPage.current) loadNextPage.current = false;
      if (entities.length < 30) setEoo(true);

      fetchedEntities.current = entities;
      const fetchedOptions = entities?.map(optionFactory);
      setOptions(prev => [...prev.concat(fetchedOptions)]);
    });
  };

  const _onChange = (option?: {
    value: string;
    label: string;
    key: string;
  }) => {
    if (!option) {
      debounceSearch();
      onChange();
      return;
    }
    const selectedEntity = fetchedEntities.current.find(entity =>
      entity[optionMapping.value]
        .toUpperCase()
        .includes(option.value.toUpperCase())
    );
    onChange(option.value, selectedEntity);
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
      onFocus={() => debounceSearch()}
      onChange={_onChange}
      onSearch={setSearchFilter}
      onPopupScroll={event => handlePopupScroll(event.target)}
      notFoundContent={
        isFetching ? (
          <Spin spinning size="small" indicator={<LoadingOutlined spin />} />
        ) : null
      }
      options={options}
      disabled={disabled}
      value={_value}
      loading={isFetching}
    ></Select>
  );
};

export default DebounceSelect;
