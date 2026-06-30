import { useState } from 'react';

import { useApiError } from '../../../hooks/useApiError';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequestDto } from '../types';

interface UseForgotPasswordResult {
  submit: (dto: ForgotPasswordRequestDto) => Promise<void>;
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
}

export function useForgotPassword(): UseForgotPasswordResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useApiError();

  const submit = async (dto: ForgotPasswordRequestDto): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(dto);
      setIsSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isSubmitted, error };
}
