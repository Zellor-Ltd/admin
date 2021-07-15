import { useState } from "react";

type action = () => Promise<any>;

export const useLoading = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const doAction = async (action: action) => {
    setLoading(true);
    try {
      const result: any = await action();
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { loading, doAction };
};
