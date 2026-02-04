export default function UsersTable() {
  return (
    <div className="table-card">
      <h4>Users</h4>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Mahesh</td>
            <td>mahesh@nexagen.com</td>
            <td className="active">Active</td>
          </tr>
          <tr>
            <td>Ravi</td>
            <td>ravi@nexagen.com</td>
            <td className="blocked">Blocked</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
