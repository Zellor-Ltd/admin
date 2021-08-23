import APITestModal, {
  RecordAPIRequest,
  RecordAPITestModalProps,
} from "components/APITestModal";
import { Fan } from "interfaces/Fan";
import React from "react";
import { fetchFanFeed } from "services/DiscoClubService";

const getFanAPIRequests: (fan: Fan) => RecordAPIRequest[] = (fan) => [
  {
    name: "GetOne/{userId}",
    route: () => fetchFanFeed(fan.id),
    method: "GET",
    params: [],
  },
];

const FanAPITestModal: React.FC<RecordAPITestModalProps<Fan>> = (props) => {
  return (
    <APITestModal {...{ ...props, getRecordAPIRequests: getFanAPIRequests }} />
  );
};

export default FanAPITestModal;
