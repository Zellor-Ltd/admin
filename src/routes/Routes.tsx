import { useBuildTarget } from "hooks/useBuildTarget";
import AdminRoutes from "./AdminRoutes";
import BrandManagerRoutes from "./BrandManagerRoutes";

const Routes = () =>
  useBuildTarget({
    ADMIN: <AdminRoutes />,
    BRAND_MANAGER: <BrandManagerRoutes />,
  });

export default Routes;
