import { FunctionsClient, FunctionsHttpError } from '@supabase/functions-js';

/**
 * Invokes send-order-email without the Supabase client's fetch wrapper.
 * In dev, uses Vite proxy (/supabase-fn → project functions) to avoid browser CORS issues.
 * Surfaces JSON `error` from non-2xx responses instead of the generic "non-2xx status code" message.
 */
export async function invokeSendOrderEmail(body: Record<string, unknown>) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const projectUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '');

  if (!anonKey || !projectUrl) {
    return {
      data: null,
      error: new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'),
    };
  }

  const useProxy = import.meta.env.DEV && typeof window !== 'undefined';
  const functionsBase = useProxy
    ? `${window.location.origin.replace(/\/+$/, '')}/supabase-fn`
    : `${projectUrl}/functions/v1`;

  const client = new FunctionsClient(functionsBase, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    customFetch: globalThis.fetch.bind(globalThis),
  });

  const result = await client.invoke('send-order-email', { body });

  if (result.error instanceof FunctionsHttpError && result.error.context instanceof Response) {
    const res = result.error.context;
    const text = await res.text().catch(() => '');
    let detail = `Edge Function HTTP ${res.status}`;
    try {
      const parsed = text ? JSON.parse(text) : {};
      if (parsed && typeof parsed.error === 'string') detail = parsed.error;
      else if (text) detail = `${detail}: ${text.slice(0, 400)}`;
    } catch {
      if (text) detail = `${detail}: ${text.slice(0, 400)}`;
    }
    return { data: null, error: new Error(detail) };
  }

  return result;
}
