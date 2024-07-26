'use client'

import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2';
import regression from 'regression';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the types for the data
interface CategoryData {
  partNumber: string;
  category: string;
}

interface TransactionItem {
  partNumber: string;
  quantity: number;
}

interface Item {
    transactionType: string
    amount: number
    dateCreated: string
    dateFulfilled: string
    origin: string
    vendor: string
    customer: string
    idNumber: string
    items: string
    discount?: number
  }

interface Props {
  allCategories: CategoryData[];
  allItems: Item[];
  isMobile: boolean;
}


const CategoryItemsSold: React.FC<Props> = ({ allCategories, allItems,isMobile }) => {

const barColors = [
    '#a855f7', // Purple
    '#8b5cf6', // Violet
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#0ea5e9', // Sky
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
    '#10b981', // Emerald
    '#22c55e', // Green
  ];

const partToCategory: { [key: string]: string } = {};
allCategories.forEach(category => {
  partToCategory[category.partNumber] = category.category;
});

// Initialize sales data for each category by month
const categorySalesByMonth: { [key: string]: { [key: string]: number } } = {};

// Extract and count parts sold from invoices
allItems.forEach(transaction => {
    if (transaction.transactionType === 'Invoice') {
      const month = new Date(transaction.dateCreated).toISOString().substr(0, 7); // Get year-month

      // Parse the items JSON string into an array of TransactionItem
      const items: TransactionItem[] = JSON.parse(transaction.items);

      items.forEach((item: TransactionItem) => {
        const partNumber = item.partNumber;
        const category = partToCategory[partNumber];
        if (category) {
          if (!categorySalesByMonth[category]) {
            categorySalesByMonth[category] = {};
          }
          if (!categorySalesByMonth[category][month]) {
            categorySalesByMonth[category][month] = 0;
          }
          categorySalesByMonth[category][month] += item.quantity;
        }
      });
    }
  });

    // Calculate forecast for the next six months using linear regression
    const forecastData: { [key: string]: number[] } = {};
    const monthsLabels: string[] = [];
  
    Object.keys(categorySalesByMonth).forEach((category, index) => {
      const salesData = Object.entries(categorySalesByMonth[category]).map(([month, sales]) => {
        const monthIndex = new Date(month).getTime() / (1000 * 60 * 60 * 24 * 30); // Convert month to a numeric value
        return [monthIndex, sales] as [number, number];
      });
  
      const result = regression.linear(salesData);
      const nextSixMonths = Array.from({ length: 6 }, (_, i) => {
        const lastMonthIndex = Math.max(...salesData.map(dataPoint => dataPoint[0]));
        return lastMonthIndex + i + 1;
      });
  
      forecastData[category] = nextSixMonths.map(monthIndex => result.predict(monthIndex)[1]);
  
      // Populate monthsLabels with future months in 'YYYY-MM' format
      if (monthsLabels.length === 0) {
        const lastMonth = new Date(Math.max(...salesData.map(dataPoint => dataPoint[0])) * (1000 * 60 * 60 * 24 * 30));
        for (let i = 1; i <= 6; i++) {
          const nextMonth = new Date(lastMonth);
          nextMonth.setMonth(lastMonth.getMonth() + i);
          monthsLabels.push(nextMonth.toString().slice(4, 15));
        }
      }
    });
  
    // Prepare data for Chart.js
    const chartData = {
      labels: monthsLabels,
      datasets: Object.keys(forecastData).map((category, index) => ({
        label: `${category}s`,
        borderRadius: 5,
        data: forecastData[category],
        backgroundColor: barColors[index % barColors.length], // Use colors from the predefined array
      })),
    };

    let options;
    if (isMobile) {
    options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        scales: {
          y: {
            stacked: false,
            ticks: {
              callback: (tickValue: string | number, index: number, ticks: any[]) => {
                if (typeof tickValue === 'number') {
                  return `${tickValue.toLocaleString()}`;
                }
                return tickValue;
              }
            }
          },
          x: {
            stacked: false
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem: TooltipItem<'bar'>) => {
                const value = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : 0;
                return `${tooltipItem.dataset.label}: ${value.toLocaleString()}`;
              }
            }
          },
          legend: {
            position: 'bottom' as const,
            labels: {
              useBorderRadius: true,
              borderRadius: 5
            }
          },
          title: {
            display: false,
            text: 'Money Generated by Category Each Month',
          },
          
        },
      };
    } else {
        options = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 5,
            scales: {
              y: {
                stacked: false,
                ticks: {
                  callback: (tickValue: string | number, index: number, ticks: any[]) => {
                    if (typeof tickValue === 'number') {
                      return `${tickValue.toLocaleString()}`;
                    }
                    return tickValue;
                  }
                }
              },
              x: {
                stacked: false
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (tooltipItem: TooltipItem<'bar'>) => {
                    const value = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : 0;
                    return `${tooltipItem.dataset.label}: ${value.toLocaleString()}`;
                  }
                }
              },
              legend: {
                position: 'bottom' as const,
                labels: {
                  useBorderRadius: true,
                  borderRadius: 5
                }
              },
              title: {
                display: false,
                text: 'Money Generated by Category Each Month',
              },
              
            },
          }; 
    }

      return <Bar data={chartData}  options={options}/>;
    }

    export default CategoryItemsSold