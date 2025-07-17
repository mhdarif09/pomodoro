import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SubscriptionPlanChart({ data }) {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-4">Distribusi Paket Langganan</h3>
             <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis allowDecimals={false}/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Jumlah Pelanggan" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}