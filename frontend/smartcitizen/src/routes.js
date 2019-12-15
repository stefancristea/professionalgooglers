import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Rezerva = React.lazy(() => import('./views/Pages/Rezerva'));
const Istoric = React.lazy(() => import('./views/Pages/Istoric'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/rezerva/:id', exact: true, name: 'Rezerva', component: Rezerva },
  { path: '/rentals', exact: true, name: 'Istoric', component: Istoric },
];

export default routes;
