import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function UserChart({ users }) {
  const monthlyUsers = {};

  users.forEach((user) => {
    const month = new Date(user.createdAt).toLocaleString('default', {
      month: 'short',
    });

    if (monthlyUsers[month]) {
      monthlyUsers[month] += 1;
    } else {
      monthlyUsers[month] = 1;
    }
  });

  const chartData = Object.entries(monthlyUsers).map(([month, count]) => ({
    month,
    users: count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="month"
          label={{
            value: 'Months',
            position: 'insideBottom',
            offset: -5,
          }}
        />

        <YAxis
          label={{
            value: 'Users',
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip />
        <Bar dataKey="users" fill="#9db964" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default UserChart;
