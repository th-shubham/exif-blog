import type { ReactNode } from 'react';
import { AiOutlineWarning } from 'react-icons/ai';
import { FiCheckSquare } from 'react-icons/fi';
import { toast } from 'sonner';

const DEFAULT_DURATION = 4000;

export const toastSuccess = (
  message: ReactNode,
  duration = DEFAULT_DURATION,
) => toast(
  message, {
    icon: <FiCheckSquare size={16} />,
    duration,
  },
);

export const toastWarning = (
  message: ReactNode,
  duration = DEFAULT_DURATION,
) => toast(
  message, {
    icon: <AiOutlineWarning size={16} />,
    duration,
  },
);
