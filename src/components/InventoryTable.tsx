'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Fab,
} from '@mui/material';
import {
  Search,
  Refresh,
  Warning,
  Edit,
  Delete,
  Add,
  FilterList,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// 定义数据类型
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  categoryId: number | null;
  supplierId: number | null;
  purchasePrice: number;
  sellingPrice: number;
  imageUrl: string | null;
  lowStockThreshold: number | null;
  category: Category | null;
}

interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
  location: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface InventoryResponse {
  inventoryItems: InventoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalItems: number;
    lowStockItems: number;
    totalValue: number;
  };
}

interface EditFormData {
  productName: string;
  description: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  location: string;
  batchNumber: string;
  sellingPrice: number;
  lowStockThreshold: number;
}

export default function InventoryTable() {
  const { user, token } = useAuth();
  const [inventoryData, setInventoryData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 搜索和过滤状态
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  
  // 分页状态
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 排序状态
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 编辑对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    productName: '',
    description: '',
    sku: '',
    quantity: 0,
    reservedQuantity: 0,
    location: '',
    batchNumber: '',
    sellingPrice: 0,
    lowStockThreshold: 0,
  });

  // 新增对话框状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<EditFormData>({
    productName: '',
    description: '',
    sku: '',
    quantity: 0,
    reservedQuantity: 0,
    location: '',
    batchNumber: '',
    sellingPrice: 0,
    lowStockThreshold: 10,
  });

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // 检查用户是否有编辑权限（包括测试用户）
  const hasEditPermission = () => {
    if (!user) return false;
    // 测试用户（id为999）也给予编辑权限，或者是管理员/经理
    return user.id === 999 || user.role === 'ADMIN' || user.role === 'MANAGER';
  };

  // 获取库存数据
  const fetchInventoryData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder,
      });
      
      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (lowStockFilter) params.append('lowStock', 'true');
      
      const response = await fetch(`/api/inventory?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('获取库存数据失败');
      }
      
      const data: InventoryResponse = await response.json();
      setInventoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和依赖更新
  useEffect(() => {
    fetchInventoryData();
  }, [token, page, rowsPerPage, sortBy, sortOrder, search, categoryFilter, locationFilter, lowStockFilter]);

  // 处理搜索
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // 重置到第一页
  };

  // 处理分页
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 打开编辑对话框
  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData({
      productName: item.product.name,
      description: item.product.description || '',
      sku: item.product.sku,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      location: item.location || '',
      batchNumber: item.batchNumber || '',
      sellingPrice: item.product.sellingPrice,
      lowStockThreshold: item.product.lowStockThreshold || 0,
    });
    setEditDialogOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem || !token) return;

    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      setEditDialogOpen(false);
      setEditingItem(null);
      fetchInventoryData(); // 重新获取数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新时发生错误');
    }
  };

  // 打开新增对话框
  const handleAddClick = () => {
    setAddFormData({
      productName: '',
      description: '',
      sku: '',
      quantity: 0,
      reservedQuantity: 0,
      location: '',
      batchNumber: '',
      sellingPrice: 0,
      lowStockThreshold: 10,
    });
    setAddDialogOpen(true);
  };

  // 保存新增
  const handleSaveAdd = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addFormData),
      });

      if (!response.ok) {
        throw new Error('新增失败');
      }

      setAddDialogOpen(false);
      fetchInventoryData(); // 重新获取数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增时发生错误');
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (item: InventoryItem) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingItem || !token) return;

    try {
      const response = await fetch(`/api/inventory/${deletingItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      setDeleteDialogOpen(false);
      setDeletingItem(null);
      fetchInventoryData(); // 重新获取数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除时发生错误');
    }
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 判断是否低库存
  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= (item.product.lowStockThreshold || 0);
  };

  // 计算可用库存
  const getAvailableStock = (item: InventoryItem) => {
    return item.quantity - item.reservedQuantity;
  };

  if (!user) {
    return (
      <Alert severity="warning">
        请先登录以查看库存数据
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 标题和统计 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            库存管理
          </Typography>
          {hasEditPermission() && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClick}
              sx={{ mb: 1 }}
            >
              新增商品
            </Button>
          )}
        </Box>
        
        {inventoryData?.stats && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip 
              label={`总商品: ${inventoryData.stats.totalItems}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`低库存: ${inventoryData.stats.lowStockItems}`} 
              color="warning" 
              variant="outlined" 
            />
            <Chip 
              label={`总价值: ${formatPrice(inventoryData.stats.totalValue)}`} 
              color="success" 
              variant="outlined" 
            />
          </Box>
        )}
      </Box>

      {/* 搜索和过滤器 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="搜索商品名称、SKU或描述..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>分类</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="分类"
            >
              <MenuItem value="">全部</MenuItem>
              {/* 这里可以添加分类选项 */}
            </Select>
          </FormControl>
          
          <TextField
            placeholder="存储位置"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          />
          
          <Button
            variant={lowStockFilter ? "contained" : "outlined"}
            color="warning"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            startIcon={<Warning />}
          >
            低库存
          </Button>
          
          <IconButton onClick={fetchInventoryData} color="primary">
            <Refresh />
          </IconButton>

          {/* 添加分隔符 */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* CRUD操作按钮 */}
          {hasEditPermission() && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<Add />}
                onClick={handleAddClick}
                size="small"
              >
                新增商品
              </Button>
              {/* <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
                size="small"
                disabled={!inventoryData?.inventoryItems.length}
              >
                批量编辑
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                size="small"
                disabled={!inventoryData?.inventoryItems.length}
              >
                批量删除
              </Button> */}
            </Box>
          )}
        </Box>

        {/* 操作提示 */}
        {hasEditPermission() && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.contrastText">
              💡 提示：点击表格中的编辑/删除图标可对单个商品进行操作，或使用上方按钮进行批量操作
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>商品信息</TableCell>
              <TableCell align="right">SKU</TableCell>
              <TableCell align="right">分类</TableCell>
              <TableCell align="right">库存数量</TableCell>
              <TableCell align="right">可用库存</TableCell>
              <TableCell align="right">预留数量</TableCell>
              <TableCell align="right">存储位置</TableCell>
              <TableCell align="right">批次号</TableCell>
              <TableCell align="right">过期日期</TableCell>
              <TableCell align="right">单价</TableCell>
              <TableCell align="right">库存价值</TableCell>
              <TableCell align="right">状态</TableCell>
              {hasEditPermission() && (
                <TableCell align="right">操作</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : inventoryData?.inventoryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    没有找到库存数据
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              inventoryData?.inventoryItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {item.product.name}
                      </Typography>
                      {item.product.description && (
                        <Typography variant="caption" color="text.secondary">
                          {item.product.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {item.product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {item.product.category ? (
                      <Chip 
                        label={item.product.category.name} 
                        size="small" 
                        variant="outlined" 
                      />
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={isLowStock(item) ? 'error' : 'inherit'}
                      fontWeight={isLowStock(item) ? 'bold' : 'normal'}
                    >
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {getAvailableStock(item)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.reservedQuantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.location || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {item.batchNumber || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.expiryDate ? formatDate(item.expiryDate) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatPrice(item.product.sellingPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {formatPrice(item.quantity * item.product.sellingPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isLowStock(item) ? (
                      <Chip 
                        label="低库存" 
                        color="error" 
                        size="small"
                        icon={<Warning />}
                      />
                    ) : (
                      <Chip 
                        label="正常" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  {hasEditPermission() && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="编辑">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* 分页 */}
        {inventoryData && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={inventoryData.pagination.totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="每页行数:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} 共 ${count !== -1 ? count : `超过 ${to}`} 条`
            }
          />
        )}
      </TableContainer>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>编辑商品</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="商品名称"
                value={editFormData.productName}
                onChange={(e) => setEditFormData({...editFormData, productName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={editFormData.sku}
                onChange={(e) => setEditFormData({...editFormData, sku: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={2}
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="库存数量"
                type="number"
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="预留数量"
                type="number"
                value={editFormData.reservedQuantity}
                onChange={(e) => setEditFormData({...editFormData, reservedQuantity: parseInt(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="存储位置"
                value={editFormData.location}
                onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="批次号"
                value={editFormData.batchNumber}
                onChange={(e) => setEditFormData({...editFormData, batchNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="销售价格"
                type="number"
                value={editFormData.sellingPrice}
                onChange={(e) => setEditFormData({...editFormData, sellingPrice: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="低库存阈值"
                type="number"
                value={editFormData.lowStockThreshold}
                onChange={(e) => setEditFormData({...editFormData, lowStockThreshold: parseInt(e.target.value) || 0})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<Cancel />}>
            取消
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<Save />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增对话框 */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>新增商品</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="商品名称"
                value={addFormData.productName}
                onChange={(e) => setAddFormData({...addFormData, productName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={addFormData.sku}
                onChange={(e) => setAddFormData({...addFormData, sku: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={2}
                value={addFormData.description}
                onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="库存数量"
                type="number"
                value={addFormData.quantity}
                onChange={(e) => setAddFormData({...addFormData, quantity: parseInt(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="预留数量"
                type="number"
                value={addFormData.reservedQuantity}
                onChange={(e) => setAddFormData({...addFormData, reservedQuantity: parseInt(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="存储位置"
                value={addFormData.location}
                onChange={(e) => setAddFormData({...addFormData, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="批次号"
                value={addFormData.batchNumber}
                onChange={(e) => setAddFormData({...addFormData, batchNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="销售价格"
                type="number"
                value={addFormData.sellingPrice}
                onChange={(e) => setAddFormData({...addFormData, sellingPrice: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="低库存阈值"
                type="number"
                value={addFormData.lowStockThreshold}
                onChange={(e) => setAddFormData({...addFormData, lowStockThreshold: parseInt(e.target.value) || 0})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} startIcon={<Cancel />}>
            取消
          </Button>
          <Button onClick={handleSaveAdd} variant="contained" startIcon={<Save />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除商品 "{deletingItem?.product.name}" 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 