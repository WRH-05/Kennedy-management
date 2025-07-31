export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="text-gray-600">Please wait while we load the receptionist dashboard</p>
      </div>
    </div>
  )
}
