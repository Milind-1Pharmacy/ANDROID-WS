import {Badge} from 'native-base';
import React from 'react';

const P1Badge = ({children,style}: any) => {
  return (
    <Badge
      position="absolute"
      colorScheme="green"
      rounded="full"
      p={0}
      px={1}
      zIndex={1}
      variant="solid"
      alignSelf="center"
      _text={{
        fontSize: 12,
      }}
      style={style}
      >
      {children}
    </Badge>
  );
};

export default P1Badge;
