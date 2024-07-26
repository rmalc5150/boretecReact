import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  moneyIn: { [origin: string]: number }[];
  moneyOut: { expenses: number, pos: number, royalties: number }[];
}

interface BarChartProps {
  chartMoneyInOut: ChartData;
}

const BarChart: React.FC<BarChartProps> = ({ chartMoneyInOut }) => {
  const moneyInColors = [
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
    '#10b981', // Emerald
    '#22c55e', // Green
  ];

  const moneyOutColors = [
    '#e879f9', // Royalties
    '#f472b6', // POs
    '#fb7185', // Expenses
  ];

  const origins = Array.from(
    new Set(chartMoneyInOut.moneyIn.flatMap((monthData) => Object.keys(monthData)))
  );

  const moneyInDatasets = origins
    .filter((origin) => chartMoneyInOut.moneyIn.some((monthData) => monthData[origin])) // Filter out origins with no data
    .map((origin, index) => ({
      label: `Invoices (${origin.charAt(0).toUpperCase() + origin.slice(1)})`,
      data: chartMoneyInOut.moneyIn.map((monthData) => monthData[origin] || 0),
      backgroundColor: moneyInColors[index % moneyInColors.length],
      borderRadius: 5,
      borderColor: 'white',
      borderWidth: 1,
      stack: 'moneyIn',
    }));

  const moneyOutDatasets = [
    {
      label: 'Royalties',
      data: chartMoneyInOut.moneyOut.map((monthData) => monthData.royalties || 0),
      backgroundColor: moneyOutColors[0],
      borderRadius: 5,
      borderColor: 'white',
      borderWidth: 1,
      stack: 'moneyOut',
    },
    {
      label: 'POs',
      data: chartMoneyInOut.moneyOut.map((monthData) => monthData.pos || 0),
      backgroundColor: moneyOutColors[1],
      borderRadius: 5,
      borderColor: 'white',
      borderWidth: 1,
      stack: 'moneyOut',
    },
    {
      label: 'Expenses',
      data: chartMoneyInOut.moneyOut.map((monthData) => monthData.expenses || 0),
      backgroundColor: moneyOutColors[2],
      borderRadius: 5,
      borderColor: 'white',
      borderWidth: 1,
      stack: 'moneyOut',
    },
  ];

  const datasets = [...moneyInDatasets, ...moneyOutDatasets];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked: true,
        ticks: {
          callback: (tickValue: string | number) => {
            if (typeof tickValue === 'number') {
              return `$${tickValue.toLocaleString()}`;
            }
            return tickValue;
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
      },
      x: {
        stacked: true,
        maxBarThickness: 40, // Maximum width of the bars
        barPercentage: 0.7, // Width of the bars relative to the available space
        categoryPercentage: 0.8, // Spacing between bars
        grid: {
          offset: true, // Ensures bars align properly with grid lines
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const value = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : 0;
            return `${tooltipItem.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          useBorderRadius: true,
          borderRadius: 5,
        },
      },
      title: {
        display: false,
        text: 'Money In vs Money Out',
      },
    },
  };

  const data = {
    labels: chartMoneyInOut.labels,
    datasets,
  };

  return <Bar options={options} data={data} />;
};

export default BarChart;