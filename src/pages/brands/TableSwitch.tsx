import { Switch } from 'antd';
import { Brand } from 'interfaces/Brand';
import React, { useState } from 'react';
import { PauseModal } from './PauseModal';

export const TableSwitch: React.FC<{ brand: Brand; reloadFn: Function, 
  switchOnText,
  switchOffText,
  switchType,}> = ({
  brand,
  reloadFn,
  switchType,
}) => {
  const isSwitchToggled = switchType === 'paused' ? brand.paused || false : brand.showOutOfStock || false;
  const [showModal, setShowModal] = useState<boolean>(false);

  const onCompletePausedAction = () => {
    reloadFn();
  };

  const handleSwitchChange = () => {
    switchType === 'paused' ? setShowModal(true) : brand.showOutOfStock = 
  };

  return (
    <>
      <Switch onChange={handleSwitchChange} checked={isSwitchToggled} />
      {showModal && (
        <PauseModal
          showPauseModal={showModal}
          setShowPauseModal={setShowModal}
          brandId={brand.id}
          isBrandPaused={brand.paused || false}
          onOk={onCompletePausedAction}
        />
      )}
    </>
  );
};
