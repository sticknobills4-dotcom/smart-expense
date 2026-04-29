"use client"

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Wallet, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({ title: "Auth Error", description: "Failed to sign in with Google." });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Auth Error", 
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F3F5] p-4 font-body">
      <div className="absolute top-10 left-10 flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
          <Wallet className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-primary tracking-tight">SmartExpense</span>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="text-center pt-10 pb-6 bg-white">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isRegistering ? "Join SmartExpense" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-base">
            {isRegistering ? "Start tracking your financial growth today." : "Log in to manage your money smartly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pt-4 pb-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input name="name" placeholder="Full Name" className="pl-10 h-12 bg-secondary/30 border-none rounded-xl" required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input name="email" type="email" placeholder="Email Address" className="pl-10 h-12 bg-secondary/30 border-none rounded-xl" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input name="password" type="password" placeholder="Password" className="pl-10 h-12 bg-secondary/30 border-none rounded-xl" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Please wait..." : (isRegistering ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <span className="absolute bg-white px-4 text-xs text-muted-foreground uppercase tracking-widest font-bold">Or continue with</span>
            <div className="w-full h-px bg-secondary"></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 border-2 rounded-xl font-bold flex gap-2 hover:bg-secondary/30 transition-colors"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-8 pt-0 bg-white">
          <p className="text-sm text-muted-foreground">
            {isRegistering ? "Already have an account?" : "New to SmartExpense?"}{" "}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-bold hover:underline"
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}