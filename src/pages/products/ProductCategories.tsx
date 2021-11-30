import { Form, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import {
    AllCategories,
    ProductCategory,
    SelectedCategories,
    SelectedProductCategories,
} from "interfaces/Category";

const { categoriesArray } = categoriesSettings;

interface ProductCategoriesProps {
    allCategories: AllCategories;
    productCategoryIndex: number;
    initialValues: SelectedProductCategories[];
    handleCategoryChange: Function;
}

const formatProductCategories: (
    initialProductCategories: SelectedProductCategories
) => SelectedCategories = (initialProductCategories) => {
    const initialCategories: SelectedCategories = {
        superCategory: "",
    };
    Object.keys(initialProductCategories).forEach((key) => {
        const _key = key as keyof SelectedCategories;
        if (initialProductCategories[_key]) {
            initialCategories[_key] = initialProductCategories[_key]![_key];
        } else {
            delete initialCategories[_key];
        }
    });
    return initialCategories;
};

const ProductCategories: React.FC<ProductCategoriesProps> = ({
    allCategories,
    productCategoryIndex,
    initialValues,
    handleCategoryChange,
}) => {
    const { filteredCategories, filterCategory } = useAllCategories({
        initialValues: formatProductCategories(initialValues[productCategoryIndex]),
        allCategories,
    });

    const _handleCategoryChange = (value: string, key: string) => {
        const selectedCategories = categoriesArray
            .map(({ field: categoryField }) => {
                const selectedCategoryName = value;
                return filteredCategories[key as keyof AllCategories].find(
                    (category) =>
                        category[categoryField as keyof ProductCategory] === selectedCategoryName
                );
            })
            .filter((v) => v);

        handleCategoryChange(
            selectedCategories,
            productCategoryIndex,
            (form: FormInstance) => {
                filterCategory(value, key, (_field) => {
                    const formCategories = form.getFieldValue("categories");
                    formCategories[productCategoryIndex][_field] = undefined;
                    form.setFieldsValue({ categories: formCategories });
                });
            },
            key
        );
    };

    return (
        <>
            {categoriesArray.map(({ key, field }, _index) => (
                <Form.Item
                    key={_index}
                    label={key}
                    name={["categories", productCategoryIndex, field, "id"]}
                    rules={[{ required: _index < 2, message: `${key} is required` }]}
                >
                    <Select
                        disabled={!filteredCategories[key as keyof AllCategories].length}
                        allowClear={_index >= 2}
                        placeholder="Please select a category"
                        style={{ width: "180px" }}
                        onChange={(_, option: any) =>
                            _handleCategoryChange(option?.children as string, key)
                        }
                    >
                        {(
                            filteredCategories[
                            key as keyof AllCategories
                            ] as unknown as ProductCategory[]
                        ).map((category) => (
                            <Select.Option key={category.id} value={category.id}>
                                {category[field as keyof ProductCategory]}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            ))}
        </>
    );
};

export default ProductCategories;
