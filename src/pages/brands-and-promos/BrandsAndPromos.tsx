import { Tabs } from "antd";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Brands from "./Brands";
import Promos from "./Promos";

const BrandsAndPromos: React.FC<RouteComponentProps> = (props) => {
  return (
    <Tabs defaultActiveKey="Brands" size="large">
      <Tabs.TabPane tab="Brands" key="Brands">
        <Brands {...props}></Brands>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Promos" key="Promos">
        <Promos {...props}></Promos>
      </Tabs.TabPane>
    </Tabs>
  );
};

export default BrandsAndPromos;
