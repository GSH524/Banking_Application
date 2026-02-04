export default function TransactionsTable() {
  return (
    <div className="table-card">
      <h4>Recent Transactions</h4>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Mahesh</td>
            <td>Transfer</td>
            <td>₹25,000</td>
            <td className="success">Completed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
