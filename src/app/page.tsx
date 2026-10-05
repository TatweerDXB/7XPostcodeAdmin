"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import SevenXLogo from "@/components/SevenXLogo";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        username: username.trim(),
        password,
        rememberMe,
      });

      const redirectTo = searchParams.get("from") || "/portal";
      router.push(redirectTo);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Login failed. Please verify your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#F0F6FC",
        overflowX: "hidden",
      }}
    >
      {/* ============================================================== */}
      {/* Left Section: 826px (57%) Container with Gradient Overlay       */}
      {/* Figma Typography: Space Grotesk H1 & Cairo Subtitles & Features*/}
      {/* ============================================================== */}
      <Box
        sx={{
          flex: { xs: "0 0 0%", md: "0 0 57.36%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          backgroundImage:
            "linear-gradient(160deg, rgba(10, 20, 50, 0.704) 8.49%, rgba(10, 25, 60, 0.56) 50%, rgba(10, 20, 45, 0.44) 91.51%), url('/loginbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: { md: "40px", lg: "40px 56px" },
          color: "#FFFFFF",
          boxSizing: "border-box",
        }}
      >
        {/* Top: 7X Logo (Figma: 110px x 64px) */}
        <Box sx={{ width: 110, height: 64, display: "flex", alignItems: "center" }}>
          <SevenXLogo height={48} width={110} color="#FFFFFF" />
        </Box>

        {/* Middle: Heading & Description */}
        <Box sx={{ my: "auto", py: 4, maxWidth: 448 }}>
          {/* Heading 1 (Figma: Space Grotesk 700, 36px/46px) */}
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "36px",
              lineHeight: "46px",
              color: "#FFFFFF",
              mb: "20px",
            }}
          >
            UAE Postcode
            <br />
            Digital Addressing
            <br />
            System
          </Typography>

          {/* Subtitle (Figma: Cairo 400, 18px/34px, #C8C8C8) */}
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "34px",
              color: "#C8C8C8",
              mb: "48px",
              maxWidth: 384,
            }}
          >
            A unified platform to explore, manage and access postcode, buildings, units and
            addresses across the UAE.
          </Typography>

          {/* Feature Items List (Figma gap: 24px) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Feature 1 */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PlaceOutlined sx={{ fontSize: 22, color: "rgba(255, 255, 255, 0.85)" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: "34px",
                    color: "#FFFFFF",
                  }}
                >
                  Accurate Location Data
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "30px",
                    color: "#C8C8C8",
                  }}
                >
                  Postcodes, buildings, units and more.
                </Typography>
              </Box>
            </Box>

            {/* Feature 2 */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LayersOutlined sx={{ fontSize: 22, color: "rgba(255, 255, 255, 0.85)" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: "34px",
                    color: "#FFFFFF",
                  }}
                >
                  Secure Access
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "30px",
                    color: "#C8C8C8",
                  }}
                >
                  Role-based access to MVP modules.
                </Typography>
              </Box>
            </Box>

            {/* Feature 3 */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldOutlined sx={{ fontSize: 22, color: "rgba(255, 255, 255, 0.85)" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: "34px",
                    color: "#FFFFFF",
                  }}
                >
                  Trusted & Centralized
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "30px",
                    color: "#C8C8C8",
                  }}
                >
                  Official UAE addressing data.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom spacer */}
        <Box sx={{ height: 40 }} />
      </Box>

      {/* ============================================================== */}
      {/* Right Section: Login Card Container (Figma: #F0F6FC)           */}
      {/* ============================================================== */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "0 0 42.64%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: "32px 20px", sm: "48px 24px" },
          backgroundColor: "#F0F6FC",
          boxSizing: "border-box",
        }}
      >
        {/* Figma Card (Width: 448px, Padding: 40px, Radius: 16px, Shadow: 0px 4px 32px rgba(0,0,0,0.09)) */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: "100%",
            maxWidth: "448px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: { xs: "32px 24px", sm: "40px" },
            boxShadow: "0px 4px 32px rgba(0, 0, 0, 0.09)",
            boxSizing: "border-box",
          }}
        >
          {/* Mobile view Logo */}
          <Box sx={{ display: { xs: "block", md: "none" }, textAlign: "center", mb: 3 }}>
            <SevenXLogo height={36} color="#0000FF" />
          </Box>

          {/* Heading 2 (Figma: Space Grotesk 700, 32px/41px, #101828) */}
          <Typography
            component="h2"
            align="center"
            sx={{
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: "41px",
              color: "#101828",
              textAlign: "center",
              mb: "8px",
            }}
          >
            Welcome Back
          </Typography>

          {/* Subtitle (Figma: Cairo 400, 14px/26px, #6A7282) */}
          <Typography
            align="center"
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "26px",
              color: "#6A7282",
              textAlign: "center",
              mb: errorMessage ? "16px" : "32px",
            }}
          >
            Log in to access the MVP Admin application.
          </Typography>

          {/* Error Message Alert */}
          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mb: "20px",
                borderRadius: "6px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Form Fields Stack (Figma gap: 20px) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Username InputPrimary */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                component="label"
                htmlFor="username-input"
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "30px",
                  color: "#000000",
                }}
              >
                Username
              </Typography>
              <TextField
                id="username-input"
                fullWidth
                placeholder="Enter user name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    borderRadius: "4px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                    "& fieldset": {
                      borderColor: "#DEDEDE",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ADADAD",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0000FF",
                      borderWidth: "1.5px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    height: "100%",
                    px: "16px",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "26px",
                    color: "#000000",
                    boxSizing: "border-box",
                    "&::placeholder": {
                      color: "#C8C8C8",
                      opacity: 1,
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "14px",
                      lineHeight: "26px",
                    },
                  },
                }}
              />
            </Box>

            {/* Password InputPrimary */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                component="label"
                htmlFor="password-input"
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "30px",
                  color: "#000000",
                }}
              >
                Password
              </Typography>
              <TextField
                id="password-input"
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "#ADADAD", mr: 0.5 }}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlined sx={{ fontSize: 22, color: "#ADADAD" }} />
                          ) : (
                            <VisibilityOutlined sx={{ fontSize: 22, color: "#ADADAD" }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "52px",
                    borderRadius: "4px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                    "& fieldset": {
                      borderColor: "#DEDEDE",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "#ADADAD",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0000FF",
                      borderWidth: "1.5px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    height: "100%",
                    px: "16px",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "26px",
                    color: "#000000",
                    boxSizing: "border-box",
                    "&::placeholder": {
                      color: "#C8C8C8",
                      opacity: 1,
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "14px",
                      lineHeight: "26px",
                    },
                  },
                }}
              />
            </Box>

            {/* Remember Me Checkbox Container (Figma: height 26px, gap 10px) */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: "#2563EB",
                      p: 0,
                      mr: "10px",
                      "&.Mui-checked": {
                        color: "#2563EB",
                      },
                      "& .MuiSvgIcon-root": {
                        borderRadius: "4px",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "26px",
                      color: "#4A5565",
                    }}
                  >
                    Remember me
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            {/* PrimaryButton (Figma: background #0000FF, radius 6px, height 46px, padding 10px 20px) */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                height: "46px",
                backgroundColor: "#0000FF",
                "&:hover": {
                  backgroundColor: "#0000CC",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#93A4FF",
                  color: "#FFFFFF",
                },
                borderRadius: "6px",
                padding: "10px 20px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "26px",
                textTransform: "none",
                boxShadow: "none",
                color: "#FFFFFF",
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={22} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Log in"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#F0F6FC",
          }}
        >
          <CircularProgress sx={{ color: "#0000FF" }} />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
