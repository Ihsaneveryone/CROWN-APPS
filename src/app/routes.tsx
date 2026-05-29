import { createBrowserRouter } from 'react-router';
import { Navigate } from 'react-router';
import { lazy } from 'react';

// 🚀 LAZY LOADING: Load komponen hanya saat dibutuhkan (bundle lebih kecil!)
const BranchSelector = lazy(() => import('./components/BranchSelector'));
const BranchPage = lazy(() => import('./components/BranchPage'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const CrownAdminDashboard = lazy(() => import('./components/CrownAdminDashboard'));
const Documentation = lazy(() => import('./components/Documentation'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const TutorialPage = lazy(() => import('./components/TutorialPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/crown-select" replace />,
  },
  {
    path: '/crown-select',
    Component: BranchSelector,
  },
  {
    path: '/branch/:branchId',
    Component: BranchPage,
  },
  {
    path: '/crown-admin',
    Component: CrownAdminDashboard,
  },
  {
    path: '/super-admin',
    Component: SuperAdminDashboard,
  },
  {
    path: '/documentation',
    Component: Documentation,
  },
  {
    path: '/tutorial',
    Component: TutorialPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
