import axiosAuth from "@/lib/axios";
import { create } from "zustand";

export interface Address {
  id: string;
  recipientName: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  selectedAddress: string | null; // آدرس انتخاب شده
  fetchAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  updateAddress: (
    id: string,
    address: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<void>;
  setSelectedAddress: (id: string | null) => void;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  selectedAddress: null,
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/address/get-address`);
      const fetchedAddresses: Address[] = response.data.address;
      set({ addresses: fetchedAddresses, isLoading: false });

      // Automatically select default or first address after fetching
      const currentSelected = get().selectedAddress;
      const selectedExists = fetchedAddresses.some(
        (a) => a.id === currentSelected
      );
      if (!currentSelected || !selectedExists) {
        const defaultAddress = fetchedAddresses.find((a) => a.isDefault);
        if (defaultAddress) {
          set({ selectedAddress: defaultAddress.id });
        } else if (fetchedAddresses.length > 0) {
          set({ selectedAddress: fetchedAddresses[0].id });
        } else {
          set({ selectedAddress: null });
        }
      }
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch addresses" });
    }
  },
  setSelectedAddress: (id) => set({ selectedAddress: id }),
  createAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(`/address/add-address`, address);
      const wasEmpty = get().addresses.length === 0;
      await get().fetchAddresses();
      // If it was the first address, it's now selected automatically by fetchAddresses
      set({ isLoading: false });
      return response.data.address;
    } catch (e) {
      set({ isLoading: false, error: "Failed to create address" });
      return null;
    }
  },
  setDefaultAddress: async (id: string) => {
    try {
      await axiosAuth.put(`/address/update-address/${id}`, { isDefault: true });
      await get().fetchAddresses();
    } catch (error) {
      console.error("Failed to set default address", error);
    }
  },
  // ... other functions (updateAddress, deleteAddress) remain the same
  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(
        `/address/update-address/${id}`,
        address
      );
      await get().fetchAddresses();
      set({ isLoading: false });
      return response.data.address;
    } catch (e) {
      set({ isLoading: false, error: "Failed to update address" });
      return null;
    }
  },
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosAuth.delete(`/address/delete-address/${id}`);
      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
        isLoading: false,
      }));
      await get().fetchAddresses();
      return true;
    } catch (e) {
      set({ isLoading: false, error: "Failed to delete address" });
      return false;
    }
  },
}));
