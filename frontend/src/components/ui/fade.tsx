// components/Fade.tsx
import { motion } from 'framer-motion';
import { chakra, shouldForwardProp } from '@chakra-ui/system';
import { isValidMotionProp } from 'framer-motion';
import type { HTMLChakraProps } from '@chakra-ui/react'; // ✅ type-only import

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

type FadeProps = {
  in: boolean;
  children: React.ReactNode;
} & HTMLChakraProps<'div'>;

export const Fade = ({ in: isVisible, children, ...rest }: FadeProps) => {
  return (
    <MotionBox
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      style={{ transitionDuration: '0.4s' }} // ✅ optional visual fallback
      // @ts-expect-error: ignoring type mismatch for framer-motion transition prop
      transition={{ duration: 0.4 }} // ✅ use Framer Motion's `transition` directly
    >
      {children}
    </MotionBox>
  );
};
