export default function Transactions() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Transaction History
      </h1>

      <div className="bg-white shadow rounded-lg p-4 mb-4">

        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Sent to Aman</p>
            <p className="text-sm text-gray-500">UPI: aman@upi</p>
          </div>

          <p className="text-red-600 font-bold">
            - ₹500
          </p>
        </div>

      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-4">

        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Received from Dixit</p>
            <p className="text-sm text-gray-500">UPI: dixit@upi</p>
          </div>

          <p className="text-green-600 font-bold">
            + ₹1200
          </p>
        </div>

      </div>

    </div>
  );
}