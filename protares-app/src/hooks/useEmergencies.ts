import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptEmergency,
  declineEmergency,
  listActiveEmergencies,
  markHandover,
  markOnScene,
  updateEmergencyStatus,
} from '@/services/emergencies';
import { useLocationStore } from '@/stores/location';
import type { Emergency } from '@/types';

export function useActiveEmergencies() {
  const currentLocation = useLocationStore((s) => s.current);
  return useQuery({
    queryKey: ['emergencies', currentLocation?.latitude, currentLocation?.longitude],
    queryFn: () => listActiveEmergencies(currentLocation),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useAcceptEmergency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptEmergency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}

export function useDeclineEmergency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineEmergency(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}

export function useMarkOnScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markOnScene,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}

export function useMarkHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emergencyId: string) => markHandover(emergencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}

export function useUpdateEmergencyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Emergency['status'] }) =>
      updateEmergencyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}
