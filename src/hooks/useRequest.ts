import { message } from "antd";
import React, { useState } from "react";

type action = () => Promise<any>;

export const useRequest = ({
  setLoading = () => {},
  successMsg = "Register updated with success.",
}: {
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  successMsg?: string;
} = {}) => {
  const [_loading, _setLoading] = useState<boolean>(false);

  const _setLoadingHandler = (v: boolean) => {
    _setLoading(v);
    setLoading(v);
  };

  const request = async (action: action, displayMessage: boolean) => {
    _setLoadingHandler(true);
    try {
      const { results }: { results: any[] } = await action();
      if (displayMessage) message.success(successMsg);
      _setLoadingHandler(false);
      return results;
    } catch (error) {
      _setLoadingHandler(false);
      throw error;
    }
  };

  const doFetch = (action: action) => request(action, false);
  const doRequest = (action: action) => request(action, true);

  return { doFetch, doRequest, loading: _loading };
};
