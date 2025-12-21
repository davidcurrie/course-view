import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/components'

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-forest-800 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Forest Team</h1>
        <p className="text-sm text-forest-100">Orienteering Event Management</p>
      </header>
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Forest Team</h2>
            <p className="text-gray-600">
              This application helps orienteering officials manage events, view georeferenced maps,
              and track GPS locations in the forest - even offline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Upload Event Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a georeferenced map and course data to create a new event.
              </p>
              <Button onClick={() => navigate('/upload')} className="w-full">
                Upload New Event
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">View Events</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse and manage your saved orienteering events.
              </p>
              <Button onClick={() => navigate('/events')} variant="secondary" className="w-full">
                View Events
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-900 font-medium mb-2">Getting Started</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Upload a georeferenced map (JPEG + .jgw or KMZ)</li>
              <li>Upload course data in IOF XML format (from Condes or Purple Pen)</li>
              <li>View the map with controls and track your GPS location</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
