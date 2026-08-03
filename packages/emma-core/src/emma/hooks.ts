import {
  useLocation,
  useParams,
  useMatch
} from 'react-router';

export function useEmmaRoute() {

  const location = useLocation()

  const params = useParams()

  return {
    pathname: location.pathname,
    params,
    query: Object.fromEntries(new URLSearchParams(location.search).entries()),
  };
};

export function useEmmaNavLink(to: string, options?: { end?: boolean }) {

  const match = useMatch({ path: to, end: options?.end ?? true });

  return {
    isActive: match !== null
  };
};
