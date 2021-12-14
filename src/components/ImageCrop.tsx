import React, { useState } from 'react';

import { Button, Modal } from 'antd';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropProps {
  src: string;
  isCropping: boolean;
  onFinish: (a: HTMLCanvasElement) => void;
  onCancel: CallableFunction;
  loading?: boolean;
}

const ImageCrop: React.FC<ImageCropProps> = ({
  src,
  isCropping,
  onFinish,
  onCancel,
  loading,
}) => {
  const [cropper, setCropper] = useState<any>();

  const finishCropping = () => {
    if (typeof cropper !== 'undefined') {
      onFinish(cropper.getCroppedCanvas());
    }
  };

  const cancel = () => onCancel();

  const footer: React.ReactNode = [
    <Button key="back" onClick={cancel}>
      Cancel
    </Button>,
    <Button
      key="submit"
      type="primary"
      loading={loading}
      onClick={finishCropping}
    >
      Crop
    </Button>,
  ];

  return (
    <Modal
      title="Select area to crop"
      centered
      visible={isCropping}
      onOk={finishCropping}
      okText="Crop"
      maskClosable={false}
      footer={footer}
    >
      <Cropper
        style={{ width: '100%' }}
        initialAspectRatio={1}
        src={src}
        viewMode={1}
        minCropBoxHeight={10}
        minCropBoxWidth={10}
        background={false}
        responsive={true}
        autoCropArea={1}
        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
        onInitialized={instance => {
          setCropper(instance);
        }}
        guides={true}
      />
    </Modal>
  );
};

export default ImageCrop;
