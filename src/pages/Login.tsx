
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, Mail, Info, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [isLinkExpiredDialogOpen, setIsLinkExpiredDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for link expired error in URL
  useState(() => {
    const params = new URLSearchParams(location.search);
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    
    if (errorCode === "otp_expired" || (errorDescription && errorDescription.includes("link+is+invalid+or+has+expired"))) {
      setIsLinkExpiredDialogOpen(true);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsEmailNotConfirmed(false);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setIsEmailNotConfirmed(true);
          throw new Error("Email not confirmed. Please check your inbox for the confirmation link or click 'Resend confirmation' below.");
        }
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "You are now logged in",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
      });
      setError(error.message || "Authentication failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to resend confirmation.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Confirmation email sent",
        description: "Please check your inbox for the confirmation link.",
      });
    } catch (error: any) {
      console.error("Resend confirmation error:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to resend confirmation",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Authentication failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isEmailNotConfirmed && (
            <Alert className="mb-4 bg-amber-50 border-amber-300">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Email not confirmed</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">Please check your inbox for the confirmation link.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1 text-amber-800 border-amber-400"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend confirmation email
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="hello@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <Alert className="mt-6 bg-blue-50 border-blue-100">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Developer Note</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              For testing purposes, you can disable email confirmation in the Supabase dashboard under Authentication &gt; Email Templates &gt; Disable "Confirm email".
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Expired Link Dialog */}
      <Dialog open={isLinkExpiredDialogOpen} onOpenChange={setIsLinkExpiredDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmation Link Expired
            </DialogTitle>
            <DialogDescription>
              The email confirmation link you clicked has expired or is invalid.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please enter your email address below to receive a new confirmation link.
            </p>
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email</Label>
              <Input 
                id="resend-email" 
                type="email" 
                placeholder="hello@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleResendConfirmation}
              disabled={isLoading || !email}
            >
              {isLoading ? "Sending..." : "Send New Confirmation Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
