import _ from "lodash";
import { useRouter } from "next/router";
import { useLinkRedirect } from "../../../../../src/inventory/inventoryHelper";

const Index = () => {
  const router = useRouter();
  const { ownerId, recordId } = router.query;

  if (typeof ownerId !== "string" || typeof recordId !== "string") {
    return <p>"error"</p>;
  }

  useLinkRedirect(ownerId, recordId);

  return <p>LOADING</p>;
};

export default Index;
