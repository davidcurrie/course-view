import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import App from './App'

// Placeholder components - will be implemented in later phases
const EventsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Events</h1>
    <p className="text-gray-600">Event list will be implemented in Phase 6</p>
  </div>
)

const UploadPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Upload Event Data</h1>
    <p className="text-gray-600">File upload will be implemented in Phase 2</p>
  </div>
)

const MapPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Map View</h1>
    <p className="text-gray-600">Map display will be implemented in Phase 3</p>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
      },
      {
        path: 'map/:eventId',
        element: <MapPage />,
      },
    ],
  },
])
