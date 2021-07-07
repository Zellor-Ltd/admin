import { Tabs } from "antd";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Brands from "./Brands";
import PromoCodes from "./PromoCodes";

const BrandsAndPromos: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
  const params = new URLSearchParams(location.search);

  const selectedTab = params.get("selected-tab") || "Brands";

  return (
    <Tabs defaultActiveKey={selectedTab} size="large">
      <Tabs.TabPane tab="Brands" key="Brands">
        <Brands {...props}></Brands>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Promos" key="Promos">
        <PromoCodes {...props}></PromoCodes>
      </Tabs.TabPane>
    </Tabs>
  );
};

export default BrandsAndPromos;
