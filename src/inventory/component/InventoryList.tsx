import React from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import {
  getPath,
  useInventory,
  useInventoryLinkActive,
} from "../inventoryHelper";
import { RecordCard } from "./RecordCard";
import {
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Box,
  TableContainer,
  Paper,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useLocalStorage } from "../../helper";

function InventoryLink({ name, ownerId, path }) {
  const { data } = useInventoryLinkActive(ownerId, path);
  const dataSize = _.size(data);
  const link = `/inventory/v1/viewer/${ownerId}/${path}`;
  if (dataSize > 0) {
    return (
      <Link underline="hover" color="inherit" href={link}>
        {`${name}(${dataSize})`}
      </Link>
    );
  } else {
    return <Typography color="text.primary">{name}</Typography>;
  }
}

export default function InventoryList() {
  const router = useRouter();
  const { slug, ownerId } = router.query;

  const [modeState] = useLocalStorage("Util.Mode");

  if (typeof ownerId !== "string") {
    return <p>Error</p>;
  }

  const path = getPath(slug);

  const { data } = useInventory(ownerId, path);
  return (
    <Container sx={{ marginBottom: 10 }}>
      <Box
        sx={{
          minHeight: 50,
          alignItems: "center",
          display: "flex",
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href={`/inventory/v1/top`}>
            Top
          </Link>
          {_.map(slug, (str, index) => {
            const path = _.join(_.slice(slug, 0, index + 1), "/");
            if (index + 1 === _.size(slug)) {
              return (
                <Typography key={index} color="text.primary">{`${str}(${_.size(
                  data
                )})`}</Typography>
              );
            } else {
              return (
                <InventoryLink
                  key={index}
                  name={str}
                  ownerId={ownerId}
                  path={path}
                />
              );
            }
          })}
        </Breadcrumbs>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">CreationTime</TableCell>
              {modeState == "advanced" && (
                <TableCell align="right">lastModifyingUserId</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {_.map(
              data,
              ({
                id,
                recordType,
                name,
                assetUri,
                webThumbnailUri,
                recordUri,
                assetId,
                viewerLink,
                link,
                ownerName,
                lastModificationTime,
                lastModifyingUserId,
                assetOwnerId,
                creationTime,
              }) => (
                <RecordCard
                  key={id}
                  recordType={recordType}
                  name={name}
                  assetUri={assetUri}
                  viewerLink={viewerLink}
                  webThumbnailUri={webThumbnailUri}
                  recordUri={recordUri}
                  assetId={assetId}
                  link={link}
                  ownerName={ownerName}
                  lastModificationTime={lastModificationTime}
                  lastModifyingUserId={lastModifyingUserId}
                  assetOwnerId={assetOwnerId}
                  creationTime={creationTime}
                />
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
