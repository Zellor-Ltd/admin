import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useEffect, useState } from 'react';
import { Category } from '../interfaces/Category';
import { fetchCategories } from '../services/DiscoClubService';

type SelectCategoryProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedCategory: Category | undefined) => {};
  allowClear?: boolean;
  label?: string;
};

export const SelectCategory: React.FC<SelectCategoryProps> = ({
  onChange,
  style,
  allowClear = true,
  label = 'Category Filter',
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>();

  const _onChange = (value: string) => {
    const selectedCategory = categories.find(
      category => category.id === value
    ) as Category | undefined;
    setSelectedCategoryName(selectedCategory?.name || '');
    onChange(selectedCategory);
  };

  useEffect(() => {
    const getCategories = async () => {
      try {
        const { results }: any = await fetchCategories();
        setCategories(results);
      } catch (e) {}
    };
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedCategoryName}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
      >
        {categories.map(({ name, id }) => (
          <Select.Option key={id} value={id}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
