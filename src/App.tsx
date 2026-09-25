import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { TimelinePage } from './pages/TimelinePage'
import { EventDetailPage } from './pages/EventDetailPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/timeline/:timelineId" element={<TimelinePage />} />
        <Route
          path="/timeline/:timelineId/events/new"
          element={<EventDetailPage />}
        />
        <Route
          path="/timeline/:timelineId/events/:eventId"
          element={<EventDetailPage />}
        />
        <Route
          path="/timeline/:timelineId/settings"
          element={<SettingsPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
