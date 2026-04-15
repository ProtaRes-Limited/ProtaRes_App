import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

type Row = Record<string, unknown>;

interface Options {
  table: string;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}

export function useAdminQuery({ table, select = '*', orderBy = 'created_at', ascending = false, limit }: Options) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from(table).select(select).order(orderBy, { ascending });
    if (limit) query = query.limit(limit);
    const { data: rows, error: err } = await query;
    if (err) setError(err.message);
    else setData((rows ?? []) as Row[]);
    setLoading(false);
  }, [table, select, orderBy, ascending, limit]);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, reload: load };
}
