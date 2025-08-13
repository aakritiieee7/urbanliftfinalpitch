import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Shield, Route, Award, Clock } from "lucide-react";
import carrierBg from "@/assets/carrier-auth-bg.jpg";

import { signInWithIdentifier } from "@/lib/auth";

const CarrierLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithIdentifier(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message });
      return;
    }
    // Route based on whether a profile already exists
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      navigate("/auth/carrier/login");
      return;
    }
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();

    if (!profile) {
      toast({ title: "Complete your profile", description: "Finish setup to start using your dashboard." });
      navigate("/profile-setup?role=carrier");
      return;
    }
    toast({ title: "Welcome!", description: "Logged in successfully." });
    navigate(profile.role === "shipper" ? "/dashboard" : "/carrier-dashboard");
  };

  return (
    <>
      <Helmet>
        <title>Carrier Login | UrbanLift.AI</title>
        <meta name="description" content="Secure carrier portal for Delhi logistics. AI route optimization." />
        <link rel="canonical" href="/auth/carrier/login" />
      </Helmet>
      <Navbar />
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/3 h-full opacity-10">
            <img src={carrierBg} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-32 right-16 w-20 h-20 bg-delhi-orange/20 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-16 w-16 h-16 bg-delhi-navy/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-delhi-primary/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-delhi-navy">Delhi Government Logistics Platform</h1>
                  <p className="text-delhi-navy/70 text-lg font-medium">Department of Industries GNCTD × DSIIDC</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-delhi-navy mb-4">Carrier Portal</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional delivery management for Delhi's logistics partners. Optimize routes with intelligent AI algorithms.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Login Form */}
              <div className="animate-slide-up order-2 lg:order-1">
                <Card className="shadow-[var(--shadow-delhi)] border-delhi-orange/20 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center bg-muted/20 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-delhi-navy flex items-center justify-center gap-3">
                      <Truck className="w-8 h-8 text-delhi-orange" />
                      Carrier Access Portal
                    </CardTitle>
                    <p className="text-delhi-navy/70 text-sm">Enter your credentials to access the professional dashboard</p>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="identifier" className="text-delhi-navy font-medium">Email or Login ID</Label>
                        <Input 
                          id="identifier" 
                          type="text" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="your.email@logistics.com or username"
                        />
                        <p className="text-xs text-delhi-navy/60">Use your email or unique login ID (username).</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-delhi-navy font-medium">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-delhi-orange/20 focus:border-delhi-orange focus:ring-delhi-orange/20 h-12"
                          placeholder="Enter your secure password"
                        />
                        <p className="text-xs text-delhi-navy/60">Minimum 8 characters. Keep it secure.</p>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold" 
                        disabled={loading} 
                        variant="delhi-carrier"
                        size="lg"
                      >
                        {loading ? "Authenticating..." : "Access Carrier Dashboard"}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 bg-muted/20 rounded-b-lg">
                    <div className="text-sm text-delhi-navy/70 text-center">
                      New logistics partner? 
                      <Link to="/auth/carrier/register" className="ml-2 font-semibold text-delhi-orange hover:text-delhi-navy transition-colors underline">
                        Register Your Fleet
                      </Link>
                    </div>
                    <div className="text-xs text-delhi-navy/50 text-center">
                      DSIIDC Certified Platform
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Features Section */}
              <div className="space-y-8 animate-slide-up order-1 lg:order-2" style={{animationDelay: '0.2s'}}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-delhi-navy flex items-center gap-3">
                    <Truck className="w-8 h-8 text-delhi-orange" />
                    Enterprise Carrier Features
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10 hover:border-delhi-orange/20 transition-all duration-300 hover:shadow-lg">
                      <Route className="w-6 h-6 text-delhi-orange mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Smart Route Optimization</h4>
                        <p className="text-sm text-muted-foreground">AI-powered routing through Delhi's industrial zones and highways</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10 hover:border-delhi-orange/20 transition-all duration-300 hover:shadow-lg">
                      <Clock className="w-6 h-6 text-delhi-navy mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Real-Time Tracking</h4>
                        <p className="text-sm text-muted-foreground">Live shipment monitoring with DSIIDC integration</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10 hover:border-delhi-orange/20 transition-all duration-300 hover:shadow-lg">
                      <Shield className="w-6 h-6 text-delhi-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Government Compliance</h4>
                        <p className="text-sm text-muted-foreground">Full compliance with NCT Delhi industrial regulations</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-orange/10 hover:border-delhi-orange/20 transition-all duration-300 hover:shadow-lg">
                      <Award className="w-6 h-6 text-delhi-gold mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Innovation Rewards</h4>
                        <p className="text-sm text-muted-foreground">Earn points and recognition for innovation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CarrierLogin;