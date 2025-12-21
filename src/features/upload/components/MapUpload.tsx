import { useState } from 'react'
import { FileUploader } from './FileUploader'

interface MapUploadProps {
  onMapSelect: (imageFile: File, worldFile?: File) => void
}

export function MapUpload({ onMapSelect }: MapUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [worldFile, setWorldFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<'jpeg-jgw' | 'kmz'>('jpeg-jgw')

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    if (worldFile) {
      onMapSelect(file, worldFile)
    } else if (uploadType === 'kmz') {
      onMapSelect(file)
    }
  }

  const handleWorldFileSelect = (file: File) => {
    setWorldFile(file)
    if (imageFile) {
      onMapSelect(imageFile, file)
    }
  }

  const handleKmzSelect = (file: File) => {
    setImageFile(file)
    onMapSelect(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map File</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a georeferenced map image in either JPEG + JGW or KMZ format
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="mapType"
            value="jpeg-jgw"
            checked={uploadType === 'jpeg-jgw'}
            onChange={() => setUploadType('jpeg-jgw')}
            className="w-4 h-4 text-forest-600"
          />
          <span className="text-sm font-medium">JPEG + World File (.jgw)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="mapType"
            value="kmz"
            checked={uploadType === 'kmz'}
            onChange={() => setUploadType('kmz')}
            className="w-4 h-4 text-forest-600"
          />
          <span className="text-sm font-medium">Google Earth (.kmz)</span>
        </label>
      </div>

      {uploadType === 'jpeg-jgw' ? (
        <div className="space-y-4">
          <FileUploader
            accept=".jpg,.jpeg"
            onFileSelect={handleImageSelect}
            label="Map Image (JPEG)"
            description="Upload the orienteering map image"
            maxSize={20}
            currentFile={imageFile}
          />
          <FileUploader
            accept=".jgw"
            onFileSelect={handleWorldFileSelect}
            label="World File (.jgw)"
            description="Upload the JPEG world file containing georeferencing data"
            maxSize={1}
            currentFile={worldFile}
          />
        </div>
      ) : (
        <FileUploader
          accept=".kmz"
          onFileSelect={handleKmzSelect}
          label="KMZ File"
          description="Upload a Google Earth KMZ file containing the map and georeferencing"
          maxSize={20}
          currentFile={imageFile}
        />
      )}
    </div>
  )
}
