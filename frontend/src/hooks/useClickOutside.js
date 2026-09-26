import { useEffect } from "react";

export default function useClickOutside(ref, onOutside, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [ref, onOutside, enabled]);
}
