import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LineController, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend, 
  LineController,
);

// Define an interface for the chart data
interface ChartData {
  labels: string[];
  moneyIn: number[];
  moneyOut: number[];
}

interface BarChartProps {
  chartData: ChartData;
}

const BarChart: React.FC<BarChartProps> = ({ chartData }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,  // Set to false to allow custom aspect ratio
        aspectRatio: 4,  
        scales: {
          y: {
            ticks: {
              callback: (tickValue: string | number, index: number, ticks: any[]) => {
                // Ensure that the tickValue is a number before formatting it as USD
                if (typeof tickValue === 'number') {
                  return `$${tickValue.toLocaleString()}`;
                }
                return tickValue;  // Return as is if it's not a number
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem: TooltipItem<'bar'>) => {
                // Ensure tooltipItem.raw is treated as a number
                const value = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : 0;
                return `${tooltipItem.dataset.label}: $${value.toLocaleString()}`;
              }
            }
          },
          legend: {
            position: 'bottom' as const,
            labels: {
              useBorderRadius: true,
              borderRadius: 5  // Set the borderRadius directly as a number
            }

          },
          title: {
            display: true,
            text: 'Money In vs Money Out',
          },
        },
      };

  // Data structure for Chart.js
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Money In',
        data: chartData.moneyIn,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderRadius: {
            topLeft: 5,
            topRight: 5,
            bottomLeft: 0,
            bottomRight: 0
          }
      },
      {
        label: 'Money Out',
        data: chartData.moneyOut,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderRadius: {
            topLeft: 5,
            topRight: 5,
            bottomLeft: 0,
            bottomRight: 0
          }
      }
    ],
  };

  return <Bar options={options} data={data} />;
};

export default BarChart;