import { Button } from "antd";
import React, { useState } from "react";
import EditProductModal from "./EditProductModal";

interface EditProductsButtonProps {
  selectedRowKeys: any[];
  loading: boolean;
}

const EditProductsButton: React.FC<EditProductsButtonProps> = ({
  selectedRowKeys,
  loading,
}) => {
  const [showEditProductModal, setShowEditProductModal] =
    useState<boolean>(false);

  const onOk = () => {
    console.log(selectedRowKeys);
    setShowEditProductModal(false);
  };

  const onCancel = () => {
    setShowEditProductModal(false);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Button
        type="primary"
        onClick={() => setShowEditProductModal(true)}
        disabled={selectedRowKeys.length === 0}
        loading={loading}
      >
        Edit Products
      </Button>
      <EditProductModal
        visible={showEditProductModal}
        selectedItems={selectedRowKeys}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  );
};

export default EditProductsButton;
