// components/MailIcon.tsx

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

interface MailIconProps extends SvgProps {
  color?: string; // Allow custom color prop
}

const MailIcon: React.FC<MailIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color} // Use the color prop here
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // Pass any other SVG props
    >
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></Path>
      <Path d="m22 6-10 7L2 6"></Path>
    </Svg>
  );
};

export default MailIcon;
