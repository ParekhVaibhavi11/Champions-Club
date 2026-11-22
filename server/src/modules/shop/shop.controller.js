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
export const verifyMembershipDiscount = async (req, res, next) => {
  try {
    return successResponse(res, await service.verifyMembershipDiscount(req.body.customer_email), 'Membership discount verified');
  } catch (err) {
    next(err);
  }
};
export const adjustInventory = async (req, res, next) => {
  try { return successResponse(res, await service.adjustInventory({ ...req.body, userId: req.user.id }), 'Inventory adjusted'); } catch (err) { next(err); }
};
export const createOrder = async (req, res, next) => {
  try {
    const result = await service.createOrder({
      customerId: req.body.customer_id,
      customerName: req.body.customer_name,
      customerEmail: req.body.customer_email,
      cashierId: req.user.id,
      paymentMethod: req.body.payment_method,
      items: req.body.items,
    });
    return successResponse(res, result, 'POS order completed', 201);
  } catch (err) {
    next(err);
  }
};
export const orders = async (req, res, next) => {
  try { return successResponse(res, await service.listOrders(), 'Recent POS orders retrieved'); } catch (err) { next(err); }
};
