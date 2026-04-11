import { useEffect, useState } from 'react';
import NetInfo, { NetInfoStateType, type NetInfoState } from '@react-native-community/netinfo';

import { flushQueue } from '@/lib/offline-queue';
import { captureException } from '@/lib/sentry';

export interface NetworkStatus {
  online: boolean;
  type: NetInfoState['type'];
  isWifi: boolean;
  isCellular: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetworkStatus>({
    online: true,
    type: NetInfoStateType.unknown,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((info) => {
      const online = Boolean(info.isConnected && info.isInternetReachable !== false);
      setState({
        online,
        type: info.type,
        isWifi: info.type === 'wifi',
        isCellular: info.type === 'cellular',
      });

      if (online) {
        flushQueue().catch((err) => captureException(err, { context: 'flushQueue' }));
      }
    });
    return () => unsubscribe();
  }, []);

  return state;
}
