import { useEffect, useState } from 'react';
import { api } from '../api';

export function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(url)
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reloadKey, ...deps]);

  const reload = () => setReloadKey((k) => k + 1);

  return { data, loading, error, reload, setData };
}

export function useForm(initial) {
  const [form, setForm] = useState(initial);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setValue = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const reset = (next) => setForm(next || initial);
  return { form, set, setValue, reset };
}
