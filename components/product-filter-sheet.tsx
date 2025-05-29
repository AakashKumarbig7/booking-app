"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

interface FilterCriteria {
  priceRange: [number, number]
  category: string
  stockRange: [number, number]
}

interface ProductFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onApplyFilters: (filteredProducts: Product[]) => void
  onResetFilters: () => void
}

const ProductFilterSheet: React.FC<ProductFilterSheetProps> = ({
  isOpen,
  onClose,
  products,
  onApplyFilters,
  onResetFilters,
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    priceRange: [0, 1000],
    category: "",
    stockRange: [0, 1000],
  })

  // Calculate min/max values from products
  const priceRange = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const prices = products.map((p) => p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }
  }, [products])

  const stockRange = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const stocks = products.map((p) => p.stock)
    return {
      min: Math.floor(Math.min(...stocks)),
      max: Math.ceil(Math.max(...stocks)),
    }
  }, [products])

  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))]
    return uniqueCategories.filter(Boolean).sort()
  }, [products])

  // Initialize filters when products change
  useEffect(() => {
    setFilters({
      priceRange: [priceRange.min, priceRange.max],
      category: "",
      stockRange: [stockRange.min, stockRange.max],
    })
  }, [priceRange.min, priceRange.max, stockRange.min, stockRange.max])

  const handlePriceRangeChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [value[0], value[1]],
    }))
  }

  const handleStockRangeChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      stockRange: [value[0], value[1]],
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value === "all" ? "" : value,
    }))
  }

  const applyFilters = () => {
    const filteredProducts = products.filter((product) => {
      const priceInRange = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const categoryMatch = !filters.category || product.category === filters.category
      const stockInRange = product.stock >= filters.stockRange[0] && product.stock <= filters.stockRange[1]

      return priceInRange && categoryMatch && stockInRange
    })

    onApplyFilters(filteredProducts)
    onClose()
  }

  const resetFilters = () => {
    setFilters({
      priceRange: [priceRange.min, priceRange.max],
      category: "",
      stockRange: [stockRange.min, stockRange.max],
    })
    onResetFilters()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-zinc-950">Filter Data</SheetTitle>
              <p className="text-sm text-zinc-500 mt-1">Select values to filter the table</p>
            </div>
            {/* <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X size={16} />
            </Button> */}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Price</h3>

            <div className="flex justify-between text-sm text-zinc-600">
              <span>${filters.priceRange[0].toFixed(2)}</span>
              <span>${filters.priceRange[1].toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-600 mb-2 block">Min: ${filters.priceRange[0].toFixed(2)}</label>
                <Slider
                  value={[filters.priceRange[0]]}
                  onValueChange={(value: number[]) => handlePriceRangeChange([value[0], filters.priceRange[1]])}
                  max={priceRange.max}
                  min={priceRange.min}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-600 mb-2 block">Max: ${filters.priceRange[1].toFixed(2)}</label>
                <Slider
                  value={[filters.priceRange[1]]}
                  onValueChange={(value: number[]) => handlePriceRangeChange([filters.priceRange[0], value[0]])}
                  max={priceRange.max}
                  min={priceRange.min}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Category</h3>
            <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Stock</h3>

            <div className="flex justify-between text-sm text-zinc-600">
              <span>{filters.stockRange[0]}</span>
              <span>{filters.stockRange[1]}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-600 mb-2 block">Min: {filters.stockRange[0]}</label>
                <Slider
                  value={[filters.stockRange[0]]}
                  onValueChange={(value: number[]) => handleStockRangeChange([value[0], filters.stockRange[1]])}
                  max={stockRange.max}
                  min={stockRange.min}
                  step={1}
                  className="w-full text-teal-800"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-600 mb-2 block">Max: {filters.stockRange[1]}</label>
                <Slider
                  value={[filters.stockRange[1]]}
                  onValueChange={(value: number[]) => handleStockRangeChange([filters.stockRange[0], value[0]])}
                  max={stockRange.max}
                  min={stockRange.min}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button onClick={applyFilters} className="flex-1 bg-teal-800 hover:bg-teal-700 text-white">
              Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ProductFilterSheet
