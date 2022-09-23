import React from "react";
import Card from "../../components/home/card";
import PageTitle from "../../components/home/pageTitle";
import ActionButtons, { ActionButtonsProps } from "./actionBar";

interface PageProps {
  title?: string;
  loading?: boolean;
  size?: "md" | "lg" | "sm";
  actions?: ActionButtonsProps;
}

const Page: React.FC<PageProps> = ({
  title,
  children,
  loading = false,
  size = "sm",
  actions,
}) => {
  return (
    <div className="flex flex-1 h-full flex-col">
      {title && <PageTitle title={title!} />}

      <div
        className={`mt-4 h-full flex flex-col max-w-sm mx-auto w-full overflow-hidden rounded-md
            ${size == "lg" ? "md:max-w-xl" : ""}
            ${size == "md" ? "md:max-w-lg" : ""}
        `}
      >
        <Card loading={loading}>
          <div className="flex-1">{children}</div>
          {actions && <ActionButtons {...actions} />}
        </Card>
      </div>
    </div>
  );
};

export default Page;
