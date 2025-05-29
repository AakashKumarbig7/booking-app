"use client"

import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  isDeleting?: boolean
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold  flex items-center gap-2">
            
            Delete Product
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isDeleting}>
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">Are you sure you want to delete this product?</p>
          {/* <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{productName}</p>
          </div> */}
          {/* <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p> */}
        </div>

        <div className="flex gap-3">
             <Button onClick={onClose} variant="outline" disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? "Deleting..." : "Delete Product"}
          </Button>
         
        </div>
      </div>
    </div>
  )
}
