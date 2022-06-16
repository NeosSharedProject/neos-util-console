import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import { useAssetAsJson } from "../../../src/inspector/inspectorHelper";
import Loading from "../../../src/common/component/Loading";

async function processTree(slot, func) {
  func(slot);
  const Children = _.get(slot, "Children", []);
  await Promise.all(Children.map((child) => processTree(child, func)));
}

function analyzeSlot(slot) {
  const [slotCount, setSlotCount] = useState<number>(0);
  const [componentMap, setComponentMap] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    setSlotCount(0);
    (async () => {
      await processTree(slot, (slot) => {
        if (slot) {
          setSlotCount((v) => v + 1);
          const components = _.get(slot, ["Components", "Data"], []);
          components.forEach((component) => {
            const type = _.get(component, "Type");
            if (type) {
              setComponentMap((v) => ({
                ...v,
                ...{ [type]: v[type] ? v[type] + 1 : 1 },
              }));
            }
          });
        }
      });
    })();
  }, [slot]);

  return { slotCount, componentMap };
}

export default function Index() {
  const router = useRouter();

  const { assetId } = router.query;
  const { data } = useAssetAsJson(assetId);
  const rootSlot = _.get(data, ["Object"], _.get(data, ["Slots"]));

  const { slotCount, componentMap } = analyzeSlot(rootSlot);

  return (
    <>
      {rootSlot ? (
        <>
          <div>SlotCount: {slotCount}</div>
          <div>ComponentCount: {_.sum(_.map(componentMap))}</div>
          <div>
            {_(
              _.map(componentMap, (count, key) => ({
                key,
                count,
              }))
            )
              .sortBy(({ count }) => -count)
              .map(({ count, key }) => (
                <div key={key}>
                  {key}: {count}
                </div>
              ))
              .value()}
          </div>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
