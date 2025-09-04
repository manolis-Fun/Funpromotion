/**
 * Asserts that a GraphQL response has the expected shape
 * @param {Object} data - The GraphQL response data
 * @param {Object} requiredFields - Object specifying required fields and their paths
 * @throws {Error} Throws an error with readable message if any field is missing
 */
export function assertGraphQLShape(data, requiredFields) {
  const missingFields = [];
  
  for (const [fieldName, fieldPath] of Object.entries(requiredFields)) {
    const value = getNestedValue(data, fieldPath);
    if (value === undefined || value === null) {
      missingFields.push(`${fieldName} (path: ${fieldPath})`);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(
      `GraphQL response missing required fields:\n` +
      missingFields.map(f => `  - ${f}`).join('\n') +
      '\n\nPlease check your GraphQL query and ensure all required fields are being fetched.'
    );
  }
}

/**
 * Helper to get nested value from object using dot notation
 * @param {Object} obj - The object to search
 * @param {string} path - The path in dot notation (e.g., "product.singleProductFields.basePrice")
 * @returns {any} The value at the path, or undefined if not found
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Log a debug snapshot for product pricing
 * @param {Object} params - The parameters for the debug snapshot
 */
export function logPricingDebugSnapshot({
  slug,
  brand,
  qty,
  technique,
  position,
  basePrice,
  setupCost,
  printCost
}) {
  console.log(
    `📊 Pricing snapshot: ${slug} | Brand: ${brand} | Qty: ${qty} | Technique: ${technique} | Position: ${position} | Base: €${basePrice} | Setup: €${setupCost} | Print: €${printCost}`
  );
}

export default assertGraphQLShape;