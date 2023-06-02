import React, { useMemo, useRef, useState } from 'react';
import { Col, Image, Row, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { SelectOption } from '../../interfaces/SelectOption';

interface DebounceSelectProps {
  fetcherFunction: (search: string) => any;
  onChange: (value: string, entity?: any) => void;
  optionMapping: SelectOption;
  placeholder: string;
  disabled?: boolean;
  debounceTimeout?: number;
  style?: React.CSSProperties;
}

export const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetcherFunction,
  onChange,
  optionMapping,
  placeholder,
  disabled,
  debounceTimeout = 800,
  style,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [_selectedOption, _setSelectedOption] = useState<SelectOption>();
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string, isInit?: boolean) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      if (value) {
        // for fetch callback order
        if (fetchId !== fetchRef.current) return;

        fetcherFunction(value.toUpperCase()).then((response: any) => {
          if (!response?.results?.length) setOptions([]);
          else
            setOptions(
              response?.results?.map((item: any) => {
                return {
                  label: (
                    <Row justify="space-between">
                      <Col>{item?.feed?.shortDescription}</Col>
                      <Col>
                        {item.feed?.package?.length && (
                          <Image
                            height={25}
                            src={item.feed.package[0].thumbnailUrl}
                          />
                        )}
                      </Col>
                    </Row>
                  ) as unknown as string,
                  value: item.id,
                  key: item.id,
                };
              })
            );
          setFetching(false);

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
        });
      }
    };

    return debounce(loadOptions, debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcherFunction, debounceTimeout]);

  // todo start here on monday
  const _onChange = (option: { value: string; label: string; key: string }) => {
    const selectedEntity = options.find(entity =>
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
        disabled={disabled}
        value={_selectedOption}
        loading={fetching}
        style={style}
        options={options}
      />
    </div>
  );
};

export default DebounceSelect;
