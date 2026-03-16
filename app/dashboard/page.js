import Navbar from "@/components/Navbar";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar/>

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Balance Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-80 mb-6">
        <h2 className="text-lg font-semibold text-gray-600">
          Available Balance
        </h2>

        <p className="text-3xl font-bold text-green-600 mt-2">
          ₹10,000
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Send Money
        </button>

        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg">
          Transactions
        </button>

      </div>

    </div>
  );
}