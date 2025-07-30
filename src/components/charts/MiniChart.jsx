import React from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const MiniChart = ({ type = 'line', data, color = 'blue', height = 60, animated = true }) => {
  // Generar datos mock si no se proporcionan
  const chartData = data || {
    labels: Array.from({ length: 7 }, (_, i) => `D${i + 1}`),
    datasets: [{
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 20),
      borderColor: `rgb(59, 130, 246)`,
      backgroundColor: `rgba(59, 130, 246, 0.1)`,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
      fill: type === 'line' ? true : false,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: () => '',
          label: (context) => `${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        }
      },
      y: {
        display: false,
        grid: {
          display: false,
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
      }
    },
    animation: {
      duration: animated ? 1500 : 0,
      easing: 'easeInOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  // Opciones específicas para gráfico de barras
  const barOptions = {
    ...options,
    scales: {
      ...options.scales,
      x: {
        ...options.scales.x,
        categoryPercentage: 0.8,
        barPercentage: 0.6,
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
      style={{ height: `${height}px` }}
    >
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={barOptions} />
      )}
    </motion.div>
  )
}

export default MiniChart