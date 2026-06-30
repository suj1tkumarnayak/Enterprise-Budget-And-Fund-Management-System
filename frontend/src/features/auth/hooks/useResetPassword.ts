import { useState } from 'react';

import { useApiError } from '../../../hooks/useApiError';
import { authApi } from '../api/authApi';
import type { ResetPasswordRequestDto } from '../types';

interface UseResetPasswordResult {
  submit: (dto: ResetPasswordRequestDto) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useResetPassword(): UseResetPasswordResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useApiError();

  const submit = async (dto: ResetPasswordRequestDto): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(dto);
      setIsSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isSuccess, error };
}
