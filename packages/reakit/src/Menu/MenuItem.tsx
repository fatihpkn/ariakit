import * as React from "react";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { warning } from "../__utils/warning";
import { unstable_createHook } from "../utils/createHook";
import { isTouchDevice } from "../__utils/isTouchDevice";
import { useMenuState, MenuStateReturn } from "./MenuState";

export type MenuItemOptions = RoverOptions &
  Pick<Partial<MenuStateReturn>, "visible" | "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemHTMLProps = RoverHTMLProps;

export type MenuItemProps = MenuItemOptions & MenuItemHTMLProps;

export const useMenuItem = unstable_createHook<
  MenuItemOptions,
  MenuItemHTMLProps
>({
  name: "MenuItem",
  compose: useRover,
  useState: useMenuState,

  propsAreEqual(prev, next) {
    if (
      prev.stops === next.stops &&
      prev.currentId === next.currentId &&
      prev.visible === false &&
      next.visible === false
    ) {
      return true;
    }
    return null;
  },

  useProps(options, htmlProps) {
    const ref = React.useRef<HTMLElement>(null);

    const onMouseOver = React.useCallback(() => {
      if (options.orientation !== "horizontal" && !isTouchDevice()) {
        if (!ref.current) {
          warning(
            true,
            "Can't respond to mouse over on `MenuItem` because `ref` wasn't passed to component. See https://reakit.io/docs/menu",
            "MenuItem"
          );
          return;
        }
        ref.current.focus();
      }
    }, [options.orientation]);

    const onMouseOut = React.useCallback(() => {
      if (ref.current) {
        // Ignores disclosure
        if (
          !ref.current.hasAttribute("aria-controls") ||
          ref.current.getAttribute("aria-expanded") !== "true"
        ) {
          ref.current.blur();
        }
        const menu = ref.current.closest(
          "[role=menu],[role=menubar]"
        ) as HTMLElement;
        if (menu) {
          const nestedMenu = menu.querySelector(
            "[role=menu]:not([hidden]),[role=menubar]:not([hidden])"
          );
          if (!nestedMenu && !isTouchDevice()) {
            options.move(null);
            menu.focus();
          }
        }
      }
    }, [options.move]);

    return unstable_mergeProps(
      {
        ref,
        role: "menuitem",
        onMouseOver,
        onMouseOut
      } as MenuItemHTMLProps,
      htmlProps
    );
  }
});

export const MenuItem = unstable_createComponent({
  as: "button",
  useHook: useMenuItem
});