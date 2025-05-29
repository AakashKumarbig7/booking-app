interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

export interface DuplicateResult {
  productsToAdd: Product[]
  duplicatesFound: number
  skippedCount: number
  replacedCount: number
  renamedCount: number
}

export class DuplicateHandler {
  private existingProducts: Product[]
  private newProducts: Product[]
  private duplicateAction: "replace" | "skip" | "rename" | null = null
  private applyToAll = false

  constructor(existingProducts: Product[], newProducts: Product[]) {
    this.existingProducts = existingProducts
    this.newProducts = newProducts
  }

  findDuplicates(): { product: Product; index: number }[] {
    const existingIds = new Set(this.existingProducts.map((p) => p.product_id))
    const duplicates: { product: Product; index: number }[] = []

    this.newProducts.forEach((product, index) => {
      if (existingIds.has(product.product_id)) {
        duplicates.push({ product, index })
      }
    })

    return duplicates
  }

  setDuplicateAction(action: "replace" | "skip" | "rename", applyToAll: boolean) {
    this.duplicateAction = action
    this.applyToAll = applyToAll
  }

  processDuplicates(): DuplicateResult {
    const existingIds = new Set(this.existingProducts.map((p) => p.product_id))
    const processedProducts: Product[] = []
    let skippedCount = 0
    let replacedCount = 0
    let renamedCount = 0
    let duplicatesFound = 0

    // Start with existing products
    let finalProducts = [...this.existingProducts]

    this.newProducts.forEach((newProduct) => {
      const isDuplicate = existingIds.has(newProduct.product_id)

      if (!isDuplicate) {
        // Not a duplicate, add directly
        processedProducts.push(newProduct)
      } else {
        duplicatesFound++

        if (this.duplicateAction === "skip") {
          skippedCount++
          // Do nothing, skip this product
        } else if (this.duplicateAction === "replace") {
          replacedCount++
          // Replace existing product
          finalProducts = finalProducts.map((existing) =>
            existing.product_id === newProduct.product_id ? newProduct : existing,
          )
        } else if (this.duplicateAction === "rename") {
          renamedCount++
          // Create new product with modified ID
          const newId = this.generateUniqueId(newProduct.product_id, finalProducts)
          processedProducts.push({
            ...newProduct,
            product_id: newId,
          })
        }
      }
    })

    // Combine final products with new non-duplicate products
    const allProducts = [...finalProducts, ...processedProducts]

    return {
      productsToAdd: allProducts,
      duplicatesFound,
      skippedCount,
      replacedCount,
      renamedCount,
    }
  }

  private generateUniqueId(originalId: string, allProducts: Product[]): string {
    const existingIds = new Set(allProducts.map((p) => p.product_id))
    let counter = 1
    let newId = `${originalId}(${counter})`

    while (existingIds.has(newId)) {
      counter++
      newId = `${originalId}(${counter})`
    }

    return newId
  }
}
