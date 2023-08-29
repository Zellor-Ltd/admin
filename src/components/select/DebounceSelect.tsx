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
  const data = useRef<any[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [_selectedOption, _setSelectedOption] = useState<SelectOption>();
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string, isInit?: boolean) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      data.current = [];
      setFetching(true);

      if (value) {
        // for fetch callback order
        if (fetchId !== fetchRef.current) return;

        fetcherFunction(value.toUpperCase()).then((response: any) => {
          if (!response?.results?.length) return;
          else {
            data.current = response.results;
            setOptions(
              response?.results?.map((item: any) => {
                return {
                  label: (
                    <Row justify="space-between">
                      <Col>{item?.shortDescription}</Col>
                      <Col>
                        {item.package?.length && (
                          <Image
                            height={25}
                            src={item.thumbnailUrl}
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
          }
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

  const _onChange = (option: { value: string; label: string; key: string }) => {
    const selectedEntity = data.current.find(entity =>
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
