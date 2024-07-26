'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { InvokeCommand, type InvokeCommandInput } from '@aws-sdk/client-lambda'
import { lambdaClient } from '../../lib/amazon'

interface Item {
  partNumber: string
  name: string
  quantity: number
  leadTime: string
  purchaseUrl: string
  parts: string
  value: number
  retailPrice: number
  location: string
  weight: string
  legacyPartNumber: string
  type: string
}

const TableForm = ({
  adding,
  setAdding,
}: {
  adding: boolean
  setAdding: (adding: boolean) => void
}) => {
  const [tableData, setTableData] = useState([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    refetch()
  }, [])

  useEffect(() => {
    if (adding) {
      refetch()
      setAdding(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adding])

  useEffect(() => {
    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingIndex(null)
        setEditedValues({})
      }
    }

    window.addEventListener('keyup', onKeyup)

    return () => {
      window.removeEventListener('keyup', onKeyup)
    }
  }, [editingIndex, editedValues])

  const refetch = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_inventory_select_all',
      Payload: JSON.stringify({}),
    }

    const command = new InvokeCommand(params)
    const response = await lambdaClient.send(command)

    try {
      const payload = response.Payload
      const payloadString = new TextDecoder().decode(payload)
      const payloadObject = JSON.parse(payloadString)

      setTableData(payloadObject)
    } catch {
      return []
    }
  }

  const updateItem = async () => {
    const params: InvokeCommandInput = {
      FunctionName: 'boretec_update_item',
      Payload: JSON.stringify({}),
    }

    const command = new InvokeCommand(params)
    await lambdaClient.send(command)

    try {
      refetch()
    } catch {
      return []
    }
  }

  const handleDoubleClick = (
    index: number,
    columnName: string,
    value: string
  ) => {
    setEditingIndex(index)
    setEditedValues({ ...editedValues, [columnName]: value })
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    columnName: string
  ) => {
    setEditedValues({ ...editedValues, [columnName]: event.target.value })
  }

  const handleInputBlur = async () => {
    // Trigger update logic here
    console.log('blur')
    console.log(editedValues)
    console.log(editingIndex)

    // await updateItem()
    setEditingIndex(null)
    setEditedValues({})
  }

  const handleInputKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      console.log('blur')
      console.log(editedValues)
      console.log(editingIndex)
      // Trigger update logic here
      // await updateItem()
      setEditingIndex(null)
      setEditedValues({})
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Part Number</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Lead Time</TableHead>
          <TableHead>Purchase URL</TableHead>
          <TableHead>Parts</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Retail Price</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Legacy Part Number</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((item: Item, rowIndex: number) => (
          <TableRow key={rowIndex}>
            {Object.entries(item).map(([columnName, cellValue], colIndex) => (
              <TableCell
                key={colIndex}
                onDoubleClick={() =>
                  handleDoubleClick(rowIndex, columnName, cellValue)
                }
              >
                {editingIndex === rowIndex && columnName in editedValues ? (
                  <input
                    type="text"
                    value={editedValues[columnName]}
                    onChange={(event) => handleInputChange(event, columnName)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                  />
                ) : (
                  cellValue
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TableForm
