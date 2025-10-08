// src/hooks/useCart.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define shape of a single cart item
export interface CartItem {
  type: "equipment" | "package";
  
  // Equipment fields
  equipmentId?: string;
  equipmentName?: string;
  pricePerDay?: number;
  availableQuantity?: number;

  // Package fields
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
  includedItems?: string[];

  // Shared
  quantity: number;
}

// Define context value
interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotalDays: number;
  cartStartDate: string | null;
  cartEndDate: string | null;
  addItemToCart: (item: any, quantityToAdd: number, type?: "equipment" | "package") => void;
  removeItemFromCart: (id: string, type: "equipment" | "package") => void;
  updateItemQuantity: (id: string, type: "equipment" | "package", newQuantity: number) => void;
  clearCart: () => void;
  setRentalDates: (startDate: string, endDate: string) => void;
  isCartValid: boolean;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Utility: calculate rental days
const calculateRentalDays = (start: string | null, end: string | null): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return 0;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Persist cart state
const usePersistedCart = (key: string, initialState: CartItem[]) => {
  const [state, setState] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};

const usePersistedDate = (key: string, initialState: string | null) => {
  const [state, setState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? saved : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    if (state !== null) {
      localStorage.setItem(key, state);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, state]);

  return [state, setState] as const;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = usePersistedCart("rental_cart", []);
  const [cartStartDate, setCartStartDate] = usePersistedDate("rental_start_date", null);
  const [cartEndDate, setCartEndDate] = usePersistedDate("rental_end_date", null);

  const cartTotalDays = calculateRentalDays(cartStartDate, cartEndDate);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isCartValid = cart.every(item => item.quantity > 0);

  // ✅ Add item (works for both equipment & package)
  const addItemToCart = (item: any, quantityToAdd: number, type: "equipment" | "package" = "equipment") => {
    setCart(currentCart => {
      let id = type === "equipment" ? (item.equipmentId || item._id) : (item.packageId || item._id);
      if (!id) {
        toast.error("Invalid item. Cannot add to cart.");
        return currentCart;
      }

      const existingIndex = currentCart.findIndex(
        i => (type === "equipment" ? i.equipmentId : i.packageId) === id
      );

      if (existingIndex > -1) {
        // Update existing item
        const existing = currentCart[existingIndex];
        const newQuantity = existing.quantity + quantityToAdd;

        if (type === "equipment" && newQuantity > (existing.availableQuantity || 0)) {
          toast.error(`Only ${existing.availableQuantity} available for ${existing.equipmentName}`);
          return currentCart;
        }

        const newCart = [...currentCart];
        newCart[existingIndex].quantity = newQuantity;
        toast.success(`Updated ${type} to quantity ${newQuantity}`);
        return newCart;
      }

      // Add new item
      let newItem: CartItem;
      if (type === "equipment") {
        if (quantityToAdd > (item.availableQuantity || item.available_quantity || 0)) {
          toast.error(`Only ${item.availableQuantity || item.available_quantity} available`);
          return currentCart;
        }
        newItem = {
          type: "equipment",
          equipmentId: id,
          equipmentName: item.name || "Unnamed Equipment",
          pricePerDay: item.pricePerDay || item.price_per_day || 0,
          availableQuantity: item.availableQuantity || item.available_quantity || 0,
          quantity: quantityToAdd,
        };
      } else {
        newItem = {
          type: "package",
          packageId: id,
          packageName: item.packageName || item.name || "Unnamed Package",
          packagePrice: item.packagePrice || item.price || 0,
          includedItems: item.includedItems || [],
          quantity: quantityToAdd,
        };
      }

      toast.success(`${type === "equipment" ? newItem.equipmentName : newItem.packageName} added to cart.`);
      return [...currentCart, newItem];
    });
  };

  const removeItemFromCart = (id: string, type: "equipment" | "package") => {
    setCart(currentCart => {
      const newCart = currentCart.filter(item =>
        type === "equipment" ? item.equipmentId !== id : item.packageId !== id
      );
      toast.info("Item removed from cart.");
      return newCart;
    });
  };

  const updateItemQuantity = (id: string, type: "equipment" | "package", newQuantity: number) => {
    setCart(currentCart => {
      const index = currentCart.findIndex(item =>
        type === "equipment" ? item.equipmentId === id : item.packageId === id
      );

      if (index > -1) {
        const item = currentCart[index];
        if (newQuantity < 1) {
          toast.error("Quantity must be at least 1.");
          return currentCart;
        }
        if (type === "equipment" && newQuantity > (item.availableQuantity || 0)) {
          toast.error(`Only ${item.availableQuantity} available.`);
          return currentCart;
        }

        const newCart = [...currentCart];
        newCart[index].quantity = newQuantity;
        return newCart;
      }
      return currentCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartStartDate(null);
    setCartEndDate(null);
    toast.info("Cart cleared.");
  };

  const setRentalDates = (startDate: string, endDate: string) => {
    setCartStartDate(startDate);
    setCartEndDate(endDate);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotalDays,
        cartStartDate,
        cartEndDate,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        setRentalDates,
        isCartValid,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
