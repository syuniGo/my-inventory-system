'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Avatar,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  // 如果已登录，重定向到主页（显示商品管理界面）
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!username.trim() || !password.trim()) {
      return;
    }

    const success = await login(username.trim(), password);
    if (success) {
      router.push('/'); // 跳转到主页显示商品管理界面
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className="full-height gradient-bg-blue center-content">
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* 头部 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                }}
              >
                <Inventory fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                库存管理系统
              </Typography>
              <Typography variant="body2" color="text.secondary">
                请登录您的账户
              </Typography>
            </Box>

            {/* 表单 */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="用户名"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                sx={{ mb: 2 }}
                placeholder="请输入用户名"
              />

              <TextField
                fullWidth
                label="密码"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                sx={{ mb: 3 }}
                placeholder="请输入密码"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !username.trim() || !password.trim()}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    登录中...
                  </Box>
                ) : (
                  '登录'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  还没有账户？{' '}
                  <Link href="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    立即注册
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 演示账户信息 */}
        <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            演示账户
          </Typography>
          <Box sx={{ fontSize: '0.875rem', color: 'primary.dark' }}>
            <Typography variant="body2" component="div">
              <strong>管理员:</strong> admin / admin
            </Typography>
            <Typography variant="body2" component="div">
              <strong>经理:</strong> manager / manager
            </Typography>
            <Typography variant="body2" component="div">
              <strong>用户:</strong> user1 / user1
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 