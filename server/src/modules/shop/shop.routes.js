import { Router } from 'express';
import * as controller from './shop.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { checkStaffSubPermission } from '../../middleware/staffPermission.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();
router.get('/products', controller.products);
router.get('/inventory', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('shop'), controller.inventory);
router.get('/inventory/movements', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('shop'), controller.movements);
router.post('/inventory/adjustments', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('shop'), controller.adjustInventory);
router.get('/shop/orders', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('shop'), controller.orders);
router.post('/shop/orders', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('shop'), controller.createOrder);
export default router;
