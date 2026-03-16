export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to UPI App
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border p-2 mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full border p-2 mb-4 rounded"
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>

      </div>

    </div>
  );
}