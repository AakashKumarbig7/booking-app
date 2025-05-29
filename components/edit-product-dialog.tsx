"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

interface EditProductDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (updatedProduct: Product) => void
}

export default function EditProductDialog({ isOpen, onClose, product, onSave }: EditProductDialogProps) {
  const [formData, setFormData] = useState<Product>({
    product_id: "",
    product_name: "",
    price: 0,
    category: "",
    stock: 0,
    description: "",
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
    }
  }, [product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product ID and Product Name - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID</Label>
              <Input
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Price and Stock - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Category - Full Row */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
          </div>

          {/* Description - Full Row */}
          <div className="space-y-2"> 
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
           
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
             <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
