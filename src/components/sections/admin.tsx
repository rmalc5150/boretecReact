"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';



const AdminSection = () => {
  useEffect(() => {
    const checkIfAdmin = () => {
      const email = Cookies.get('email');
      if (email) {
        const username = email.split('@')[0].toLowerCase(); // Get the part before "@" and convert to lowercase
        const adminUsers = ['bill', 'randall', 'rhonda']; // List of admin usernames
        const adminSection = document.getElementById('admin');
        if (adminUsers.includes(username) && adminSection) {
          
          adminSection.classList.remove('hidden');
          
        }
      }
    };

    checkIfAdmin();
  }, []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Component is mounted, update state
  }, []);

  const sales: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    fill: {
      opacity: 1, // Set opacity to 100%
    },
    colors: ['#1d4ed8', '#2563eb', '#3b82f6','#60a5fa', '#93c5fd','#000000',],//blues: '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        borderRadiusWhenStacked: 'last',
        columnWidth: '90%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [0, 0, 0, 0, 0, 4], // Last one is for the line chart
      curve: 'smooth',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center', 
    },
  };

  const salesSeries = [
    {
      name: 'Parts',
      type: 'bar',
      data: [44, 55, 41, 64, 22, 43, 21, 49, 22, 31, 45, 44],
    },
    {
      name: 'Cutting Heads',
      type: 'bar',
      data: [53, 32, 33, 52, 13, 44, 32, 15, 32, 34, 52, 41],
    },
    {
      name: 'Steering Heads',
      type: 'bar',
      data: [12, 17, 11, 9, 15, 11, 20, 8, 17, 14, 15, 13],
    },
    {
      name: 'Steering Stations',
      type: 'bar',
      data: [22, 27, 21, 29, 25, 21, 30, 18, 27, 24, 23, 21],
    },
    {
      name: 'Machines',
      type: 'bar',
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41, 37, 26, 24],
    },
    {
      name: 'Actual Sales',
      type: 'line',
      data: [30, 40, 45, 50, 49, 60, 70, 91, 125, 130, 150], // No data for December
    },
  ];

  const revenue: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    fill: {
      opacity: 1, // Set opacity to 100%
    },
    colors: ['#047857', '#059669','#10b981','#34d399', '#6ee7b7', '#064e3b',],//greens: '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', combo: '#2563eb','#4f46e5','#7c3aed','#9333ea', '#c026d3'
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        borderRadiusWhenStacked: 'last',
        columnWidth: '90%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [0, 0, 0, 0, 0, 4], // Last one is for the line chart
      curve: 'smooth',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
        },
        title: {
          text: "Gross (thousands)",
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center', 
    },
  };

  const revenueSeries = [
    {
      name: 'Parts',
      type: 'bar',
      data: [44, 55, 41, 64, 22, 43, 21, 49, 22, 31, 45, 44],
    },
    {
      name: 'Cutting Heads',
      type: 'bar',
      data: [53, 32, 33, 52, 13, 44, 32, 15, 32, 34, 52, 41],
    },
    {
      name: 'Steering Heads',
      type: 'bar',
      data: [12, 17, 11, 9, 15, 11, 20, 8, 17, 14, 15, 13],
    },
    {
      name: 'Steering Stations',
      type: 'bar',
      data: [22, 27, 21, 29, 25, 21, 30, 18, 27, 24, 23, 21],
    },
    {
      name: 'Machines',
      type: 'bar',
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41, 37, 26, 24],
    },
    {
      name: 'Actual Sales',
      type: 'line',
      data: [30, 40, 45, 50, 49, 60, 70, 91, 125, 130, 150], // No data for December
    },
  ];

  return (
    <section id="admin" className="hidden">
      <h1>Projected Sales:</h1>
      <div>
      {isMounted && (
        <Chart options={sales} series={salesSeries} type="bar" height={350} />
        )}
      </div>
      <h1>Projected Gross Revenue:</h1>
      <div>
      {isMounted && (
        <Chart options={revenue} series={revenueSeries} type="bar" height={350} />
        )}
      </div>
    </section>
  );
};

export default AdminSection;
