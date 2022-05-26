import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

export interface EditMultipleModalProps<T> {
  selectedItems: T[];
  visible: boolean;
  onCancel: () => void;
  onOk: Function;
}

interface EditProductsButtonProps {
  text?: string;
  arrayList: any[];
  selectedRowKeys: any[];
  onOk: Function;
  ModalComponent: React.FC<EditMultipleModalProps<any>>;
}

const EditMultipleButton: React.FC<EditProductsButtonProps> = ({
  text = 'Edit',
  arrayList,
  selectedRowKeys,
  onOk,
  ModalComponent,
}) => {
  const [showEditProductModal, setShowEditProductModal] =
    useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    setSelectedItems(
      arrayList.filter(item => selectedRowKeys.includes(item.id))
    );
  }, [arrayList, selectedRowKeys]);

  const _onOk = () => {
    setShowEditProductModal(false);
    onOk();
  };

  const onCancel = () => {
    setShowEditProductModal(false);
  };

  return (
    <div className="mb-1">
      <Button
        type="primary"
        onClick={() => setShowEditProductModal(true)}
        disabled={selectedItems.length === 0}
      >
        {text}
      </Button>
      <ModalComponent
        selectedItems={selectedItems}
        visible={showEditProductModal}
        onCancel={onCancel}
        onOk={_onOk}
      />
    </div>
  );
};

export default EditMultipleButton;
