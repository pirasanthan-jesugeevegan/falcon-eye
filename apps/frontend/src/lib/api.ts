import type {
  Product,
  UnitTestResult,
  E2ETestResult,
  JiraConfig,
} from '@/types';

// Base URL for API calls
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log(import.meta.env.VITE_API_BASE_URL);
// Error handling utility
const handleError = (error: unknown) => {
  console.error('API Error:', error);
  throw error;
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

// Get product by ID
export const getProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

// Get product by ID
export const getUnitProductTestResults = async (
  productName: string,
): Promise<UnitTestResult[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/unit-results?productName=${productName}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

export const getE2EProductTestResults = async (
  productName: string,
): Promise<E2ETestResult[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/e2e-results?productName=${productName}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

// Add new product
export const addProduct = async (
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to add product: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    return handleError(error);
  }
};

// Get Jira configuration
export const getJiraConfig = async (): Promise<JiraConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jira/config/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Jira configuration: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

// Update Jira configuration
export const updateJiraConfig = async (
  config: JiraConfig,
): Promise<JiraConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jira/config/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to update Jira configuration: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return handleError(error);
  }
};
