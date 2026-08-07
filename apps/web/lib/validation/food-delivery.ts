export type PlaceOrderFormValues = {
  deliveryAddress: string;
};

export type MenuItemFormValues = {
  name: string;
  description?: string;
  price: number;
};

export type RestaurantFormValues = {
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  ownerUserId: string;
};

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePlaceOrder(input: { deliveryAddress: string }): ParseResult<PlaceOrderFormValues> {
  const deliveryAddress = input.deliveryAddress.trim();
  const errors: Record<string, string> = {};
  if (deliveryAddress.length < 5) {
    errors.deliveryAddress = 'Delivery address must be at least 5 characters';
  } else if (deliveryAddress.length > 500) {
    errors.deliveryAddress = 'Delivery address is too long';
  }
  if (Object.keys(errors).length) return { success: false, errors };
  return { success: true, data: { deliveryAddress } };
}

export function parseMenuItem(input: {
  name: string;
  description?: string;
  price: string | number;
}): ParseResult<MenuItemFormValues> {
  const name = input.name.trim();
  const description = input.description?.trim();
  const price = typeof input.price === 'number' ? input.price : Number(input.price);
  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required';
  else if (name.length > 120) errors.name = 'Name is too long';

  if (description && description.length > 500) {
    errors.description = 'Description is too long';
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Price must be greater than zero';
  }

  if (Object.keys(errors).length) return { success: false, errors };
  return {
    success: true,
    data: {
      name,
      description: description || undefined,
      price,
    },
  };
}

export function parseRestaurant(input: {
  name: string;
  cuisine: string;
  address: string;
  description?: string;
  ownerUserId: string;
}): ParseResult<RestaurantFormValues> {
  const name = input.name.trim();
  const cuisine = input.cuisine.trim();
  const address = input.address.trim();
  const description = input.description?.trim();
  const ownerUserId = input.ownerUserId.trim();
  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required';
  if (!cuisine) errors.cuisine = 'Cuisine is required';
  if (address.length < 5) errors.address = 'Address is required';
  if (!UUID_RE.test(ownerUserId)) errors.ownerUserId = 'Select a staff owner';
  if (description && description.length > 500) {
    errors.description = 'Description is too long';
  }

  if (Object.keys(errors).length) return { success: false, errors };
  return {
    success: true,
    data: {
      name,
      cuisine,
      address,
      description: description || undefined,
      ownerUserId,
    },
  };
}
