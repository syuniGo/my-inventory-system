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
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 验证表单
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    const success = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
    });

    if (success) {
      router.push('/');
    }
  };

  const isFormValid = () => {
    return (
      formData.username.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 6 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const isEmailValid = formData.email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password === '' || formData.password.length >= 6;
  const isPasswordMatch = formData.confirmPassword === '' || formData.password === formData.confirmPassword;

  return (
    <Box className="full-height gradient-bg-green center-content">
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* 头部 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'success.main',
                  width: 56,
                  height: 56,
                }}
              >
                <PersonAdd fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                创建新账户
              </Typography>
              <Typography variant="body2" color="text.secondary">
                加入库存管理系统
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
                name="username"
                variant="outlined"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
                sx={{ mb: 2 }}
                placeholder="请输入用户名"
              />

              <TextField
                fullWidth
                label="邮箱地址"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                error={!isEmailValid}
                helperText={!isEmailValid ? '请输入有效的邮箱地址' : ''}
                sx={{ mb: 2 }}
                placeholder="请输入邮箱地址"
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="名字"
                    name="firstName"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="名字"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="姓氏"
                    name="lastName"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="姓氏"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="密码"
                name="password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                error={!isPasswordValid}
                helperText={!isPasswordValid ? '密码至少需要6位字符' : ''}
                sx={{ mb: 2 }}
                placeholder="请输入密码（至少6位）"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="确认密码"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                error={!isPasswordMatch}
                helperText={!isPasswordMatch ? '两次输入的密码不一致' : ''}
                sx={{ mb: 3 }}
                placeholder="请再次输入密码"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                disabled={loading || !isFormValid()}
                sx={{ mb: 2, py: 1.5, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    注册中...
                  </Box>
                ) : (
                  '创建账户'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  已有账户？{' '}
                  <Link href="/login" style={{ color: '#4caf50', textDecoration: 'none' }}>
                    立即登录
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 