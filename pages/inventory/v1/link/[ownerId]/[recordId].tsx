import _ from "lodash";
import { useRouter } from "next/router";
import { useLinkRedirect } from "../../../../../src/inventory/inventoryHelper";
import { Backdrop, CircularProgress } from "@mui/material";

const Index = () => {
  const router = useRouter();
  const { ownerId, recordId } = router.query;

  if (typeof ownerId !== "string" || typeof recordId !== "string") {
    return <p>"error"</p>;
  }
  useLinkRedirect(ownerId, recordId);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default Index;
