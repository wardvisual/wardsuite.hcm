import { apiRequest } from '@web/services/api.service';
import type { AuthUser } from '@web/modules/auth/types/auth.types';
import type { UpdateProfilePayload } from '../types/settings.types';

export const settingsApi = {
  updateProfile: (body: UpdateProfilePayload) =>
    apiRequest.patch<AuthUser>('/auth/profile', body),
};
