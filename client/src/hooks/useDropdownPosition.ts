import { useEffect, useState, useRef } from "react";

export function useDropdownPosition<T extends HTMLElement>() {
  const menuRef = useRef<T | null>(null);
  const [position, setPosition] = useState(
    "[&_div.absolute]:right-auto [&_div.absolute]:left-0"
  );

  useEffect(() => {
    function updatePosition() {
      if (menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const spaceOnLeft = menuRect.left;
        const spaceOnRight = window.innerWidth - menuRect.right;

        if (spaceOnLeft > spaceOnRight) {
          setPosition("[&_div.absolute]:left-auto [&_div.absolute]:right-0");
        } else {
          setPosition("[&_div.absolute]:right-auto [&_div.absolute]:left-0");
        }
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return { menuRef, position };
}
