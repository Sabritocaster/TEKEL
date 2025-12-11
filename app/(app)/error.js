'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

