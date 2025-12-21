import { useState } from 'react'
import { FileUploader } from './FileUploader'

interface CourseUploadProps {
  onCourseSelect: (file: File) => void
}

export function CourseUpload({ onCourseSelect }: CourseUploadProps) {
  const [courseFile, setCourseFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setCourseFile(file)
    onCourseSelect(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Data</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload course data in IOF XML v3 format (exported from Condes or Purple Pen)
        </p>
      </div>

      <FileUploader
        accept=".xml"
        onFileSelect={handleFileSelect}
        label="IOF XML File"
        description="Course data in IOF XML v3 standard format"
        maxSize={5}
        currentFile={courseFile}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Export Instructions
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>
            <strong>Condes:</strong> File → Export → IOF XML v3
          </li>
          <li>
            <strong>Purple Pen:</strong> File → Export → IOF XML Course Data
          </li>
        </ul>
      </div>
    </div>
  )
}
