interface Product {
  product_id: string
  product_name: string
  price: number
  category: string
  stock: number
  description: string
}

export function parseCSV(csvText: string): Product[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  const products: Product[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim())

    if (values.length === headers.length) {
      const product: Product = {
        product_id: values[0] || `PROD-${Date.now()}-${i}`,
        product_name: values[1] || "",
        price: Number.parseFloat(values[2]) || 0,
        category: values[3] || "",
        stock: Number.parseInt(values[4]) || 0,
        description: values[5] || "",
      }

      products.push(product)
    }
  }

  return products
}

export function validateCSVHeaders(csvText: string): boolean {
  const lines = csvText.trim().split("\n")
  if (lines.length === 0) return false

  const headers = lines[0]
    .toLowerCase()
    .split(",")
    .map((header) => header.trim())
  const requiredHeaders = [
    "product_id",
    "product_name",
    "product_price",
    "product_category",
    "product_stock",
    "product_description",
  ]

  return requiredHeaders.every((required) =>
    headers.some((header) => header.includes(required.replace("product_", ""))),
  )
}
