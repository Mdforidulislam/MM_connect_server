interface FinalClientResponse {
  selectedProduct: {
    brandName: string;
    partNumber: string;
    quantity: number;
    hsCode: string | null;
    coo: string | null;
    totalPrice: Array<{
      offers: string;
      moq: string;
      eta: string;
      price: string;
    }>;
    partiallyMatch: Array<{
      productName: string;
      partNumber: string;
      brandName: string;
    }>;
  };
}



export interface PartialSearchResult {
  ProductName: string;
  PartNumber: string;
  Brand: string;
}