import { Switch } from 'antd';
import React, { useState } from 'react';

export const SimpleSwitch: React.FC<{
  toggled: boolean;
  handleSwitchChange: Function;
  loading?: boolean;
  disabled?: boolean;
}> = ({ toggled, handleSwitchChange, loading, disabled }) => {
  const [checked, setChecked] = useState<boolean>(toggled);

  return (
    <>
      <Switch
        onChange={toggled => {
          setChecked(toggled);
          handleSwitchChange(toggled);
        }}
        checked={checked}
        loading={loading ?? false}
        disabled={disabled ?? false}
      />
    </>
  );
};
