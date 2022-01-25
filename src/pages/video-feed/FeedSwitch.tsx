import { Switch } from 'antd';
import React, { useState } from 'react';

export const FeedSwitch: React.FC<{
  toggled: boolean;
  handleSwitchChange: Function;
}> = ({ toggled, handleSwitchChange }) => {
  const [checked, setChecked] = useState<boolean>(toggled);

  return (
    <>
      <Switch
        onChange={toggled => {
          setChecked(toggled);
          handleSwitchChange(toggled);
        }}
        checked={checked}
      />
    </>
  );
};
