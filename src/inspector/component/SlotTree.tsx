import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TreeItem from "@mui/lab/TreeItem";
import _ from "lodash";

import { useRouter } from "next/router";
import { useAssetAsJson } from "../inspectorHelper";
import { Card, Container, Stack, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Divider from "@mui/material/Divider";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Grid from "@mui/material/Grid";

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

function StyledTreeItem(props) {
  const {
    labelIcon: LabelIcon,
    slot,
    openNodes,
    deps = 0,
    pushSlotMap,
  } = props;

  const Name = _.get(slot, ["Name", "Data"]);
  const [opened, setOpened] = React.useState(false);
  const Children = _.get(slot, "Children", []);
  const childrenCount = _.size(Children);
  const id = _.get(slot, ["ID"]);

  React.useEffect(() => {
    setOpened(_.includes(openNodes, id));
  }, [openNodes]);
  React.useEffect(() => {
    pushSlotMap(Children);
  }, [opened]);

  return (
    <>
      <TreeItem nodeId={id} label={Name}>
        {childrenCount > 0 && (
          <>
            <Divider />
            {opened &&
              _.map(Children, (child) => {
                const id = _.get(child, "ID");
                return (
                  <StyledTreeItem
                    pushSlotMap={pushSlotMap}
                    key={id}
                    slot={child}
                    openNodes={openNodes}
                    deps={deps + 1}
                  />
                );
              })}
          </>
        )}
      </TreeItem>
    </>
  );
}

function InspectorSlot({ slot }) {
  const Name = _.get(slot, ["Name", "Data"]);
  const Components = _.get(slot, ["Components", "Data"], []);
  const Position = _.get(slot, ["Position"]);
  console.log(Position);

  return (
    <Stack spacing={2}>
      <Stack direction={"column"}>
        <Typography>{Name}</Typography>
      </Stack>
      {_.map(Components, (component) => {
        const type = _.get(component, ["Type"]);
        const data = _.get(component, ["Data"]);
        const id = _.get(component, ["Data", "ID"]);
        const props = _.get(component, ["Properties"]);
        return (
          <Card key={id} sx={{ padding: 2 }}>
            <Stack spacing={1.5}>
              <Typography>{type}</Typography>

              {_.map(data, (obj, key) => {
                const hasData = _.has(obj, "Data");
                const d = _.get(obj, "Data");
                return hasData ? (
                  <TextField
                    key={key}
                    id="standard-basic"
                    label={key}
                    disabled={true}
                    defaultValue={d}
                  />
                ) : null;
              })}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

export default function SlotTree() {
  const router = useRouter();

  const { assetId } = router.query;

  const { data } = useAssetAsJson(assetId);

  const rootSlot = _.get(data, ["Object"], _.get(data, ["Slots"]));

  const [openNodes, setOpenNodes] = React.useState<string[]>([]);

  const [slotMap, setSlotMap] = React.useState<{ [name: string]: any }>({});
  const pushSlotMap = (slots: any[]) => {
    const newSlotMap = _.reduce(
      slots,
      (prev, slot) => {
        const id = _.get(slot, "ID");
        return { ...prev, ...{ [id]: slot } };
      },
      slotMap
    );
    setSlotMap(newSlotMap);
  };

  const [selectedSlot, setSelectedSlot] = React.useState();

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            multiSelect={false}
            onNodeToggle={(_event, value) => {
              setOpenNodes(value);
            }}
            onNodeSelect={(_event, id) => {
              const slot = _.get(slotMap, [id]);
              setSelectedSlot(slot);
            }}
          >
            {data && (
              <StyledTreeItem
                pushSlotMap={pushSlotMap}
                slot={rootSlot}
                openNodes={openNodes}
              />
            )}
            {!data && (
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={true}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            )}
          </TreeView>
        </Grid>
        <Grid item xs={6}>
          {selectedSlot && <InspectorSlot slot={selectedSlot} />}
        </Grid>
      </Grid>
    </Container>
  );
}
