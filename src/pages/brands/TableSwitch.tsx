import { message, Switch } from 'antd';
import { Brand } from 'interfaces/Brand';
import React, { useState } from 'react';
import { saveBrand } from 'services/DiscoClubService';
import { PauseModal } from './PauseModal';

export const TableSwitch: React.FC<{
  brand: Brand;
  reloadFn: Function;
  switchOnText;
  switchOffText;
  switchType;
}> = ({ brand, reloadFn, switchType }) => {
  const [isSwitchToggled, setIsSwitchToggled] = useState<boolean>(
    switchType === 'paused' ? !!brand.paused : !!brand.showOutOfStock
  );
  const [showModal, setShowModal] = useState<boolean>(false);

  const onCompletePausedAction = () => {
    reloadFn();
  };

  const handleSwitchChange = async () => {
    if (switchType === 'showOutOfStock') {
      try {
        brand.showOutOfStock = !brand.showOutOfStock;
        setIsSwitchToggled(toggled => !toggled);
        await saveBrand(brand);
        message.success('Register updated with success.');
      } catch (error) {
        message.error("Couldn't set brand property. Try again.");
      }
    } else {
      setShowModal(true);
    }
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
