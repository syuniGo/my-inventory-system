'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Inventory,
  Login,
  PersonAdd,
  Dashboard,
  Science,
  ArrowBack,
  Storefront,
  Analytics,
  Settings,
  Logout,
  ManageAccounts,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../src/contexts/AuthContext';
import InventoryTable from '../src/components/InventoryTable';

export default function HomePage() {
  const { user, logout, setTestUser } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'inventory'>('dashboard');

  // 处理测试模式
  const handleTestMode = () => {
    const testUser = {
      id: 999,
      username: 'test_user',
      email: 'test@example.com',
      role: 'MANAGER' as const,
      firstName: '测试',
      lastName: '用户',
      isActive: true
    };
    setTestUser(testUser);
  };

  // 处理外部目录跳转
  const handleCatalogOpen = () => {
    window.open('/catalog', '_blank');
  };

  // 如果用户已登录，显示完整的管理界面
  if (user) {
    return (
      <Box className="full-height gradient-bg-blue">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* 用户信息头部 */}
          <Box sx={{ textAlign: 'center', mb: 4, color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              欢迎回来，{user.firstName || user.username}！
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              角色: {user.role === 'ADMIN' ? '管理员' : user.role === 'MANAGER' ? '经理' : '用户'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {currentView === 'inventory' && (
                <Button
                  variant="outlined"
                  onClick={() => setCurrentView('dashboard')}
                  startIcon={<ArrowBack />}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  返回主页
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={logout}
                startIcon={<Logout />}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                退出登录
              </Button>
            </Box>
          </Box>

          {/* 根据当前视图显示不同内容 */}
          {currentView === 'dashboard' ? (
            /* 主控制面板 */
            <Card elevation={8} sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                库存管理系统 - 控制面板
              </Typography>
              
              {/* 核心功能区 */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                📋 核心功能
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                    onClick={() => setCurrentView('inventory')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                      <Inventory />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      库存管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      查看和管理所有商品库存
                    </Typography>
                    <Button variant="contained" size="small" fullWidth>
                      进入管理
                    </Button>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                    onClick={handleCatalogOpen}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
                      <Storefront />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      商品目录
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      外部客户查看商品页面
                    </Typography>
                    <Button variant="contained" size="small" fullWidth color="success">
                      打开目录
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main' }}>
                      <Analytics />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      数据统计
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      查看库存统计和报表
                    </Typography>
                    <Button variant="contained" size="small" fullWidth color="info">
                      查看报表
                    </Button>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* 管理功能区 */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'warning.main' }}>
                ⚙️ 管理功能
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'secondary.main' }}>
                      <ManageAccounts />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      用户管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      管理系统用户和权限
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      color="secondary"
                      disabled={user.role === 'USER'}
                    >
                      {user.role === 'USER' ? '权限不足' : '用户管理'}
                    </Button>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main' }}>
                      <Settings />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      系统设置
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      配置系统参数和设置
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      color="warning"
                      disabled={user.role !== 'ADMIN'}
                    >
                      {user.role !== 'ADMIN' ? '权限不足' : '系统设置'}
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'error.main' }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      系统监控
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      监控系统状态和性能
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      color="error"
                      disabled={user.role !== 'ADMIN'}
                    >
                      {user.role !== 'ADMIN' ? '权限不足' : '系统监控'}
                    </Button>
                  </Card>
                </Grid>
              </Grid>

              {/* 快速操作区 */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'success.main' }}>
                🚀 快速操作
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Storefront />}
                  onClick={handleCatalogOpen}
                  color="success"
                >
                  打开商品目录
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Inventory />}
                  onClick={() => setCurrentView('inventory')}
                  color="primary"
                >
                  快速库存查看
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  color="info"
                >
                  生成报表
                </Button>
                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    color="warning"
                  >
                    系统配置
                  </Button>
                )}
              </Box>
            </Card>
          ) : (
            /* 库存表格视图 */
            <Card elevation={8} sx={{ borderRadius: 3, p: 3, bgcolor: 'white' }}>
              <InventoryTable />
            </Card>
          )}
        </Container>
      </Box>
    );
  }

  // 未登录用户显示的主页 - 所有功能入口
  return (
    <Box className="full-height gradient-bg-blue">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* 头部 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar
            sx={{
              mx: 'auto',
              mb: 3,
              bgcolor: 'white',
              color: 'primary.main',
              width: 80,
              height: 80,
            }}
          >
            <Inventory fontSize="large" />
          </Avatar>
          <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            库存管理系统
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', opacity: 0.9, mb: 4 }}>
            现代化的库存管理解决方案
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
            高效管理您的库存、商品、供应商和用户。提供完整的权限控制和数据分析功能。
          </Typography>
        </Box>

        {/* 主要功能入口 */}
        <Typography variant="h5" sx={{ color: 'white', textAlign: 'center', mb: 3 }}>
          🎯 主要功能
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={handleTestMode}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Inventory sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  库存管理
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  查看和管理商品库存
                </Typography>
                <Button variant="contained" size="small" fullWidth>
                  立即体验
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={handleCatalogOpen}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Storefront sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  商品目录
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  外部客户查看商品
                </Typography>
                <Button variant="contained" size="small" fullWidth color="success">
                  查看目录
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Analytics sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  数据统计
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  库存分析和报表
                </Typography>
                <Button variant="contained" size="small" fullWidth color="info">
                  查看统计
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Settings sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  系统管理
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  用户和系统设置
                </Typography>
                <Chip 
                  label="需要登录" 
                  size="small" 
                  color="warning" 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 用户操作区 */}
        <Card elevation={8} sx={{ borderRadius: 3, p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            🔐 用户中心
          </Typography>
          
          <Grid container spacing={3}>
            {/* 登录区域 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                  <Login />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  用户登录
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  登录系统使用完整功能
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Login />}
                  onClick={() => router.push('/login')}
                  sx={{ mb: 1 }}
                >
                  立即登录
                </Button>
                <Typography variant="caption" color="text.secondary">
                  管理员: admin / admin<br/>
                  经理: manager / manager<br/>
                  用户: user1 / user1
                </Typography>
              </Box>
            </Grid>

            {/* 注册区域 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'secondary.main' }}>
                  <PersonAdd />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  用户注册
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  创建新的用户账户
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<PersonAdd />}
                  onClick={() => router.push('/register')}
                  sx={{ mb: 1 }}
                >
                  注册账户
                </Button>
                <Typography variant="caption" color="text.secondary">
                  免费注册，快速开始
                </Typography>
              </Box>
            </Grid>

            {/* 测试模式区域 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main' }}>
                  <Science />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  测试模式
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  无需登录即可体验功能
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Science />}
                  onClick={handleTestMode}
                  color="warning"
                  sx={{ mb: 1 }}
                >
                  开始测试
                </Button>
                <Typography variant="caption" color="text.secondary">
                  普通用户权限，仅可查看
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* 快速链接 */}
        <Card elevation={4} sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
            🔗 快速链接
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Storefront />}
              onClick={handleCatalogOpen}
              color="success"
            >
              商品目录
            </Button>
            <Button
              variant="outlined"
              startIcon={<Science />}
              onClick={handleTestMode}
              color="warning"
            >
              测试体验
            </Button>
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={() => router.push('/login')}
              color="primary"
            >
              快速登录
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => router.push('/register')}
              color="secondary"
            >
              注册账户
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
} 