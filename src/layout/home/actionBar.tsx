import React from "react";
import CustomButton from "../../components/home/customButton";
import SlideTransition from "./slideTransition";

export interface ActionButtonsProps {
  actions: ActionButtonProps[];
}
export interface ActionButtonProps {
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

export function createAction(action: ActionButtonProps) {
  return action;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions }) => {
  return (
    <div className="flex justify-center">
      {actions.map((action) => (
        <SlideTransition
          as="ul"
          show={action.show!}
          className="mt-4 mx-7 space-x-3 text-center flex justify-center"
        >
          {action.buttons
            .filter((e) => e.visible !== false)
            .map((button) => (
              <li key={button.label}>
                <CustomButton
                  onClick={button.onClick}
                  disabled={!action.enable || action.loading}
                  loading={action.loading && button.progress}
                  secondary={button.secondary}
                  icon={!!button.icon}
                >
                  {button.label}
                </CustomButton>
              </li>
            ))}
        </SlideTransition>
      ))}
    </div>
  );
};

export default ActionButtons;
