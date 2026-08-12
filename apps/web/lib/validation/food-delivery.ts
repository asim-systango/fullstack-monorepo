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

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches api-gateway RegisterDto strong password rules. */
const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function parseLogin(input: {
  email: string;
  password: string;
}): ParseResult<LoginFormValues> {
  const email = input.email.trim();
  const password = input.password;
  const errors: Record<string, string> = {};

  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email';

  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length) return { success: false, errors };
  return { success: true, data: { email, password } };
}

export function parseRegister(input: {
  name: string;
  email: string;
  password: string;
}): ParseResult<RegisterFormValues> {
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password;
  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required';
  else if (name.length > 120) errors.name = 'Name is too long';

  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email';

  if (!password) {
    errors.password = 'Password is required';
  } else if (!STRONG_PASSWORD_RE.test(password)) {
    errors.password =
      'Use 8+ characters with uppercase, lowercase, a number, and a special character';
  } else if (password.length > 128) {
    errors.password = 'Password is too long';
  }

  if (Object.keys(errors).length) return { success: false, errors };
  return { success: true, data: { name, email, password } };
}

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

  if (input.price === '' || input.price === null || input.price === undefined) {
    errors.price = 'Price is required';
  } else if (!Number.isFinite(price) || price <= 0) {
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
  else if (name.length > 120) errors.name = 'Name is too long';

  if (!cuisine) errors.cuisine = 'Cuisine is required';
  else if (cuisine.length > 80) errors.cuisine = 'Cuisine is too long';

  if (address.length < 5) errors.address = 'Address must be at least 5 characters';
  else if (address.length > 500) errors.address = 'Address is too long';

  if (!ownerUserId) errors.ownerUserId = 'Owner user id is required';
  else if (!UUID_RE.test(ownerUserId)) errors.ownerUserId = 'Enter a valid owner user id';

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
