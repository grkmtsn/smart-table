import * as React from "react";

export default function useDidUpdateEffect(fn: any, inputs: any[]) {
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    if (didMountRef.current) {
      return fn();
    }
    didMountRef.current = true;
  }, inputs);
}
