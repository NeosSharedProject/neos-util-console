import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useLocalStorage } from "../src/helper";
interface SafeHydrateProps {
  children: JSX.Element | JSX.Element[];
}

const SafeHydrate = (props: SafeHydrateProps) => {
  const router = useRouter();
  const { mode } = router.query;

  const [_state, setModeState] = useLocalStorage("Util.Mode");
  useEffect(() => {
    if (
      mode &&
      typeof mode === "string" &&
      typeof setModeState === "function"
    ) {
      setModeState(mode);
    }
  }, []);
  return <>{props.children}</>;
};

export default SafeHydrate;
