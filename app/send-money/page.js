export default function SendMoney() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Send Money
        </h2>

        <input
          type="text"
          placeholder="Enter Receiver UPI ID"
          className="w-full border p-2 mb-4 rounded"
        />

        <input
          type="number"
          placeholder="Enter Amount"
          className="w-full border p-2 mb-6 rounded"
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Pay Now
        </button>

      </div>

    </div>
  );
}