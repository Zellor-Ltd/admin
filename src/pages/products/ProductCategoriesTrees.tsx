import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, FormInstance, Row } from "antd";
import { AllCategories, SelectedProductCategories } from "interfaces/Category";
import { useState, useEffect } from "react";
import ProductCategories from "./ProductCategories";

interface ProductCategoriesTreesProps {
  categories: SelectedProductCategories[] | undefined;
  allCategories: AllCategories;
  form: FormInstance;
  handleCategoryChange: Function;
}

const ProductCategoriesTrees: React.FC<ProductCategoriesTreesProps> = ({
  categories,
  allCategories,
  form,
  handleCategoryChange,
}) => {
  const [_categories, _setCategories] = useState<SelectedProductCategories[]>(
    categories || [{}]
  );

  const addCategoryTree = () => {
    _setCategories((prev) => [...prev, {}]);
  };

  const delCategoryTree = (index: number) => {
    const formCategories = form.getFieldValue("categories");
    form.setFieldsValue({
      categories: [
        ...formCategories.slice(0, index),
        ...formCategories.slice(index + 1),
      ],
    });
    _setCategories((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  return (
    <>
      <Col lg={24} xs={12}>
        {_categories.map((_: any, index: number) => (
          <Row
            key={index}
            justify="space-between"
            style={{ maxWidth: "1000px" }}
          >
            <ProductCategories
              productCategoryIndex={index}
              initialValues={_categories}
              allCategories={allCategories}
              handleCategoryChange={handleCategoryChange}
            />
            {_categories.length > 1 ? (
              <Button
                onClick={() => delCategoryTree(index)}
                type="link"
                style={{ padding: 0, marginTop: "30px" }}
              >
                Remove Category Tree
                <MinusOutlined />
              </Button>
            ) : (
              <div style={{ width: "168px" }}></div>
            )}
          </Row>
        ))}
        <Button
          onClick={addCategoryTree}
          type="link"
          style={{ padding: 0, marginTop: "-6px", marginBottom: "16px" }}
        >
          Add Category Tree
          <PlusOutlined />
        </Button>
      </Col>
    </>
  );
};

export default ProductCategoriesTrees;
