'use client'

export default function LoginForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login
      </button>
    </form>
  )
}

