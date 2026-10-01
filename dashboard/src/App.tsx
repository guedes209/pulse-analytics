import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

interface MetricData {
  minute: string;
  event_type: string;
  count: string;
}

function App() {
  const [data, setData] = useState<any[]>([])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3001/metrics')
      const result = await response.json()
      if (result.status === 'success') {
        const transformed: Record<string, any> = {}

        result.data.forEach((row: MetricData) => {
          const timeLabel = new Date(row.minute.replace(' ', 'T') + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          if (!transformed[timeLabel]) {
            transformed[timeLabel] = { time: timeLabel, pageview: 0, click: 0 }
          }
          transformed[timeLabel][row.event_type] = parseInt(row.count, 10)
        })

        setData(Object.values(transformed))
      }
    } catch (err) {
      console.error('Failed to fetch metrics', err)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <h1>PulseAnalytics Real-Time Dashboard</h1>
      <p>Auto-refreshing every 5 seconds from ClickHouse (via Analytics API).</p>
      
      <div style={{ width: '100%', height: 400, marginTop: '40px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pageview" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={3} />
            <Line type="monotone" dataKey="click" stroke="#82ca9d" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default App
