'use client'

import React, { useEffect, useState } from 'react'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'
import ChartMoneyInOut from '../ChartMoneyInOut'
import ChartCategories from '../ChartCategories'
import ForecastCats from '../forecstCats'
import Cookies from 'js-cookie'


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

type ItemType = {
  quantity: number;
  partNumber?: string;
  description: string;
  unitPrice: number;
  lineAmount: number;
  dateCreated?: string;
  invoiceNumber: string;
  discount?: number;
};

type Royalty = {
  quantity: number;
  partNumber?: string;
  description: string;
  unitPrice: number;
  lineAmount: number;
  dateCreated?: string;
  invoiceNumber: string;
  discount?: number;
  royalty: number;
};

interface ItemCategory {
  category: string
  partNumber: string
}

interface ChartData {
  labels: string[];
  moneyIn: { [origin: string]: number }[];
  moneyOut: { expenses: number, pos: number, royalties: number }[];
}

interface ChartCategoriesData {
  labels: any[]
  datasets: any[]
}

const DataAndAnalytics = () => {
  const [items, setItems] = useState<Item[]>([])
  const [royaltiesItems, setRoyaltiesItems] = useState<ItemCategory[]>([])
  const [royaltiesArray, setRoyaltiesArray] = useState<Royalty[]>([])
  const [royalties, setRoyalties] = useState<{ [key: string]: number }>({})
  const [invoiceItems, setInvoiceItems] = useState<ItemType[]>([])
  const [user, setUser] = useState('')
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([])
  const [isMobile, setIsMobile] = useState(true)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortedBy, setSortedBy] = useState<string>("")
  const [moneyInToDate, setMoneyInToDate] = useState(0)
  const [moneyOutToDate, setMoneyOutToDate] = useState(0)
  const [chartMoneyInOut, setChartMoneyInOut] = useState<ChartData>({
    labels: [],
    moneyIn: [],
    moneyOut: [],
  })
  const [chartCategoriesData, setChartCategoriesData] =
    useState<ChartCategoriesData>({ labels: [], datasets: [] })

    useEffect(() => {

      const checkEmail = async () => {
        const email = Cookies.get('email');
        if (email) {
          const userName = email.split('@')[0];
          setUser(userName);
        } 
      };
  checkEmail()
    }, []);

    const calculateRoyalties = (royaltiesItems: ItemCategory[], invoiceItems: ItemType[]) => {
      const royaltiesPartNumbers = royaltiesItems.map(item => item.partNumber);
      const matchedRoyaltiesArray: Royalty[] = []; // Array to store items that match royaltiesPartNumbers
    
      const royaltiesData = invoiceItems.reduce((acc: { [key: string]: number }, item) => {
        if (item.partNumber && royaltiesPartNumbers.includes(item.partNumber)) {
          const discount = item.discount || 0;
          const royalty = (item.lineAmount * ((100 - discount) / 100)) * 0.1;
          const month = new Date(item.dateCreated || '').toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          });
          if (!acc[month]) acc[month] = 0;
          acc[month] += royalty;
    
          matchedRoyaltiesArray.push({
            ...item,
            royalty,
          }); // Add matched item to the array with royalty value
        }
        return acc;
      }, {});
      //console.log(matchedRoyaltiesArray);
      setRoyaltiesArray(matchedRoyaltiesArray);
      return royaltiesData;
    };
    
  const fetchItems = async () => {
    setIsLoading(true)
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_transactions_selectAll',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      setItems(payloadObject) // Assuming the payload contains the array of items
      setIsLoading(false) // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching inventory items', error)
      setIsLoading(false) // Set loading to false in case of error
    }
  }

  const fetchRoyaltiesItems = async () => {
    
    const params: InvokeCommandInput = {
      FunctionName: 'fetch_royalties_items',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      setRoyaltiesItems(payloadObject) // Assuming the payload contains the array of items
      //console.log(payloadObject)
    } catch (error) {
      console.error('Error fetching inventory items', error)
      
    }
  }

  const fetchCategories = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_transactions_categories',
      Payload: JSON.stringify({}),
    }

    try {
      const command = new InvokeCommand(params)
      const response = await lambdaClient.send(command)
      const payloadString = new TextDecoder().decode(response.Payload)
      const payloadObject = JSON.parse(payloadString)
      //console.log(payloadObject);
      setItemCategories(payloadObject) // Assuming the payload contains the array of items
    } catch (error) {
      console.error('Error fetching inventory items', error)
      setIsLoading(false) // Set loading to false in case of error
    }
  }

  useEffect(() => {
    fetchItems()
    fetchCategories()
    fetchRoyaltiesItems()
  }, [])

  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    setIsMobile(isMobile())
  }, [])

  useEffect(() => {
    if (items.length && itemCategories.length) {
      const invoiceItems = items.filter(
        (item) => item.transactionType === 'Invoice'
      )
      

      const categoryData = invoiceItems.reduce(
        (acc: Record<string, Record<string, number>>, item) => {
          const parsedItems = JSON.parse(item.items)
          parsedItems.forEach(
            (parsedItem: { partNumber: string; lineAmount: number }) => {
              const cleanedPartNumber = parsedItem.partNumber.includes(':')
                ? parsedItem.partNumber.split(':').pop()
                : parsedItem.partNumber

              const category = (
                itemCategories.find(
                  (cat) => cat.partNumber === cleanedPartNumber
                )?.category || 'Unknown'
              ).toLowerCase()
              const month = new Date(item.dateCreated).toLocaleString(
                'default',
                { month: 'short', year: 'numeric' }
              )
              if (!acc[month]) {
                acc[month] = {}
              }
              if (!acc[month][category]) {
                acc[month][category] = 0
              }
              acc[month][category] += parsedItem.lineAmount
            }
          )
          return acc
        },
        {}
      )

      const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })
      )
      const labels = allMonths
      const categories = Array.from(
        new Set(itemCategories.map((cat) => cat.category.toLowerCase()))
      )

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
      ]

      const datasets = categories.map((category, index) => ({
        label: category + 's',
        data: allMonths.map((month) => categoryData[month]?.[category] || 0),
        backgroundColor: barColors[index % barColors.length], // Assign color based on index
        borderRadius: {
          topLeft: 10,
          topRight: 10,
        },
      }))

      setChartCategoriesData({
        labels,
        datasets,
      })
    }
  }, [items, itemCategories])

  useEffect(() => {
    if (items.length && itemCategories.length && royaltiesItems.length) {
      const invoiceItems = items
        .filter((item) => item.transactionType === 'Invoice')
        .flatMap((record) => {
          let itemsArray: ItemType[] = [];
          try {
            itemsArray = JSON.parse(record.items);
          } catch (error) {
            console.error('Error parsing items:', error);
            return [];
          }
          return itemsArray.map((item) => {
            const partNumber = item.partNumber?.includes(':')
              ? item.partNumber.split(':')[1]
              : item.partNumber;
            return {
              ...item,
              partNumber,
              dateCreated: record.dateCreated,
              invoiceNumber: record.idNumber,
              discount: record.discount || 0,
            };
          });
        });
  
      const royaltiesData = calculateRoyalties(royaltiesItems, invoiceItems);
  
      const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })
      );
  
      const moneyIn: { [key: string]: { [origin: string]: number } } = {};
      const expenses: { [key: string]: number } = {};
      const pos: { [key: string]: number } = {};
      const royalties: { [key: string]: number } = {};
  
      items.forEach((item) => {
        if (item.dateCreated) {
          const month = new Date(item.dateCreated).toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          });
  
          if (item.transactionType === 'Invoice') {
            if (!moneyIn[month]) {
              moneyIn[month] = {};
            }
            const origin = item.origin || 'Unknown';
            moneyIn[month][origin] = (moneyIn[month][origin] || 0) + item.amount;
          } else if (item.transactionType === 'Expense') {
            expenses[month] = (expenses[month] || 0) + item.amount;
          } else if (item.transactionType === 'PO') {
            pos[month] = (pos[month] || 0) + item.amount;
          }
        }
      });
  
      Object.keys(royaltiesData).forEach((month) => {
        royalties[month] = (royalties[month] || 0) + royaltiesData[month];
      });
  
      const moneyInToDate = items.reduce((acc, item) => {
        if (item.transactionType === 'Invoice' && new Date(item.dateCreated) > new Date('2024-01-01')) {
          return acc + item.amount;
        }
        return acc;
      }, 0);
  
      const moneyOutToDate = items.reduce((acc, item) => {
        if ((item.transactionType === 'Expense' || item.transactionType === 'PO') && new Date(item.dateCreated) > new Date('2024-01-01')) {
          return acc + item.amount;
        }
        return acc;
      }, 0) + Object.values(royalties).reduce((acc, value) => acc + value, 0);
  
      setChartMoneyInOut({
        labels: allMonths,
        moneyIn: allMonths.map((month) => moneyIn[month] || {}),
        moneyOut: allMonths.map((month) => ({
          expenses: expenses[month] || 0,
          pos: pos[month] || 0,
          royalties: royalties[month] || 0,
        })),
      });
  
      setInvoiceItems(invoiceItems);
      setMoneyInToDate(moneyInToDate);
      setMoneyOutToDate(moneyOutToDate);
    }
  }, [items, royaltiesItems]);

  useEffect(() => {
    // Function to detect if the device is mobile
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
    setIsMobile(isMobile())
  }, [])

  const sortData = (field: keyof Item) => {
    const sorted = [...items].sort((a, b) => {
      // Use a non-null assertion operator (!) if you are sure it won't be null,
      // or provide a fallback value to handle null or undefined.
      const aValue = a[field] ?? '' // Fallback to empty string if null
      const bValue = b[field] ?? '' // Fallback to empty string if null

      // If the field values are strings, ensure they are compared correctly.
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // If the field values are numbers, handle them accordingly.
      // Adjust this part if you have specific fields that are numbers.
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Adjust comparisons as needed based on your data types.
      return 0
    })
    setItems(sorted)
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    setSortedBy(field)
  }

  return (
    <section className={`my-5
    ${user === 'bill' && 'filter saturate-200'}`}
    >
      {!isLoading && (
        <div className="bg-white p-2 rounded-lg">
          <h1 className="font-semibold text-xl mb-2 text-center">
            Money in vs. Money out
          </h1>
          <div className="flex justify-center text-xs mb-5 text-center space-x-4">
  <p>Total money in: <span className="font-semibold">{moneyInToDate.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p> 
  <p>Total money out: <span className="font-semibold">{moneyOutToDate.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
</div>
          <div className="h-72 flex justify-center w-full mb-5">
    
            <ChartMoneyInOut chartMoneyInOut={chartMoneyInOut} />
     

          </div>



        </div>
      )}
      {!isLoading && (
        <div className="bg-white p-2 rounded-lg mt-5">
          <h1 className="font-semibold text-xl mb-2 text-center">
            Money in by category
          </h1>
          <div className="h-72 flex justify-center w-full">
            <ChartCategories chartData={chartCategoriesData} />
          </div>
          <p className="text-xs mb-5 text-center">
            Note: these are pre-discount totals.
          </p>
        </div>
      )}

{!isLoading && (
        <div className="mb-10 bg-white p-2 rounded-lg mt-5">
          <h1 className="font-semibold text-xl mb-2 text-center">
            Forecasted items sold by category
          </h1>
          <div className="h-72 flex justify-center items-center w-full">
          <ForecastCats allItems={items} allCategories={itemCategories} isMobile={isMobile} />
        </div>
        </div>
      )}



      {royaltiesArray.length > 1 && <div className="bg-white p-2 rounded-lg mt-5">
        <h1 className="font-semibold text-xl mb-2 text-center">
        Royalties
      </h1>
      <table className="leading-normal w-full text-center py-4">
  <thead>
    <tr className="text-center font-medium">
    <th className="font-medium">
        Invoice Number
      </th>
      <th className="font-medium">
        Part Number
      </th>

      {!isMobile && <th className="font-medium">
        Quantity
      </th>}
      {!isMobile && <th className="font-medium">
        Unit Price
      </th>}

      {!isMobile && <th className="font-medium">
        Discount
      </th>}
      <th className="cursor-pointer font-medium">
        Royalty
      </th>
      {!isMobile &&<th className="font-medium">
        Date Created
      </th>}

    </tr>
  </thead>
  <tbody>
    {royaltiesArray.map((item, index) => (
      <tr className="border-gray-200 border-t" key={index}>
                <td className="border-r border-gray-200">
          {item.invoiceNumber}
        </td>
        <td className="border-r border-gray-200">
          {item.partNumber}
        </td>

        {!isMobile && <td className="border-r border-gray-200">
          {item.quantity}
        </td>}
        {!isMobile && <td className="border-r border-gray-200">
          {item.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </td>}
        {!isMobile && <td className="border-r border-gray-200">
          {item.discount}%
        </td>}
        <td className={`${isMobile ? "" : "border-r"} border-gray-200`}>
          {item.royalty.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </td>
        {!isMobile && <td className="border-gray-200">
          {item.dateCreated?.slice(0,10)}
        </td>}

      </tr>
    ))}
  </tbody>
</table>
        </div>}
      {isLoading ? (
        <p className="animate-pulse text-center py-4">Loading...</p>
      ) : (
        <div className="bg-white p-2 rounded-lg mt-5">
                <h1 className="font-semibold text-xl mb-2 text-center">
        All transactions
      </h1>
          <table className="leading-normal w-full text-center py-4">
            <thead>
              <tr className="text-center font-medium">
                <th
                  className="cursor-pointer font-medium"
                  onClick={() => sortData('transactionType')}
                >
                  Transaction Type
                </th>
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('idNumber')}
                  >
                    ID#
                  </th>
                )}
                <th
                  className="cursor-pointer font-medium"
                  onClick={() => sortData('amount')}
                >
                  Amount
                </th>
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('vendor')}
                  >
                    Source
                  </th>
                )}
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('customer')}
                  >
                    Customer
                  </th>
                )}
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('dateCreated')}
                  >
                    Date Created
                  </th>
                )}
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('dateFulfilled')}
                  >
                    Date Fulfilled
                  </th>
                )}
                {!isMobile && (
                  <th
                    className="cursor-pointer font-medium"
                    onClick={() => sortData('origin')}
                  >
                    Origin
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr className="border-gray-200 border-t" key={index}>
                  <td className="border-r border-gray-200">
                    {item.transactionType}
                  </td>
                  {!isMobile && (
                    <td className="border-r border-gray-200">
                      {item.idNumber.includes('BTE') ? (
                        <a
                          href={`/sales?invoices?${item.idNumber.toLowerCase()}`}
                        >
                          {item.idNumber}
                        </a>
                      ) : (
                        `${item.idNumber}`
                      )}
                    </td>
                  )}
                  <td className={`${!isMobile && 'border-r border-gray-200'}`}>
                    {item.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  {!isMobile && (
                    <td className="border-r border-gray-200">{item.vendor}</td>
                  )}
                  {!isMobile && (
                    <td className="border-r border-gray-200">
                      {item.customer}
                    </td>
                  )}
                  {!isMobile && (
                    <td className="border-r border-gray-200">
                      {item.dateCreated?.slice(0,10)}
                    </td>
                  )}
                  {!isMobile && (
                    <td className="border-r border-gray-200">
                      {item.dateFulfilled?.slice(0,10)}
                    </td>
                  )}
                  {!isMobile && <td>{item.origin}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  )
}

export default DataAndAnalytics
