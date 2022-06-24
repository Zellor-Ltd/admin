import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import Spin from 'antd/es/spin';
import 'antd/es/spin/style/css';
import debounce from 'lodash/debounce';
import { SelectOption } from '../../interfaces/SelectOption';

interface MultipleFetchDebounceSelectProps {
  onInput: (search?: string, loadNextPage?: boolean) => any;
  onChange: (value?: string, entity?: any) => void;
  onClear?: () => void;
  onFocus?: () => any;
  onBlur?: () => any;
  onInputKeyDown?: any;
  optionMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  debounceTimeout?: number;
  style?: React.CSSProperties;
  buffer?: any;
  setEof?: (eof: boolean) => void;
  loaded?: boolean;
  input?: string;
}

const MultipleFetchDebounceSelect: React.FC<
  MultipleFetchDebounceSelectProps
> = ({
  onInput,
  onChange,
  onClear,
  onFocus,
  onBlur,
  onInputKeyDown,
  optionMapping,
  placeholder,
  disabled,
  debounceTimeout = 1000,
  style,
  buffer,
  setEof,
  loaded,
  input,
}) => {
  const mounted = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [eoo, setEoo] = useState<boolean>(false);
  const fetchedEntities = useRef<any[]>([]);
  const [userInput, setUserInput] = useState<string | undefined>(input);
  const searchFilter = useRef<string | undefined>();
  const blurred = useRef(false);
  const pressedEnter = useRef(false);
  const loadNextPage = useRef(false);
  const [_value, _setValue] = useState<SelectOption>();

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
    if (!mounted.current) mounted.current = true;
    else {
      //on enter, no fetches or renders necessary.
      if (pressedEnter.current) {
        pressedEnter.current = false;
        return;
      }
      updateValues(userInput);
      debounceFetcher();
    }
  }, [userInput]);

  useEffect(() => {
    //hello, fellow coder. following code keeps track of input and updates rendered value inside select component.
    //i agree this looks redundant. spent hours trying to figure it out. couldn't. this works, though.
    updateValues(input);
  }, [input]);

  const updateValues = (value?: string) => {
    //searchFilter is used for fetches and is equal to userInput updated correctly (not changed on blur or on enter)
    //_value used for rerendering
    searchFilter.current = value;
    _setValue({
      key: value ?? '',
      value: value ?? '',
      label: value ?? '',
    });
  };

  const debounceFetcher = useMemo(() => {
    const loadOptions = () => {
      setEoo(false);
      setIsFetching(true);
      setOptions([]);
    };

    return debounce(loadOptions, debounceTimeout);
  }, [onInput, debounceTimeout, searchFilter.current]);

  const getOptions = () => {
    if (blurred.current) {
      blurred.current = false;
      setIsFetching(false);
      return;
    }
    onInput(searchFilter.current?.toLowerCase(), loadNextPage.current).then(
      entities => {
        if (loadNextPage.current) loadNextPage.current = false;
        if (entities.length < 30) {
          setEoo(true);
          if (loaded) setEof?.(true);
        }

        fetchedEntities.current = entities;
        const fetchedOptions = entities?.map(optionFactory);
        setOptions(prev => [...prev.concat(fetchedOptions)]);
        setIsFetching(false);
      }
    );
  };

  const _onChange = (option?: SelectOption) => {
    if (!option) return;
    const selectedEntity = fetchedEntities.current.find(
      entity =>
        entity[optionMapping.value].toLowerCase() === option.value.toLowerCase()
    );
    onChange(option.value, selectedEntity);
  };

  const _onClear = () => {
    setUserInput('');
    setOptions(buffer.map(optionFactory));
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

  const _onFocus = () => {
    if (!mounted.current) return;
    if (!buffer?.length) setUserInput('');
    else setOptions(buffer.map(optionFactory));
    onFocus?.();
  };

  const _onBlur = () => {
    blurred.current = true;
    updateValues(input);
    onBlur?.();
  };

  const _onInputKeyDown = (event: any) => {
    //flag not to fetch on enter
    if (event.key === 'Enter') pressedEnter.current = true;
    onInputKeyDown?.(event);
  };

  const filter = rows => {
    return rows.filter(
      row =>
        row.label?.toLowerCase().indexOf(userInput?.toLowerCase() ?? '') > -1
    );
  };

  return (
    <Select
      style={style}
      placeholder={placeholder}
      labelInValue
      showSearch
      allowClear
      filterOption={false}
      defaultActiveFirstOption={false}
      onBlur={_onBlur}
      onFocus={_onFocus}
      onChange={_onChange}
      onClear={_onClear}
      onSearch={setUserInput}
      value={searchFilter.current?.length ? _value : undefined}
      onInputKeyDown={_onInputKeyDown}
      onPopupScroll={event => handlePopupScroll(event.target)}
      notFoundContent={isFetching ? <Spin size="small" /> : null}
      options={
        isFetching
          ? filter(options).concat({
              label: (<Spin size="small" />) as unknown as string,
              value: 'loading',
              key: 'loading',
            })
          : filter(options)
      }
      disabled={disabled}
    ></Select>
  );
};

export default MultipleFetchDebounceSelect;
