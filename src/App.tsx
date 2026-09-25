import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { TimelinePage } from './pages/TimelinePage'
import { EventDetailPage } from './pages/EventDetailPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/timeline/:timelineId', element: <TimelinePage /> },
  {
    path: '/timeline/:timelineId/events/new',
    element: <EventDetailPage />,
  },
  {
    path: '/timeline/:timelineId/events/:eventId',
    element: <EventDetailPage />,
  },
  {
    path: '/timeline/:timelineId/settings',
    element: <SettingsPage />,
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
