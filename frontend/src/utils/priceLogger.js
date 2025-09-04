/**
 * Minimal price logger for development debugging
 * Only logs in development mode
 */

class PriceLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }
  
  /**
   * Debug log pricing information
   * @param {string} slug - Product slug
   * @param {Object} details - Pricing details
   */
  debug(slug, details) {
    if (!this.isDevelopment) return;
    
    const { brand, qty, technique, position, finalUnitPrice } = details;
    
    // Special logging for target case
    if (slug === 'vinga-baltimore-rcs-explorers-backpack-4' && 
        qty === 100 && 
        technique === '1-color' && 
        position === 'item-front' && 
        brand === 'xindao') {
      
      const expected = 54.81;
      const isCorrect = Math.abs(finalUnitPrice - expected) < 0.01;
      
      console.log(
        `🎯 Pricing verified for ${slug} at qty ${qty}, ${technique}, ${position}, brand ${brand}, ` +
        `expected €${expected}, got €${finalUnitPrice.toFixed(2)} ${isCorrect ? '✅' : '❌'}`
      );
      
      if (!isCorrect) {
        console.error(`⚠️ Price mismatch! Expected €${expected}, but got €${finalUnitPrice.toFixed(2)}`);
      }
    } else {
      // Regular debug log
      console.log(
        `💰 Price: ${slug} | Brand: ${brand} | Qty: ${qty} | Tech: ${technique} | Pos: ${position} | €${finalUnitPrice.toFixed(2)}`
      );
    }
  }
  
  /**
   * Log pricing breakdown
   * @param {string} slug - Product slug  
   * @param {Object} breakdown - Full pricing breakdown
   */
  breakdown(slug, breakdown) {
    if (!this.isDevelopment) return;
    
    console.group(`📊 Pricing Breakdown: ${slug}`);
    console.table({
      'Per Unit Setup': `€${breakdown.steps.perUnitSetup.toFixed(2)}`,
      'Print Subtotal': `€${breakdown.steps.printSubtotal.toFixed(2)}`,
      'Print Total': `€${breakdown.steps.printTotal.toFixed(2)}`,
      'Base Component': `€${breakdown.steps.baseComponent.toFixed(2)}`,
      'Base with Markup': `€${breakdown.steps.baseWithMarkup.toFixed(2)}`,
      'Final Unit Price': `€${breakdown.steps.finalUnitPrice.toFixed(2)}`
    });
    console.groupEnd();
  }
  
  /**
   * Log error in pricing calculation
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  error(message, error) {
    if (!this.isDevelopment) return;
    
    console.error(`❌ Pricing Error: ${message}`, error);
  }
  
  /**
   * Log GraphQL data issues
   * @param {string} slug - Product slug
   * @param {Array} missingFields - List of missing fields
   */
  missingData(slug, missingFields) {
    if (!this.isDevelopment) return;
    
    console.warn(
      `⚠️ Missing pricing data for ${slug}:\n` +
      missingFields.map(f => `  - ${f}`).join('\n')
    );
  }
}

// Export singleton instance
export const priceLogger = new PriceLogger();

export default priceLogger;