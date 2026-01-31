import React from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export type UnitType = string;

export interface ProductAddress {
  street: string;
  block: string;
  level: string;
  position: string;
}

export interface Product {
  id: string;
  code: string;
  ean?: string;
  name: string;
  category: string;
  description: string;
  unit: UnitType;
  quantity: number;
  minQuantity: number;
  address: ProductAddress;
  supplier: string;
  createdAt: string;
  imageUrl?: string;
  observation?: string;
}

export type TransactionType = 'entry' | 'exit';
export type TransactionOrigin = 'compra' | 'devolucao' | 'transferencia' | 'venda' | 'consumo';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  origin: TransactionOrigin;
  responsible: string;
  observation: string;
  address?: ProductAddress; 
}

export interface User {
  id: string;
  name: string;
  password?: string;
  role: UserRole;
  preferences?: {
    notifications: boolean;
    mobileMode: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}