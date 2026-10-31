// A tiny hash router: GitHub Pages can't rewrite URLs, so #/subject/maths works on refresh.
import { useEffect, useState } from 'react';

export interface Route { parts: string[]; query: URLSearchParams }

function parse(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path: string) {
  const target = '#/' + path.replace(/^\/+/, '');
  if (window.location.hash !== target) window.location.hash = target;
  window.scrollTo({ top: 0 });
}
