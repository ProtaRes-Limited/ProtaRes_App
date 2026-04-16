/**
 * Background location task.
 *
 * CRITICAL: TaskManager.defineTask must be called at module scope — before
 * any component mounts. This file must be imported in app/_layout.tsx so
 * Expo registers the task before startLocationUpdatesAsync is ever called.
 *
 * This task fires when the OS delivers location updates even while the app
 * is suspended or the screen is locked. It writes directly to Supabase so
 * no foreground React lifecycle is needed.
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { classifyTransportMode } from '@/lib/transport-classifier';
import { supabase } from '@/services/supabase';
import { useLocationStore } from '@/stores/location';
import { captureException } from '@/lib/sentry';
import type { Coordinates } from '@/types';
import type { TimestampedPoint } from '@/lib/transport-classifier';

export const BACKGROUND_LOCATION_TASK = 'PROTARES_BACKGROUND_LOCATION';

// Module-level buffer — persists across task invocations within a single
// JS runtime session (app backgrounded but not killed).
const recentPoints: TimestampedPoint[] = [];

TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
    if (error) {
      captureException(error, { context: 'backgroundLocationTask' });
      return;
    }

    if (!data) return;

    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations?.length) return;

    // Supabase persists the session to AsyncStorage so getSession() works
    // even after the app process was briefly suspended or cold-started by
    // the Android foreground service.
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    for (const position of locations) {
      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      recentPoints.push({ ...coords, timestamp: position.timestamp });
      if (recentPoints.length > 20) recentPoints.shift();

      const transportMode = classifyTransportMode(recentPoints);
      const wkt = `POINT(${coords.longitude} ${coords.latitude})`;
      const now = new Date(position.timestamp).toISOString();

      // Update the in-memory store so the UI reflects the latest position
      // when the app is brought to the foreground.
      useLocationStore.getState().setCurrent(coords, transportMode);

      try {
        await Promise.all([
          supabase
            .from('responders')
            .update({
              current_location: wkt,
              current_transport_mode: transportMode,
              location_updated_at: now,
            })
            .eq('id', userId),

          supabase.from('location_history').insert({
            responder_id: userId,
            location: wkt,
            accuracy_meters: position.coords.accuracy ?? null,
            speed_mps: position.coords.speed ?? null,
            heading: position.coords.heading ?? null,
            transport_mode: transportMode,
          }),
        ]);
      } catch (err) {
        captureException(err, { context: 'backgroundLocationTask.supabase' });
      }
    }
  }
);
