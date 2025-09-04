import { NextResponse } from 'next/server';

// Default shipping days by brand
const DEFAULT_SHIPPING_DAYS = {
  Stock: { standard: 1, express: -1 },
  Mdisplay: { standard: 6, express: 3 },
  default: { standard: 4, express: 3 }
};

// Main shipping options for each printing technique
const SHIPPING_OPTIONS = {
  '1 color': {
    addExpress: 5, ranges: [
      { min: 1, max: 99, express: 5 },
      { min: 100, max: 249, express: 5 },
      { min: 250, max: 499, express: 6 },
      { min: 500, max: 999, express: 7 },
      { min: 1000, max: 2499, express: 7 }
    ]
  },
  '2 colors': {
    addExpress: 6, ranges: [
      { min: 1, max: 99, express: 6 },
      { min: 100, max: 249, express: 6 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 8 }
    ]
  },
  '3 colors': {
    addExpress: 6, ranges: [
      { min: 1, max: 99, express: 6 },
      { min: 100, max: 249, express: 6 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 8 }
    ]
  },
  '4 colors': {
    addExpress: 6, ranges: [
      { min: 1, max: 99, express: 6 },
      { min: 100, max: 249, express: 6 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 8 }
    ]
  },
  'laser': {
    addExpress: 4, ranges: [
      { min: 1, max: 99, express: 4 },
      { min: 100, max: 249, express: 4 },
      { min: 250, max: 499, express: 4 },
      { min: 500, max: 999, express: 5 },
      { min: 1000, max: 2499, express: 6 }
    ]
  },
  'doming': {
    addExpress: 6, ranges: [
      { min: 1, max: 99, express: 6 },
      { min: 100, max: 249, express: 6 },
      { min: 250, max: 499, express: 6 },
      { min: 500, max: 999, express: 7 },
      { min: 1000, max: 2499, express: 7 }
    ]
  },
  'digital-label': {
    addExpress: 4, ranges: [
      { min: 1, max: 99, express: 4 },
      { min: 100, max: 249, express: 4 },
      { min: 250, max: 499, express: 4 },
      { min: 500, max: 999, express: 5 },
      { min: 1000, max: 2499, express: 6 }
    ]
  },
  'hot-stamping': {
    addExpress: 7, ranges: [
      { min: 1, max: 99, express: 7 },
      { min: 100, max: 249, express: 7 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 8 }
    ]
  },
  'embroidery': {
    addExpress: 7, ranges: [
      { min: 1, max: 99, express: 7 },
      { min: 100, max: 249, express: 7 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 8 }
    ]
  },
  'full-color': {
    addExpress: 4, ranges: [
      { min: 1, max: 99, express: 4 },
      { min: 100, max: 249, express: 4 },
      { min: 250, max: 499, express: 4 },
      { min: 500, max: 999, express: 5 },
      { min: 1000, max: 2499, express: 6 }
    ]
  },
  'full-color-drinkware': {
    addExpress: 7, ranges: [
      { min: 1, max: 99, express: 7 },
      { min: 100, max: 249, express: 7 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 9 }
    ]
  },
  'full-color-background': {
    addExpress: 4, ranges: [
      { min: 1, max: 99, express: 4 },
      { min: 100, max: 249, express: 4 },
      { min: 250, max: 499, express: 4 },
      { min: 500, max: 999, express: 5 },
      { min: 1000, max: 2499, express: 6 }
    ]
  },
  'no-print': {
    addExpress: 0, ranges: [
      { min: 1, max: 99, express: 0 },
      { min: 100, max: 249, express: 0 },
      { min: 250, max: 499, express: 0 },
      { min: 500, max: 999, express: 0 },
      { min: 1000, max: 2499, express: 0 }
    ]
  }
};

