import React from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import styled from "styled-components";
import { getPath, useInventory } from "../inventoryHelper";
import { DirectoryCard, LinkCard, ObjectCard } from "./RecordCard";

const GridStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export default function InventoryList() {
  const router = useRouter();
  const { slug, ownerId } = router.query;

  const path = getPath(slug);

  const { data } = useInventory(ownerId as string, path);

  return (
    <div>
      <GridStyle>
        {_.map(
          data,
          ({
            recordType,
            name,
            assetUri,
            webThumbnailUri,
            recordUri,
            assetId,
            viewerLink,
          }) => {
            const cardInput = {
              name,
              assetUri,
              viewerLink,
              webThumbnailUri,
              recordUri,
              assetId,
            };

            switch (recordType) {
              case "directory":
                return <DirectoryCard {...cardInput} />;
              case "link":
                return <LinkCard {...cardInput} />;
              case "object":
                return <ObjectCard {...cardInput} />;
              default:
                return null;
            }
          }
        )}
      </GridStyle>
    </div>
  );
}
