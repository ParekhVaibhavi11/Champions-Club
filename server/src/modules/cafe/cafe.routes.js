import { Router } from 'express';
import * as controller from './cafe.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { checkStaffSubPermission } from '../../middleware/staffPermission.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();
router.get('/cafe/menu', controller.menu);
router.get('/cafe/tables', authenticateToken, authorizeRole(['staff', 'admin', 'member']), checkStaffSubPermission('cafe'), controller.tables);
router.post('/cafe/orders', authenticateToken, authorizeRole(['staff', 'admin', 'member']), checkStaffSubPermission('cafe'), controller.createTab);
router.post('/cafe/orders/:id/items', authenticateToken, authorizeRole(['staff', 'admin', 'member']), checkStaffSubPermission('cafe'), controller.appendItems);
router.post('/cafe/orders/:id/settle', authenticateToken, authorizeRole(['staff', 'admin', 'member']), checkStaffSubPermission('cafe'), controller.settle);
router.get('/cafe/kitchen-queue', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('kitchen'), controller.openOrders);
router.patch('/cafe/orders/:id/kitchen-status', authenticateToken, authorizeRole(['staff', 'admin']), checkStaffSubPermission('kitchen'), controller.kitchenStatus);
export default router;
