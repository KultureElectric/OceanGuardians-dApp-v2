import { FC } from 'react';
import Link from "next/link";
export const ContentContainer: FC = props => {

  return (
    <div className="flex-1 grid overflow-auto">
      <div className="items-center">
        {props.children}
      </div>
    </div>
  );
};
