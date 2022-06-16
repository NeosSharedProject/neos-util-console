import React from "react";
import Backdrop from "@mui/material/Backdrop";
import { CircularProgress } from "@mui/material";

export default function Index() {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
