import { Switch } from 'antd';
import { Brand } from 'interfaces/Brand';
import React, { useState } from 'react';
import { PauseModal } from './PauseModal';

export const PauseSwitch: React.FC<{ brand: Brand; reloadFn: Function }> = ({
  brand,
  reloadFn,
}) => {
  const paused = brand.paused || false;
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);

  const onCompletePausedAction = () => {
    reloadFn();
  };

  const handlePausedChange = () => {
    setShowPauseModal(true);
  };

  return (
    <>
      <Switch onChange={handlePausedChange} checked={paused} />
      {showPauseModal && (
        <PauseModal
          showPauseModal={showPauseModal}
          setShowPauseModal={setShowPauseModal}
          brandId={brand.id}
          isBrandPaused={paused}
          onOk={onCompletePausedAction}
        />
      )}
    </>
  );
};
