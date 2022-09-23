import React from "react";
import CustomButton from "../../components/home/customButton";
import SlideTransition from "./slideTransition";

export interface ActionButtonsProps {
  buttons: {
    label: string;
    onClick: () => any;
    icon?: boolean;
    secondary?: boolean;
    progress?: boolean;
    visible?: boolean;
  }[];
  enable?: boolean;
  loading?: boolean;
  show?: boolean;
}

export function createAction(action: ActionButtonsProps) {
  return action;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  enable = true,
  loading = false,
  show = true,
}) => {
  return (
    <SlideTransition
      as="ul"
      show={show}
      className="mt-4 space-x-4 text-center w-full flex justify-center"
    >
      {buttons
        .filter((e) => e.visible !== false)
        .map((button) => (
          <li key={button.label}>
            <CustomButton
              onClick={button.onClick}
              disabled={!enable || loading}
              loading={loading && button.progress}
              secondary={button.secondary}
              icon={!!button.icon}
            >
              {button.label}
            </CustomButton>
          </li>
        ))}
    </SlideTransition>
  );
};

export default ActionButtons;
