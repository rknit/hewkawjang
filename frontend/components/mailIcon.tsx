// components/icons/MailIcon.tsx

import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Updated props for better control in React Native
interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function MailIcon({
  width = 24,
  height = 24,
  color = 'black',
}: IconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color} // Use the color prop for the fill
    >
      <Path d="M1.75 3h20.5c.966 0 1.75.784 1.75 1.75v14a1.75 1.75 0 0 1-1.75 1.75H1.75A1.75 1.75 0 0 1 0 18.75v-14C0 3.784.784 3 1.75 3ZM12 12.813L2.26 6.012h19.48L12 12.813Zm-9.813-1.42L12 17.987l9.813-6.6-1.425-2.125-8.388 5.625-8.388-5.625L2.187 11.393Z" />
    </Svg>
  );
}
