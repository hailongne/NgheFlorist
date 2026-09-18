import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RequestProductInfo {
  id?: number;
  name?: string;
  slug?: string;
  price?: number | string;
  imageUrl?: string;
  categoryName?: string;
}

interface RequestContextType {
  isOpen: boolean;
  selectedProduct: RequestProductInfo | null;
  requestType: 'PRODUCT_SELECTION' | 'CUSTOM_DESIGN';
  openRequestModal: (product?: RequestProductInfo | null, type?: 'PRODUCT_SELECTION' | 'CUSTOM_DESIGN') => void;
  closeRequestModal: () => void;

  // Dedicated Product Contact Modal with Admin Conversion Channels
  isContactModalOpen: boolean;
  contactProduct: RequestProductInfo | null;
  openProductContactModal: (product: RequestProductInfo) => void;
  closeProductContactModal: () => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RequestProductInfo | null>(null);
  const [requestType, setRequestType] = useState<'PRODUCT_SELECTION' | 'CUSTOM_DESIGN'>('PRODUCT_SELECTION');

  // Contact modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactProduct, setContactProduct] = useState<RequestProductInfo | null>(null);

  const openRequestModal = (product: RequestProductInfo | null = null, type: 'PRODUCT_SELECTION' | 'CUSTOM_DESIGN' = 'PRODUCT_SELECTION') => {
    setSelectedProduct(product);
    setRequestType(product ? 'PRODUCT_SELECTION' : type);
    setIsOpen(true);
  };

  const closeRequestModal = () => {
    setIsOpen(false);
  };

  const openProductContactModal = (product: RequestProductInfo) => {
    setContactProduct(product);
    setIsContactModalOpen(true);
  };

  const closeProductContactModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <RequestContext.Provider
      value={{
        isOpen,
        selectedProduct,
        requestType,
        openRequestModal,
        closeRequestModal,
        isContactModalOpen,
        contactProduct,
        openProductContactModal,
        closeProductContactModal
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useCustomerRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useCustomerRequest must be used within a RequestProvider');
  }
  return context;
};
