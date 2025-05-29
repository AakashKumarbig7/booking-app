"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

interface DuplicateInfo {
  newProduct: Product
  existingProduct: Product
  index: number
  total: number
}

interface DuplicateProductDialogProps {
  isOpen: boolean
  onClose: () => void
  duplicateInfo: DuplicateInfo | null
  onAction: (action: "replace" | "skip" | "rename", applyToAll: boolean) => void
}

export default function DuplicateProductDialog({
  isOpen,
  onClose,
  duplicateInfo,
  onAction,
}: DuplicateProductDialogProps) {
  const [applyToAll, setApplyToAll] = useState(false)

  if (!isOpen || !duplicateInfo) return null

  const { newProduct, existingProduct, index, total } = duplicateInfo

  const handleAction = (action: "replace" | "skip" | "rename") => {
    onAction(action, applyToAll)
  }

  const generateNewId = (originalId: string) => {
    return `${originalId}(1)`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Duplicate Product ID Found</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Product ID <span className="font-semibold">{newProduct.product_id}</span> already exists. How would you like
            to handle this?
          </p>

          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Name:</span> {newProduct.product_name}
              </div>
              <div>
                <span className="font-medium">Price:</span> ${newProduct.price.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Category:</span> {newProduct.category}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Duplicate {index} of {total}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Button onClick={() => handleAction("replace")} variant="outline" className="w-full justify-center">
            Replace existing product
          </Button>

          <Button onClick={() => handleAction("skip")} variant="outline" className="w-full justify-center">
            Skip this product
          </Button>

          <Button onClick={() => handleAction("rename")} variant="outline" className="w-full justify-center">
            Insert with new ID ({generateNewId(newProduct.product_id)})
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="apply-to-all"
            checked={applyToAll}
            onCheckedChange={(checked) => setApplyToAll(checked === true)}
          />
          <label htmlFor="apply-to-all" className="text-sm text-gray-700">
            Apply this action to all duplicate products
          </label>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Cancel Upload
        </Button>
      </div>
    </div>
  )
}
