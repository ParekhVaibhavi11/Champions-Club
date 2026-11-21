import * as service from './shop.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const products = async (req, res, next) => {
  try { return successResponse(res, await service.listProducts(), 'Shop catalog retrieved'); } catch (err) { next(err); }
};
export const inventory = async (req, res, next) => {
  try { return successResponse(res, await service.getInventory(), 'Inventory retrieved'); } catch (err) { next(err); }
};
export const movements = async (req, res, next) => {
  try { return successResponse(res, await service.getStockMovements(), 'Stock movement history retrieved'); } catch (err) { next(err); }
};
export const adjustInventory = async (req, res, next) => {
  try { return successResponse(res, await service.adjustInventory({ ...req.body, userId: req.user.id }), 'Inventory adjusted'); } catch (err) { next(err); }
};
export const createOrder = async (req, res, next) => {
  try { return successResponse(res, await service.createOrder({ ...req.body, cashierId: req.user.id }), 'POS order completed', 201); } catch (err) { next(err); }
};
export const orders = async (req, res, next) => {
  try { return successResponse(res, await service.listOrders(), 'Recent POS orders retrieved'); } catch (err) { next(err); }
};
