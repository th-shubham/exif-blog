'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/state';

export type AnimationType = 'none' | 'scale' | 'left' | 'right';

export interface AnimationConfig {
  type?: AnimationType
  duration?: number
  staggerDelay?: number
  scaleOffset?: number
  distanceOffset?: number
}

interface Props extends AnimationConfig {
  className?: string
  classNameItem?: string
  items: JSX.Element[]
  animateFromAppState?: boolean
  animateOnFirstLoadOnly?: boolean
  staggerOnFirstLoadOnly?: boolean
}

function AnimateItems({
  className,
  classNameItem,
  items,
  type = 'scale',
  duration = 0.6,
  staggerDelay = 0.1,
  scaleOffset = 0.9,
  distanceOffset = 20,
  animateFromAppState,
  animateOnFirstLoadOnly,
  staggerOnFirstLoadOnly,
}: Props) {
  const {
    hasLoaded,
    nextPhotoAnimation,
    clearNextPhotoAnimation,
  } = useAppState();
  
  const hasLoadedInitial = useRef(hasLoaded);
  const nextPhotoAnimationInitial = useRef(nextPhotoAnimation);

  const shouldAnimate = type !== 'none' &&
    !(animateOnFirstLoadOnly && hasLoadedInitial.current);
  const shouldStagger =
    !(staggerOnFirstLoadOnly && hasLoadedInitial.current);

  const typeResolved = animateFromAppState
    ? (nextPhotoAnimationInitial.current?.type ?? type)
    : type;

  const durationResolved = animateFromAppState
    ? (nextPhotoAnimationInitial.current?.duration ?? duration)
    : duration;

  const getInitialVariant = () => {
    switch (typeResolved) {
    case 'left': return {
      opacity: 0,
      transform: `translateX(${distanceOffset}px)`,
    };
    case 'right': return {
      opacity: 0,
      transform: `translateX(${-distanceOffset}px)`,
    };
    default: return {
      opacity: 0,
      transform: `translateY(${distanceOffset}px) scale(${scaleOffset})`,
    };
    }
  };

  console.log('Animation debug', {
    type,
    duration,
    staggerDelay,
    scaleOffset,
    distanceOffset,
    animateFromAppState,
    animateOnFirstLoadOnly,
    staggerOnFirstLoadOnly,
    hasLoadedInitial,
    nextPhotoAnimationInitial,
    shouldAnimate,
    shouldStagger,
    typeResolved,
    durationResolved,
    initialVariant: getInitialVariant(),
  });

  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? 'hidden' : false}
      animate="show"
      variants={shouldStagger
        ? {
          show: {
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        } : undefined}
      onAnimationComplete={() => {
        if (animateFromAppState) {
          clearNextPhotoAnimation?.();
        }
      }}
    >
      {items.map((item, index) =>
        <motion.div
          key={index}
          className={classNameItem}
          // style={getInitialVariant()}
          variants={{
            hidden: getInitialVariant(),
            show: {
              opacity: 1,
              transform: 'translateX(0) translateY(0) scale(1)',
            },
          }}
          transition={{
            duration: durationResolved,
            easing: 'easeOut',
          }}
        >
          {item}
        </motion.div>)}
    </motion.div>
  );
};

export default AnimateItems;
