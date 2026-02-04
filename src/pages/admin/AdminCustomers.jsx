import { useEffect, useState } from "react";
import { fetchBankData } from "../../services/bankDataService";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankData()
      .then((data) => {
        // ✅ Load only first 50 records (SAFE)
        setCustomers(data.slice(0, 50));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading customer data...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>👨‍💼 Customers (Sample View)</h2>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Account Type</th>
            <th>Balance</th>
            <th>Risk Level</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c, index) => (
            <tr key={index}>
              <td>{c["Customer ID"]}</td>
              <td>{c["First Name"]} {c["Last Name"]}</td>
              <td>{c["Account Type"]}</td>
              <td>₹{c["Account Balance"]}</td>
              <td>{c.RiskLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
