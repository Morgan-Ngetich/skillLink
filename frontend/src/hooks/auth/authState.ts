import { queryClient } from '../lib/queryClient';
import { fetchCurrentUser } from './useAuthQuery';

export async function isLoggedIn() {
  try {
    const user = await queryClient.ensureQueryData({
      queryKey: ['auth', 'user'],
      queryFn: fetchCurrentUser,
    });
    return Boolean(user);
  } catch {
    return false;
  }
}