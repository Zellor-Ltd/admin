import { message, Switch } from 'antd';
import { Brand } from 'interfaces/Brand';
import React, { useState } from 'react';
import { saveBrand } from 'services/DiscoClubService';

export const TableSwitch: React.FC<{
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
