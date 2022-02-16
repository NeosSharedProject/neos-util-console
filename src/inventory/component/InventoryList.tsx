import React from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import styled from "styled-components";
import { getPath, useInventory } from "../inventoryHelper";
import { RecordCard } from "./RecordCard";

const GridStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: auto;
  marin-right: auto;
`;

const ContentAreaStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: 15px;
  margin-left: 15px;
`;

export default function InventoryList() {
  const router = useRouter();
  const { slug, ownerId } = router.query;

  if (typeof ownerId !== "string") {
    return <p>Error</p>;
  }

  const path = getPath(slug);

  const { data } = useInventory(ownerId, path);

  return (
    <GridStyle>
      <p>
        {ownerId} / {decodeURI(path)}
      </p>
      <ContentAreaStyle>
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
            link,
          }) => (
            <RecordCard
              recordType={recordType}
              name={name}
              assetUri={assetUri}
              viewerLink={viewerLink}
              webThumbnailUri={webThumbnailUri}
              recordUri={recordUri}
              assetId={assetId}
              link={link}
            />
          )
        )}
      </ContentAreaStyle>
    </GridStyle>
  );
}
