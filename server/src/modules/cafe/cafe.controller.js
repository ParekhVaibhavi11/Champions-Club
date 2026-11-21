import * as service from './cafe.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const menu = async (req, res, next) => { try { return successResponse(res, await service.getMenu(), 'Cafe menu retrieved'); } catch (err) { next(err); } };
export const tables = async (req, res, next) => { try { return successResponse(res, await service.getTables(), 'Cafe tables retrieved'); } catch (err) { next(err); } };
export const openOrders = async (req, res, next) => { try { return successResponse(res, await service.listOpenOrders(), 'Open cafe orders retrieved'); } catch (err) { next(err); } };
export const createTab = async (req, res, next) => { try { return successResponse(res, await service.createTab({ ...req.body, staffId: req.user.id }), 'Cafe tab opened', 201); } catch (err) { next(err); } };
export const appendItems = async (req, res, next) => { try { return successResponse(res, await service.appendItems(req.params.id, req.body.items), 'Items added to cafe tab'); } catch (err) { next(err); } };
export const kitchenStatus = async (req, res, next) => { try { return successResponse(res, await service.updateKitchenStatus(req.params.id, req.body.status), 'Kitchen status updated'); } catch (err) { next(err); } };
export const settle = async (req, res, next) => { try { return successResponse(res, await service.settleTab({ orderId: Number(req.params.id), staffId: req.user.id, paymentMethod: req.body.payment_method }), 'Cafe tab settled'); } catch (err) { next(err); } };