// Brand-specific adjustments
const BRAND_ADJUSTMENTS = {
  'Midocean': {
    '1 color': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    '2 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '3 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '4 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'laser': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'doming': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    'digital-label': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'hot-stamping': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'embroidery': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'full-color': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-drinkware': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-background': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-sub': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'laser-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'no-print': {
      addExpress: 0, ranges: [
        { min: 1, max: 99, express: 0 },
        { min: 100, max: 249, express: 0 },
        { min: 250, max: 499, express: 0 },
        { min: 500, max: 999, express: 0 },
        { min: 1000, max: 2499, express: 0 }
      ]
    }
  },
  'Stricker': {
    '1 color': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    '2 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '3 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '4 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'laser': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'doming': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    'digital-label': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'hot-stamping': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'embroidery': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'full-color': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-drinkware': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-background': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-sub': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'laser-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'no-print': {
      addExpress: 0, ranges: [
        { min: 1, max: 99, express: 0 },
        { min: 100, max: 249, express: 0 },
        { min: 250, max: 499, express: 0 },
        { min: 500, max: 999, express: 0 },
        { min: 1000, max: 2499, express: 0 }
      ]
    }
  },
  'Xindao': {
    '1 color': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    '2 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '3 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '4 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'laser': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'doming': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    'digital-label': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'hot-stamping': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'embroidery': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'full-color': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-drinkware': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-background': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-sub': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'laser-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'no-print': {
      addExpress: 0, ranges: [
        { min: 1, max: 99, express: 0 },
        { min: 100, max: 249, express: 0 },
        { min: 250, max: 499, express: 0 },
        { min: 500, max: 999, express: 0 },
        { min: 1000, max: 2499, express: 0 }
      ]
    }
  },
  'PF': {
    '1 color': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    '2 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '3 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    '4 colors': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'laser': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'doming': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 6 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    'digital-label': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'hot-stamping': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'embroidery': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 8 }
      ]
    },
    'full-color': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-drinkware': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-background': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'full-color-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'full-color-sub': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'laser-360': {
      addExpress: 7, ranges: [
        { min: 1, max: 99, express: 7 },
        { min: 100, max: 249, express: 7 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 8 },
        { min: 1000, max: 2499, express: 9 }
      ]
    },
    'no-print': {
      addExpress: 0, ranges: [
        { min: 1, max: 99, express: 0 },
        { min: 100, max: 249, express: 0 },
        { min: 250, max: 499, express: 0 },
        { min: 500, max: 999, express: 0 },
        { min: 1000, max: 2499, express: 0 }
      ]
    }
  },
  'Stock': {
    '1 color': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 5 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    '2 colors': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 5 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    '3 colors': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 5 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    '4 colors': {
      addExpress: 5, ranges: [
        { min: 1, max: 99, express: 5 },
        { min: 100, max: 249, express: 5 },
        { min: 250, max: 499, express: 5 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'laser': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'embroidery': {
      addExpress: 6, ranges: [
        { min: 1, max: 99, express: 6 },
        { min: 100, max: 249, express: 6 },
        { min: 250, max: 499, express: 7 },
        { min: 500, max: 999, express: 7 },
        { min: 1000, max: 2499, express: 7 }
      ]
    },
    'full-color': {
      addExpress: 4, ranges: [
        { min: 1, max: 99, express: 4 },
        { min: 100, max: 249, express: 4 },
        { min: 250, max: 499, express: 4 },
        { min: 500, max: 999, express: 5 },
        { min: 1000, max: 2499, express: 6 }
      ]
    },
    'no-print': {
      addExpress: 0, ranges: [
        { min: 1, max: 99, express: 0 },
        { min: 100, max: 249, express: 0 },
        { min: 250, max: 499, express: 0 },
        { min: 500, max: 999, express: 0 },
        { min: 1000, max: 2499, express: 0 }
      ]
    }
  }
};

// Special technique variants
const SPECIAL_TECHNIQUES = {
  'full-color-360': {
    addExpress: 7, ranges: [
      { min: 1, max: 99, express: 7 },
      { min: 100, max: 249, express: 7 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 9 }
    ]
  },
  'full-color-sub': {
    addExpress: 4, ranges: [
      { min: 1, max: 99, express: 4 },
      { min: 100, max: 249, express: 4 },
      { min: 250, max: 499, express: 4 },
      { min: 500, max: 999, express: 5 },
      { min: 1000, max: 2499, express: 6 }
    ]
  },
  'laser-360': {
    addExpress: 7, ranges: [
      { min: 1, max: 99, express: 7 },
      { min: 100, max: 249, express: 7 },
      { min: 250, max: 499, express: 7 },
      { min: 500, max: 999, express: 8 },
      { min: 1000, max: 2499, express: 9 }
    ]
  }
};

function calculateShippingDays(brand, printing, quantity, printingTechniqueField = '') {
  // Get default shipping days for brand
  const defaults = DEFAULT_SHIPPING_DAYS[brand] || DEFAULT_SHIPPING_DAYS.default;
  const standardDefault = defaults.standard;
  const expressDefault = defaults.express;

  // Handle special custom products first
  if (printingTechniqueField.includes('--5!')) {
    return { standard: 5, express: expressDefault };
  }
  if (printingTechniqueField.includes('--10!')) {
    return { standard: 10, express: expressDefault };
  }
  if (printingTechniqueField.includes('--15!')) {
    return { standard: 15, express: expressDefault };
  }
  if (printingTechniqueField.includes('--20!')) {
    return { standard: 20, express: expressDefault };
  }
  if (printingTechniqueField.includes('--25!')) {
    return { standard: 25, express: expressDefault };
  }
  if (printingTechniqueField.includes('--30!')) {
    return { standard: 30, express: expressDefault };
  }
  if (printingTechniqueField.includes('--35!')) {
    return { standard: 35, express: expressDefault };
  }
  if (printingTechniqueField.includes('--40!')) {
    return { standard: 40, express: expressDefault };
  }
  if (printingTechniqueField.includes('--45!')) {
    return { standard: 45, express: expressDefault };
  }
  if (printingTechniqueField.includes('--50!')) {
    return { standard: 50, express: expressDefault };
  }

  // Handle special technique variants
  let actualTechnique = printing;
  if (printing === 'full-color' && printingTechniqueField.includes('-- 360 --')) {
    actualTechnique = 'full-color-360';
  } else if (printing === 'full-color' && printingTechniqueField.includes('-- SUB --')) {
    actualTechnique = 'full-color-sub';
  } else if (printing === 'laser' && printingTechniqueField.includes('-- 360 --')) {
    actualTechnique = 'laser-360';
  }

  // Get shipping options for the technique
  let shippingOption = SHIPPING_OPTIONS[actualTechnique] || SPECIAL_TECHNIQUES[actualTechnique];
  if (!shippingOption) {
    // console.warn(`No shipping option found for technique: ${actualTechnique}`);
    return { standard: standardDefault + 5, express: expressDefault + 5 };
  }

  // Get brand-specific adjustments
  let brandAdjustment = BRAND_ADJUSTMENTS[brand]?.[printing];
  if (!brandAdjustment) {
    brandAdjustment = { addExpress: 0, ranges: [] };
  }

  // Calculate express days
  let express = shippingOption.addExpress + brandAdjustment.addExpress + expressDefault;
  let standard = express + standardDefault;

  // Check quantity ranges in shipping options
  const quantityRange = shippingOption.ranges?.find(range =>
    quantity >= range.min && quantity <= range.max
  );
  if (quantityRange) {
    express = quantityRange.express + brandAdjustment.addExpress + expressDefault;
    standard = express + standardDefault;
  }

  // Check brand-specific quantity ranges
  const brandRange = brandAdjustment.ranges?.find(range =>
    quantity >= range.min && quantity <= range.max
  );
  if (brandRange) {
    express = brandRange.express + expressDefault;
    standard = express + standardDefault;
  }

  // For special techniques, use their specific ranges
  if (actualTechnique !== printing && SPECIAL_TECHNIQUES[actualTechnique]) {
    const specialRange = SPECIAL_TECHNIQUES[actualTechnique].ranges?.find(range =>
      quantity >= range.min && quantity <= range.max
    );
    if (specialRange) {
      express = specialRange.express + expressDefault;
      standard = express + standardDefault;
    }
  }

  return { standard, express };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand') || 'default';
  const printing = searchParams.get('printing') || '1 color';
  const quantity = parseInt(searchParams.get('quantity') || '0', 10);
  const printingTechniqueField = searchParams.get('printing_technique_field') || '';


  const result = calculateShippingDays(brand, printing, quantity, printingTechniqueField);

  // Handle express = -1 (not available)
  const expressShippingDays = result.express === -1 ? -1 : result.express;
  const totalExpressDays = result.express === -1 ? -1 : result.express;

  const response = {
    productionDays: null, // We're calculating total days directly
    standardShippingDays: result.standard,
    expressShippingDays: expressShippingDays,
    totalStandardDays: result.standard,
    totalExpressDays: totalExpressDays,
    brand,
    printing,
    quantity,
    calculation: {
      technique: printing,
      actualTechnique: printing,
      specialField: printingTechniqueField || null
    }
  };


  return NextResponse.json(response);
}
