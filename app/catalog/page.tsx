'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewModule,
  ViewList,
  ShoppingCart,
  Phone,
  Email,
} from '@mui/icons-material';

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
  sellingPrice: number;
  imageUrl: string | null;
  category: Category | null;
  quantity: number; // 可用库存
}

interface CatalogResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  categories: Category[];
}

export default function CatalogPage() {
  const [catalogData, setCatalogData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 搜索和过滤状态
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // 分页状态
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);

  // 获取商品目录数据
  const fetchCatalogData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
      });
      
      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      
      const response = await fetch(`/api/catalog?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('获取商品目录失败');
      }
      
      const data: CatalogResponse = await response.json();
      setCatalogData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和依赖更新
  useEffect(() => {
    fetchCatalogData();
  }, [page, search, categoryFilter]);

  // 处理搜索
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // 重置到第一页
  };

  // 处理分页
  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                大一
              </Typography>
            </Box>
            <Typography variant="h6" component="div">
              大一株式会社在库一览
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              WeChat: dayi5211
            </Typography>
            <IconButton color="inherit">
              <Phone />
            </IconButton>
            <IconButton color="inherit">
              <Email />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* 搜索和过滤器 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="搜索商品名称或SKU..."
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
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>商品分类</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="商品分类"
              >
                <MenuItem value="">全部分类</MenuItem>
                {catalogData?.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />
            
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
              startIcon={<ViewList />}
            >
              表格视图
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
              startIcon={<ViewModule />}
            >
              网格视图
            </Button>
          </Box>
        </Paper>

        {/* 错误提示 */}
        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* 表格视图 */}
        {viewMode === 'table' && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>No.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>分类</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>图像</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>商品名</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>JANコード</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>销量</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>箱规</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>在库数</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>定价</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography>加载中...</Typography>
                    </TableCell>
                  </TableRow>
                ) : catalogData?.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        没有找到商品
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  catalogData?.products.map((product, index) => (
                    <TableRow 
                      key={product.id} 
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                        '&:hover': { bgcolor: '#e3f2fd' }
                      }}
                    >
                      <TableCell align="center">
                        {(page - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={product.category?.name || '未分类'} 
                          size="small"
                          color={product.category ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                          }}
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              无图
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography variant="caption" color="text.secondary">
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontFamily="monospace">
                          {product.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">-</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">-</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={product.quantity > 0 ? 'success.main' : 'error.main'}
                        >
                          {product.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {formatPrice(product.sellingPrice)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 网格视图 */}
        {viewMode === 'grid' && (
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Typography align="center">加载中...</Typography>
              </Grid>
            ) : catalogData?.products.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  没有找到商品
                </Typography>
              </Grid>
            ) : (
              catalogData?.products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                  >
                    <CardMedia
                      sx={{
                        height: 200,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          暂无图片
                        </Typography>
                      )}
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        SKU: {product.sku}
                      </Typography>
                      {product.category && (
                        <Chip 
                          label={product.category.name} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatPrice(product.sellingPrice)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={product.quantity > 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          库存: {product.quantity}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* 分页 */}
        {catalogData && catalogData.pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={catalogData.pagination.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* 底部信息 */}
        <Paper sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                联系我们
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>微信:</strong> dayi5211
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>公司:</strong> 大一株式会社
              </Typography>
              <Typography variant="body2">
                <strong>业务:</strong> 库存商品批发零售
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                说明
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 所有价格均为含税价格
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 库存数量实时更新
              </Typography>
              <Typography variant="body2">
                • 如需询价或下单，请联系客服
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
} 