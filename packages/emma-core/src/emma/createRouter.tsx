import type { ReactNode } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    Navigate,
    Outlet,
} from 'react-router';
import type {
    LinkProps,
    NavLinkProps,
    NavigateProps
} from 'react-router';
import type { EmmaRoute } from './types.js';

export function EmmaRouter({ children }: { children?: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
};

function renderRoute(route: EmmaRoute) {
    const key = route.path ?? (route.index ? '__index__' : '__root__');

    if (route.index) {
        return (
            <Route key={key} index element={route.element} />
        );
    }

    return (
        <Route key={key} path={route.path} element={route.element}>
            {route.children?.map(renderRoute)}
        </Route>
    );
};

export function EmmaRoutes({ routes }: { routes: EmmaRoute[] }) {
    return (
        <Routes>
            {routes.map(renderRoute)}
        </Routes>
    );
};

export function EmmaOutlet() {
    return <Outlet />;
};

export function EmmaLink(props: LinkProps) {
    return <Link {...props} />;
};

export function EmmaNavLink(props: NavLinkProps) {
    return <NavLink {...props} />;
};

export function EmmaNavigate(props: NavigateProps) {
    return <Navigate {...props} />;
};
