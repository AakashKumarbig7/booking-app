"use client"

import { FilePlus, SquarePen, Trash2, Upload, X, Filter } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Table } from "rsuite"
import EditProductDialog from "@/components/edit-product-dialog"
import { parseCSV, validateCSVHeaders } from "@/utils/csv-parser"
import { useGlobalContext } from "@/context/store"
import { createClient } from "@/utils/supabase/client"
import DuplicateProductDialog from "@/components/duplicate-product-dialog"
import { DuplicateHandler } from "@/utils/duplicate-handler"
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog"
import Pagination from "@/components/pagination"
import ProductFilterSheet from "@/components/product-filter-sheet"
import toast, { Toaster } from "react-hot-toast"

interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

type SortType = "asc" | "desc" | undefined

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
  })

const ProductManagementPage = () => {
  const [showUpload, setShowUpload] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { Column, HeaderCell, Cell } = Table
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [currentDuplicate, setCurrentDuplicate] = useState<{
    newProduct: Product
    existingProduct: Product
    index: number
    total: number
  } | null>(null)
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [duplicateHandler, setDuplicateHandler] = useState<DuplicateHandler | null>(null)
  const [duplicateIndex, setDuplicateIndex] = useState(0)
  const [duplicates, setDuplicates] = useState<{ product: Product; index: number }[]>([])

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortType, setSortType] = useState<SortType>(undefined)

  // Initialize Supabase client
  const supabase = createClient()

  // Get current user from global context
  const { user: currentUser } = useGlobalContext()

  // Use filtered products for display, fallback to all products if no filter is active
  const baseProducts = isFilterActive ? filteredProducts : products

  // Apply sorting to the products
  const sortedProducts = useMemo(() => {
    if (!sortColumn || !sortType) {
      return baseProducts
    }

    const sorted = [...baseProducts].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Product]
      let bValue: any = b[sortColumn as keyof Product]

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortType === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortType === "asc" ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [baseProducts, sortColumn, sortType])

  // Calculate pagination values
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedProducts.slice(startIndex, endIndex)
  }, [sortedProducts, currentPage, itemsPerPage])

  // Reset to first page when products change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortedProducts.length])

  // Handle sort column change
  const handleSortColumn = (sortColumn: string, sortType?: SortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Fetch products from Supabase
  const loadProductsFromDB = async () => {
    try {
      setLoading(true)
      setError(null)

      // Guard clause: Don't proceed if user is not available
      if (!currentUser?.email) {
        console.log("User not available yet, skipping load")
        return
      }

      console.log("Fetching products for user:", currentUser.email)

      // Use .maybeSingle() instead of .single() to handle cases where no row exists
      const { data, error } = await supabase
        .from("companies")
        .select("product_management")
        .eq("store_admin", currentUser.email)
        .maybeSingle()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Raw data from database:", data)

      // Handle different scenarios
      if (!data) {
        // No company record found for this user
        console.log("No company record found, creating empty product list")
        setProducts([])
        return
      }

      // Extract products from JSONB column
      const fetchedProducts: Product[] = data?.product_management || []
      console.log("Fetched products:", fetchedProducts)
      setProducts(fetchedProducts)
    } catch (err: any) {
      console.error("Error in loadProductsFromDB:", err)
      setError(err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  // Save products to Supabase
  const saveProductsToDB = async (productsToSave: Product[]) => {
    try {
      if (!currentUser?.email) {
        throw new Error("User email not found")
      }

      console.log("Saving products for user:", currentUser.email)
      console.log("Products to save:", productsToSave)

      // First check if company record exists
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("store_admin", currentUser.email)
        .maybeSingle()

      if (!existingCompany) {
        // Create new company record if it doesn't exist
        const { error: insertError } = await supabase.from("companies").insert({
          store_admin: currentUser.email,
          product_management: productsToSave,
        })

        if (insertError) {
          console.error("Error creating company record:", insertError)
          throw insertError
        }
      } else {
        // Update existing company record
        const { error: updateError } = await supabase
          .from("companies")
          .update({ product_management: productsToSave })
          .eq("store_admin", currentUser.email)

        if (updateError) {
          console.error("Error updating company record:", updateError)
          throw updateError
        }
      }

      console.log("Products saved successfully")
    } catch (error: any) {
      console.error("Error saving products:", error)
      throw new Error(error.message || "Failed to save products")
    }
  }

  // Add new products
  const addProductsToDB = async (newProducts: Product[]) => {
    try {
      setUploadLoading(true)
      setError(null)

      // Merge with existing products (avoid duplicates)
      const existingIds = new Set(products.map((p) => p.product_id))
      const productsToAdd = newProducts.filter((p) => !existingIds.has(p.product_id))
      const allProducts = [...products, ...productsToAdd]

      // Save to database
      await saveProductsToDB(allProducts)

      // Reload from database to ensure consistency
      await loadProductsFromDB()

      return productsToAdd.length
    } catch (err: any) {
      setError(err.message || "Failed to add products")
      console.error("Failed to add products:", err)
      return 0
    } finally {
      setUploadLoading(false)
    }
  }

  // Update single product
  const updateProductInDB = async (productId: string, updatedProduct: Product) => {
    try {
      setLoading(true)
      setError(null)

      // Update in existing products array
      const updatedProducts = products.map((product) =>
        product.product_id === productId ? { ...product, ...updatedProduct } : product,
      )

      // Save to database
      await saveProductsToDB(updatedProducts)

      // Update local state
      setProducts(updatedProducts)
      return true
    } catch (err: any) {
      setError(err.message || "Failed to update product")
      console.error("Failed to update product:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  const deleteProductFromDB = async (productId: string) => {
    try {
      setIsDeleting(true)
      setError(null)

      // Remove from products array
      const updatedProducts = products.filter((product) => product.product_id !== productId)

      // Save to database
      await saveProductsToDB(updatedProducts)

      // Update local state
      setProducts(updatedProducts)
      return true
    } catch (err: any) {
      setError(err.message || "Failed to delete product")
      console.error("Failed to delete product:", err)
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  // Load products when user becomes available
  useEffect(() => {
    // Only load if user is available
    if (currentUser?.email) {
      loadProductsFromDB()
    }
  }, [currentUser?.email])

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      notify("Please select a CSV file", false)
      return
    }

    try {
      const text = await file.text()

      if (!validateCSVHeaders(text)) {
        notify(
          "Invalid CSV format. Please ensure your CSV has the required columns: product_id, product_name, product_price, product_category, product_stock, product_description",
          false,
        )
        return
      }

      const parsedProducts = parseCSV(text)

      if (parsedProducts.length === 0) {
        notify("No valid products found in the CSV file", false)
        return
      }

      // Check for duplicates
      const handler = new DuplicateHandler(products, parsedProducts)
      const duplicateList = handler.findDuplicates()

      if (duplicateList.length > 0) {
        // Handle duplicates
        setDuplicateHandler(handler)
        setDuplicates(duplicateList)
        setDuplicateIndex(0)
        setPendingProducts(parsedProducts)

        // Show first duplicate
        const firstDuplicate = duplicateList[0]
        const existingProduct = products.find((p) => p.product_id === firstDuplicate.product.product_id)!

        setCurrentDuplicate({
          newProduct: firstDuplicate.product,
          existingProduct,
          index: 1,
          total: duplicateList.length,
        })
        setDuplicateDialogOpen(true)
      } else {
        // No duplicates, proceed normally
        const addedCount = await addProductsToDB(parsedProducts)
        if (addedCount > 0) {
          setShowUpload(false)
          notify(`Successfully imported ${addedCount} new products`, true)
        }
      }
    } catch (error) {
      console.error("Error processing CSV:", error)
      notify("Error processing CSV file", false)
      setError(error instanceof Error ? error.message : "Failed to process CSV file")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleSaveProduct = async (updatedProduct: Product) => {
    const success = await updateProductInDB(updatedProduct.product_id, updatedProduct)

    if (success) {
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      notify("Product updated successfully", true)

      // Reload products to reflect changes
      await loadProductsFromDB()
    } else {
      notify("Failed to update product", false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    const success = await deleteProductFromDB(productToDelete.product_id)

    if (success) {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      notify("Product deleted successfully", true)

      // Reload products to reflect changes
      await loadProductsFromDB()
    } else {
      notify("Failed to delete product", false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        // Directly call handleFileChange logic with a minimal event-like object
        handleFileChange({
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>)
      } else {
        notify("Please drop a CSV file", false)
      }
    }
  }

  const handleDuplicateAction = async (action: "replace" | "skip" | "rename", applyToAll: boolean) => {
    if (!duplicateHandler) return

    duplicateHandler.setDuplicateAction(action, applyToAll)

    if (applyToAll) {
      // Apply to all duplicates and process
      const result = duplicateHandler.processDuplicates()
      await saveProductsToDB(result.productsToAdd)

      // Reload from database to get fresh data
      await loadProductsFromDB()

      setDuplicateDialogOpen(false)
      setShowUpload(false)

      notify(
        `Upload completed!
    - ${result.duplicatesFound} duplicates found
    - ${result.skippedCount} skipped
    - ${result.renamedCount} renamed`,
        true,
      )
    } else {
      // Move to next duplicate or finish
      const nextIndex = duplicateIndex + 1

      if (nextIndex < duplicates.length) {
        setDuplicateIndex(nextIndex)
        const nextDuplicate = duplicates[nextIndex]
        const existingProduct = products.find((p) => p.product_id === nextDuplicate.product.product_id)!

        setCurrentDuplicate({
          newProduct: nextDuplicate.product,
          existingProduct,
          index: nextIndex + 1,
          total: duplicates.length,
        })
      } else {
        // All duplicates handled, process final result
        const result = duplicateHandler.processDuplicates()
        await saveProductsToDB(result.productsToAdd)

        // Reload from database to get fresh data
        await loadProductsFromDB()

        setDuplicateDialogOpen(false)
        setShowUpload(false)

        notify(
          `Upload completed!
    - ${result.duplicatesFound} duplicates found    
    - ${result.skippedCount} skipped
    - ${result.renamedCount} renamed`,
          true,
        )
      }
    }
  }

  const handleDuplicateDialogClose = () => {
    setDuplicateDialogOpen(false)
    setCurrentDuplicate(null)
    setDuplicateHandler(null)
    setDuplicates([])
    setPendingProducts([])
    setDuplicateIndex(0)
  }

  // Filter handlers
  const handleApplyFilters = (filtered: Product[]) => {
    setFilteredProducts(filtered)
    setIsFilterActive(true)
    // Reset sorting when filters are applied
    setSortColumn("")
    setSortType(undefined)
    notify(`Filter applied: ${filtered.length} products found`, true)
  }

  const handleResetFilters = () => {
    setFilteredProducts([])
    setIsFilterActive(false)
    // Reset sorting when filters are reset
    setSortColumn("")
    setSortType(undefined)
    notify("Filters reset", true)
  }

  // Show loading state while user context is loading
  if (!currentUser) {
    return (
      <div className="w-full p-4 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4 bg-white">
      <Toaster />
      <div className="py-2 flex items-center justify-between">
        <div className="items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-950">Product Management</h1>
          <p className="text-sm text-zinc-500">Manage your products, categories, and inventory efficiently.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 flex items-center gap-2"
            onClick={() => setShowFilterSheet(true)}
            disabled={loading}
          >
            <Filter size={14} />
            Filter
            {isFilterActive && (
              <span className="bg-white text-teal-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                {filteredProducts.length}
              </span>
            )}
          </button>
          <div
            className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? <X size={14} /> : <FilePlus size={14} />}
            {showUpload ? <span className="ml-2">Cancel</span> : <span className="ml-2">Add Product</span>}
          </div>
        </div>
      </div>

      {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>}

      {showUpload && (
        <div
          className="mt-6 border border-dashed border-gray-300 p-6 rounded-lg bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2 bg-gray-200 border-gray-300 rounded-full w-16 h-16 flex items-center justify-center">
              <Upload />
            </div>
            <h2 className="font-semibold text-lg mb-1">Drag & drop your CSV file</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your file should include columns for product_id, product_name, product_price, product_category,
              product_stock, and product_description
            </p>
            <button
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              onClick={handleFileSelect}
              disabled={uploadLoading || loading}
            >
              {uploadLoading ? "Processing..." : "Select File"}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="mt-6 text-sm text-gray-700">
            <p className="mb-2 font-medium">CSV format example:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              product_id,product_name,product_price,product_category,product_stock,product_description{"\n"}
              PROD-001,Product Name,19.99,Category,10,Product description
            </pre>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto border border-zinc-200 rounded-[8px] bg-white text-sm my-2">
        <Table
          autoHeight
          className="min-w-[800px] rounded-[8px]"
          data={paginatedProducts}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
        >
          <Column width={150} resizable sortable>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Product ID
            </HeaderCell>
            <Cell dataKey="product_id" />
          </Column>

          <Column flexGrow={1} sortable>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Product Name
            </HeaderCell>
            <Cell dataKey="product_name" />
          </Column>

          <Column flexGrow={1} sortable>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Price
            </HeaderCell>
            <Cell dataKey="price">{(rowData: Product) => `$${rowData.price.toFixed(2)}`}</Cell>
          </Column>

          <Column flexGrow={1.5} sortable>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Category
            </HeaderCell>
            <Cell dataKey="category" />
          </Column>

          <Column flexGrow={1} sortable>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Stock
            </HeaderCell>
            <Cell dataKey="stock" />
          </Column>

          <Column width={200} align="right">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }} className="uppercase select-none text-left">
              Action
            </HeaderCell>
            <Cell>
              {(rowData: Product) => (
                <div className="flex items-center gap-6 justify-end">
                  <button
                    className="text-gray-600 hover:text-teal-700 cursor-pointer disabled:opacity-50"
                    onClick={() => handleEditProduct(rowData)}
                    disabled={loading}
                  >
                    <SquarePen size={16} />
                  </button>
                  <button
                    className="text-gray-600 hover:text-red-600 cursor-pointer disabled:opacity-50"
                    onClick={() => handleDeleteClick(rowData)}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </Cell>
          </Column>
        </Table>

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <DuplicateProductDialog
        isOpen={duplicateDialogOpen}
        onClose={handleDuplicateDialogClose}
        duplicateInfo={currentDuplicate}
        onAction={handleDuplicateAction}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.product_name || ""}
        isDeleting={isDeleting}
      />

      <ProductFilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        products={products}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}

export default ProductManagementPage 
 