import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const signUp = async (userData: any) => {
  try {
    const res = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) return { error: { message: data.message } };
    return { data, error: null };
  } catch (err) {
    return { error: { message: 'Network error' } };
  }
};

const verifyOTP = async (email: string, otp: string) => {
  try {
    const res = await fetch('http://localhost:5000/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) return { error: { message: data.message } };
    return { error: null };
  } catch (err) {
    return { error: { message: 'Network error' } };
  }
};

const resendOTP = async (email: string) => {
  try {
    const res = await fetch('http://localhost:5000/api/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { error: { message: data.message } };
    return { error: null };
  } catch (err) {
    return { error: { message: 'Network error' } };
  }
};

const Auth = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Philippine phone number validation
    // Formats: 09XX-XXX-XXXX, +639XX-XXX-XXXX, 639XX-XXX-XXXX
    const phoneRegex = /^(\+?63|0)?9\d{9}$/;
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Welcome back!");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

      if (!validatePhoneNumber(phone)) {
        toast.error('Please enter a valid Philippine phone number (e.g., 09XX-XXX-XXXX)');
        setIsLoading(false);
        return;
      }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      toast.error('Please enter a valid phone number (e.g., 09XX-XXX-XXXX)');
      setIsLoading(false);
      return;
    }

    // Clean phone number format
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    const userData = {
      name: fullName,
      email,
      password,
      phone: cleanPhone,
      address
    };

    const { data, error } = await signUp(userData);
    
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("OTP sent to your email! Please verify to complete registration.");
      setPendingEmail(email);
      setShowOTPDialog(true);
      setResendTimer(60);
      setIsLoading(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOTP(pendingEmail, otpCode);
    
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Email verified successfully! You can now sign in.");
      setShowOTPDialog(false);
      setPendingEmail('');
      setOtpCode('');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    const { error } = await resendOTP(pendingEmail);
    
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("New OTP sent to your email!");
      setResendTimer(60);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Remrose
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage your bookings and explore exclusive features
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join Remrose and start planning your events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        name="full_name"
                        type="text"
                        placeholder="Juan Dela Cruz"
                        required
                        autoComplete="name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send an OTP to verify your email
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number
                      </Label>
                      <Input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        placeholder="09XX-XXX-XXXX"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Philippine mobile number (e.g., 09171234567)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Complete Address
                      </Label>
                      <Textarea
                        id="signup-address"
                        name="address"
                        placeholder="House/Unit No., Street, Barangay, City, Province, ZIP Code"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        minLength={6}
                        required
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 6 characters
                      </p>
                    </div>

                    {/* NEW: Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        name="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        minLength={6}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* OTP Verification Dialog */}
      {showOTPDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Verify Your Email
              </CardTitle>
              <CardDescription>
                We've sent a 6-digit OTP to <strong>{pendingEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowOTPDialog(false);
                    setPendingEmail('');
                    setOtpCode('');
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-sm text-[#F97A00] hover:text-[#386641]"
                >
                  {resendTimer > 0 
                    ? `Resend OTP in ${resendTimer}s` 
                    : "Resend OTP"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Auth;