export type UserRole = 'customer' | 'retailer' | 'salesman' | 'b2c_salesman';

export type UserRoles = {
  [key: string]: {
    role: UserRole;
    label: string;
  };
};

export const UserRoleAlias: {[key: string]: UserRole} = {
  CUSTOMER: 'customer',
  RETAILER: 'retailer',
  SALESMAN: 'salesman',
  B2C_SALESMAN: 'b2c_salesman',
};

export const UserRoles: UserRoles = {
  customer: {
    role: 'customer',
    label: 'Customer',
  },
  retailer: {
    role: 'retailer',
    label: 'Retailer',
  },
  salesman: {
    role: 'salesman',
    label: 'Salesman',
  },
  b2c_salesman: {
    role: 'b2c_salesman',
    label: 'B2C Salesman',
  },
};
