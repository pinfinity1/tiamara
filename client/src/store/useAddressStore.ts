// client/src/store/useAddressStore.ts

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
  selectedAddress: string | null;
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

  // ✅ FIX: مقدار اولیه باید true باشد تا جلوی پرش مودال گرفته شود
  isLoading: true,

  error: null,
  selectedAddress: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/address/get-address`);
      // هندل کردن حالتی که بک‌اند ممکن است در کلید addresses یا address بفرستد
      const fetchedAddresses: Address[] =
        response.data.address || response.data.addresses || [];

      set({ addresses: fetchedAddresses, isLoading: false });

      // انتخاب خودکار آدرس پیش‌فرض یا اولین آدرس
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
      await get().fetchAddresses();
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
      // آپدیت خوش‌بینانه برای حذف سریع از UI
      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
        // اگر آدرس حذف شده همان آدرس انتخابی بود، انتخاب را ریست کن
        selectedAddress:
          state.selectedAddress === id ? null : state.selectedAddress,
      }));

      // فچ دوباره برای اطمینان از هماهنگی با سرور (و انتخاب آدرس جدید اگر لازم بود)
      await get().fetchAddresses();

      set({ isLoading: false });
      return true;
    } catch (e) {
      set({ isLoading: false, error: "Failed to delete address" });
      return false;
    }
  },
}));
