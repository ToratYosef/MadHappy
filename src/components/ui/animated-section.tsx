'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

export default function AnimatedSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (inView) setVisible(true);
  }, [inView]);

  if (prefersReducedMotion) return <div className={className} id={id}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } : {}}
    >
      {children}
    </motion.div>
  );
}
