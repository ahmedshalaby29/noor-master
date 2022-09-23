import { Transition } from "@headlessui/react";
import React from "react";

interface SlideTransitionProps {
  className?: string;
  show: boolean;
  key?: string | number;
  isRtl?: boolean;
  animation?: "slide" | "fade";
  as?: string;
}

const anim = (type?: SlideTransitionProps["animation"]) => ({
  enterFrom:
    type == "slide" ? "-translate-x-full" : type == "fade" ? "opacity-0" : "",
  enterTo:
    type == "slide" ? "translate-x-0" : type == "fade" ? "opacity-100" : "",
  leaveFrom:
    type == "slide" ? "translate-x-0" : type == "fade" ? "opacity-100" : "",
  leaveTo:
    type == "slide" ? "-translate-x-full" : type == "fade" ? "opacity-0" : "",
});

const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  className = "",
  show,
  key,
  isRtl,
  as = "div",
  animation, // todo fix animation absolute problem
}) => {
  return (
    <Transition
      as={as as any}
      show={show}
      appear={true}

      {...key}
      className={`${className}`}
      style={{ direction: isRtl ? "rtl" : "inherit" }}
      
      enter={animation?"transition ease-in-out duration-300 transform":""}
      leave={animation?"transition ease-in-out duration-300 transform":""}
      {...anim(animation)}
    >
      {children}
    </Transition>
  );
};

export default SlideTransition;
