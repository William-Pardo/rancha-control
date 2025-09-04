import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from './Card';

interface ChartData {
  name: string;
  count: number;
  color: string;
}

interface InventoryChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-lg shadow-lg">
        <p className="font-bold text-foreground">{`${label}`}</p>
        <p className="text-sm text-muted-foreground">{`Items: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  const chartData = data.filter(item => item.count > 0);

  return (
    <Card>
      <h3 className="text-xl font-bold text-foreground mb-4">Resumen de Inventario por Categoría</h3>
      {chartData.length > 0 ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border) / 0.5)" />
              <XAxis dataKey="name" tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgb(var(--border))' }} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgb(var(--border))' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgb(var(--secondary))' }} />
              <Bar dataKey="count">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>No hay ítems en el inventario para mostrar en el gráfico.</p>
        </div>
      )}
    </Card>
  );
};

export default InventoryChart;
