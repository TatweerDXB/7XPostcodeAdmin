"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
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
import Snackbar from "@mui/material/Snackbar";
import UaeMapGraphic from "@/components/UaeMapGraphic";
import { useAuth } from "@/context/AuthContext";
import { sanitizeErrorMessage, sanitizeInputText } from "@/utils/security";

/* Custom Feature Icons matching Figma vectors */
function LocationFeatureIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.75" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.8" />
    </svg>
  );
}

function LayersFeatureIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldFeatureIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Eye slash / eye toggle icon matching Figma Vuesax Linear */
function EyeSlashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.53 9.47L9.47 14.53C8.82 13.88 8.42 12.99 8.42 12C8.42 10.02 10.02 8.42 12 8.42C12.99 8.42 13.88 8.82 14.53 9.47Z"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.82 5.77C16.07 4.45 14.07 3.73 12 3.73C7 3.73 2.73 7.11 1 12C1.72 14.05 2.97 15.82 4.6 17.15"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.42 19.53C9.56 19.98 10.76 20.27 12 20.27C17 20.27 21.27 16.89 23 12C22.19 9.68 20.73 7.7 18.82 6.32"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.51 12.7C15.42 14.37 14.07 15.72 12.4 15.81"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.47 14.53L2 22"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L14.53 9.47"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z"
        stroke="#ADADAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sessionNotice, clearSessionNotice } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarDismissed, setSnackbarDismissed] = useState(false);

  const isInactivityTimeout = searchParams.get("reason") === "inactivity";
  const showSessionSnackbar = Boolean((sessionNotice || isInactivityTimeout) && !snackbarDismissed);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbarDismissed(true);
    clearSessionNotice();
    const cleanUsername = sanitizeInputText(username, 100);
    if (!cleanUsername || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        username: cleanUsername,
        password,
        rememberMe,
      });

      const redirectTo = searchParams.get("from") || "/portal";
      router.push(redirectTo);
    } catch (err: unknown) {
      setErrorMessage(
        sanitizeErrorMessage(err, "Login failed. Please verify your credentials and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      {/* LEFT CONTAINER: Visual Branding + Emirates Post Logo + UAE Map */}
      <Box
        sx={{
          flex: { xs: "0 0 auto", md: "0 0 57.36%" },
          width: { xs: "100%", md: "57.36%" },
          height: { md: "100vh" },
          minHeight: "100vh",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          backgroundImage:
            "linear-gradient(160deg, rgba(37, 60, 131, 0.704) 8.49%, rgba(10, 25, 60, 0.56) 50%, rgba(34, 49, 87, 0.44) 91.51%), url('/loginbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: { md: "40px", lg: "40px 48px", xl: "40px 56px" },
          color: "#FFFFFF",
          boxSizing: "border-box",
        }}
      >
        {/* Top Logo: Emirates Post Group */}
        <Box
          sx={{
            width: 158,
            height: 64,
            display: "flex",
            alignItems: "center",
            mb: { md: "24px", lg: "36px", xl: "52px" },
            zIndex: 3,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/epg-logo.png"
            alt="Emirates Post Group"
            width={158}
            height={64}
            style={{
              width: "158px",
              height: "64px",
              objectFit: "contain",
            }}
            priority
          />
        </Box>

        {/* UAE Interactive / Graphic Map */}
        <UaeMapGraphic />

        {/* Main Brand Headings & Subtitle */}
        <Box sx={{ maxWidth: 448, mb: { md: "24px", lg: "32px", xl: "44px" }, zIndex: 3, position: "relative", flexShrink: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: { md: "30px", lg: "34px", xl: "36px" },
              lineHeight: { md: "38px", lg: "44px", xl: "46px" },
              color: "#FFFFFF",
              mb: "16px",
              maxWidth: 340,
            }}
          >
            UAE Postcode
            <br />
            Digital Addressing
            <br />
            System
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: { md: "15px", lg: "17px", xl: "18px" },
              lineHeight: { md: "28px", lg: "32px", xl: "34px" },
              color: "#C8C8C8",
              maxWidth: 384,
            }}
          >
            A unified platform to explore, manage and access postcode, buildings, units and
            addresses across the UAE.
          </Typography>
        </Box>

        {/* 3 Core Highlights / Features */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { md: "14px", lg: "18px", xl: "24px" },
            zIndex: 3,
            position: "relative",
            flexShrink: 0,
          }}
        >
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
              <LocationFeatureIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
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
              <LayersFeatureIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
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
              <ShieldFeatureIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
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

      {/* RIGHT CONTAINER: Login Card + Skyline Silhouette Background */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "0 0 42.64%" },
          width: { xs: "100%", md: "42.64%" },
          height: { md: "100vh" },
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: "40px 20px", sm: "48px 24px" },
          backgroundColor: "#F0F6FC",
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          boxSizing: "border-box",
        }}
      >
        {/* Bottom Skyline Image Silhouette */}
        <Box
          component="img"
          src="/images/uae-skyline.png"
          alt="UAE Skyline Silhouette"
          sx={{
            position: "absolute",
            bottom: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 613,
            height: "auto",
            maxHeight: 178,
            objectFit: "contain",
            objectPosition: "bottom center",
            pointerEvents: "none",
            zIndex: 1,
            userSelect: "none",
          }}
        />

        {/* Login Card */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "448px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: { xs: "32px 24px", sm: "40px" },
            boxShadow: "0px 4px 32px rgba(0, 0, 0, 0.09)",
            boxSizing: "border-box",
          }}
        >
          {/* Mobile-only logo display */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: "8px 16px",
                borderRadius: "8px",
                bgcolor: "#0b1d3a",
                display: "inline-flex",
              }}
            >
              <Image
                src="/images/epg-logo.png"
                alt="Emirates Post Group"
                width={130}
                height={52}
                style={{ width: "130px", height: "auto", objectFit: "contain" }}
              />
            </Box>
          </Box>

          {/* Heading: Welcome Back */}
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

          {/* Subtitle */}
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

          {/* Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Username Input */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                component="label"
                htmlFor="username-input"
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
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

            {/* Password Input */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                component="label"
                htmlFor="password-input"
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
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
                placeholder="Enter your password"
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
                          {showPassword ? <EyeOpenIcon /> : <EyeSlashIcon />}
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

            {/* Remember Me Checkbox */}
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

            {/* Log in Button */}
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

      {/* Session Inactivity Snackbar Notification */}
      <Snackbar
        open={showSessionSnackbar}
        autoHideDuration={8000}
        onClose={() => {
          setSnackbarDismissed(true);
          clearSessionNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => {
            setSnackbarDismissed(true);
            clearSessionNotice();
          }}
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "8px",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "13px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
        >
          {sessionNotice || "Your session expired after 15 minutes of inactivity. Please log in again."}
        </Alert>
      </Snackbar>
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
