import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Breadcrumbs } from "@mui/material";
import Link from "@mui/material/Link";
import { useRouter } from "next/router";
import _ from "lodash";

export default function AppBarTop() {
  const router = useRouter();
  router.basePath;
  const appCode = _.get(_.split(router.pathname, "/"), 1);
  const appInfo = _.get(
    { inventory: { name: "InventoryViewer", link: "/inventory/v1/top" } },
    appCode
  );
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}

          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ color: "white", fontsize: 30 }}
          >
            <Typography
              variant="h6"
              component={Link}
              sx={{ color: "white" }}
              href={"/"}
            >
              Neos Util Console
            </Typography>
            {appInfo && (
              <Typography
                variant="h6"
                component={Link}
                sx={{ flexGrow: 1, color: "white" }}
                href={appInfo.link}
              >
                {appInfo.name}
              </Typography>
            )}
          </Breadcrumbs>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
