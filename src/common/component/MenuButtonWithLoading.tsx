import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";

export default function MenuButtonWithLoading({
  handleAction,
  SuccessIcon,
  DefaultIcon,
  name,
}) {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const timer = React.useRef<number>();

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleButtonClick = async () => {
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      await handleAction();
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <MenuItem onClick={handleButtonClick}>
      <ListItemIcon>
        {success ? (
          <SuccessIcon fontSize="small" />
        ) : (
          <DefaultIcon fontSize="small" />
        )}
        {loading && (
          <CircularProgress
            size={68}
            sx={{
              color: green[500],
              position: "absolute",
              top: -4,
              left: 5,
              zIndex: 1,
              m: 1,
              maxWidth: 27,
              maxHeight: 27,
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText>{name}</ListItemText>
    </MenuItem>
  );
}
