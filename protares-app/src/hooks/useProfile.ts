import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/services/supabase';
import { setAvailability, updateProfile } from '@/services/responders';
import { useAuthStore } from '@/stores/auth';
import type { AvailabilityStatus, Responder } from '@/types';

export function useProfile() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responders')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Parameters<typeof updateProfile>[0]) => updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (status: AvailabilityStatus) => setAvailability(status),
    onMutate: (status) => {
      if (currentUser) {
        setUser({ ...currentUser, availability: status } as Responder);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
