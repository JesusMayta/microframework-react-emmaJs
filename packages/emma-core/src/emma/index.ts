export {
    useNavigate as useEmmaNavigate,
    useParams as useEmmaParams,
    useSearchParams as useEmmaSearchParams,
    useLocation as useEmmaLocation,
    useRoutes as useEmmaRoutes,
} from 'react-router';

export {
    create as createEmmaStore,
    useStore as useEmmaStore,
} from 'zustand';

export {
    EmmaRouter,
    EmmaRoutes,
    EmmaLink,
    EmmaNavLink,
    EmmaNavigate,
} from './createRouter.js';

export { useEmmaRoute, useEmmaNavLink } from './hooks.js';

export type { EmmaRoute } from './types.js';
