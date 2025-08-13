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
import { Package, Building2, UserPlus, CheckCircle } from "lucide-react";
import shipperBg from "@/assets/shipper-auth-bg.jpg";


const ShipperRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  // Shipper profile details
  const [gstin, setGstin] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role: "shipper",
          company: company,
          business_name: company,
          gstin,
          business_model: businessModel,
          specialties,
          contact_email: contactEmail || email,
          contact_phone: contactPhone,
          address,
          website,
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      toast({ title: "Error", description: signUpError.message });
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setLoading(false);
      toast({ title: "Registration pending", description: "Please verify your email to continue." });
      return;
    }

    // Create/update profile row
      const payload = {
        user_id: userId,
        role: "shipper",
        business_name: company,
        gstin,
        business_model: businessModel,
        specialties,
        contact_email: contactEmail || email,
        contact_phone: contactPhone,
        address,
        website,
        auth_email: email,
      } as any;

    const { error: upsertError } = await (supabase as any)
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertError) {
      // Continue but warn user
      toast({ title: "Profile save warning", description: upsertError.message });
    }


    setLoading(false);
    toast({ title: "Registration complete", description: "Welcome aboard!" });
    navigate("/dashboard");
  };

  return (
    <>
      <Helmet>
        <title>Register Shipper | UrbanLift.AI</title>
        <meta name="description" content="Register your business for AI-powered logistics optimization in Delhi." />
        <link rel="canonical" href="/auth/shipper/register" />
      </Helmet>
      <Navbar />
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <img src={shipperBg} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-delhi-primary/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-delhi-orange/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-delhi-navy">Delhi Government Logistics Platform</h1>
                <p className="text-delhi-navy/70 text-lg font-medium">Join as Professional Shipper</p>
              </div>
              <h2 className="text-3xl font-bold text-delhi-navy mb-4">Register Your Business</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join Delhi's premier industrial logistics platform. Get access to AI-powered shipment optimization.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Registration Form */}
              <div className="animate-slide-up">
                <Card className="shadow-[var(--shadow-delhi)] border-delhi-primary/20 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center bg-muted/20 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-delhi-navy flex items-center justify-center gap-3">
                      <UserPlus className="w-8 h-8 text-delhi-primary" />
                      Business Registration
                    </CardTitle>
                    <p className="text-delhi-navy/70 text-sm">Create your professional shipper account</p>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-delhi-navy font-medium">Business Name</Label>
                        <Input 
                          id="company" 
                          required 
                          value={company} 
                          onChange={(e) => setCompany(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="Your Business Ltd."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-delhi-navy font-medium">Full Name</Label>
                        <Input 
                          id="name" 
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="Your Full Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-delhi-navy font-medium">Login Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="you@company.com"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gstin" className="text-delhi-navy font-medium">GSTIN</Label>
                          <Input 
                            id="gstin" 
                            required 
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value)}
                            className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                            placeholder="12ABCDE3456F7Z8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessModel" className="text-delhi-navy font-medium">Business Model</Label>
                          <Input 
                            id="businessModel" 
                            required 
                            value={businessModel}
                            onChange={(e) => setBusinessModel(e.target.value)}
                            className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                            placeholder="B2B, D2C, Marketplace..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialties" className="text-delhi-navy font-medium">Specialties (comma separated)</Label>
                        <Input 
                          id="specialties" 
                          value={specialties}
                          onChange={(e) => setSpecialties(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="FMCG, Electronics"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail" className="text-delhi-navy font-medium">Contact Email</Label>
                          <Input 
                            id="contactEmail" 
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                            placeholder="ops@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone" className="text-delhi-navy font-medium">Contact Phone</Label>
                          <Input 
                            id="contactPhone" 
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-delhi-navy font-medium">Address</Label>
                        <Input 
                          id="address" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="Industrial Area, Delhi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-delhi-navy font-medium">Website</Label>
                        <Input 
                          id="website" 
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="https://"
                        />
                      </div>


                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-delhi-navy font-medium">Secure Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-delhi-primary/20 focus:border-delhi-primary focus:ring-delhi-primary/20 h-12"
                          placeholder="Create a strong password"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold" 
                        disabled={loading} 
                        variant="delhi-shipper"
                        size="lg"
                      >
                        {loading ? "Creating Account..." : "Register Business Account"}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 bg-muted/20 rounded-b-lg">
                    <div className="text-sm text-delhi-navy/70 text-center">
                      Already registered? 
                      <Link to="/auth/shipper/login" className="ml-2 font-semibold text-delhi-primary hover:text-delhi-orange transition-colors underline">
                        Login Here
                      </Link>
                    </div>
                    <div className="text-xs text-delhi-navy/50 text-center">
                      By registering, you agree to the platform terms
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Benefits Section */}
              <div className="space-y-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-delhi-navy flex items-center gap-3">
                    <Package className="w-8 h-8 text-delhi-primary" />
                    Professional Benefits
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">DSIIDC Integration</h4>
                        <p className="text-sm text-muted-foreground">Direct access to Delhi State Industrial infrastructure</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">AI-Powered Optimization</h4>
                        <p className="text-sm text-muted-foreground">Reduce costs by up to 40% with smart shipment pooling</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Government Support</h4>
                        <p className="text-sm text-muted-foreground">Backed by Department of Industries GNCTD</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-delhi-primary/10">
                      <CheckCircle className="w-6 h-6 text-delhi-success mt-1" />
                      <div>
                        <h4 className="font-semibold text-delhi-navy">Real-Time Analytics</h4>
                        <p className="text-sm text-muted-foreground">Professional dashboard with detailed insights</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/10 rounded-xl border border-delhi-primary/20">
                  <h4 className="font-bold text-delhi-navy mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Government Innovation Program
                  </h4>
                  <p className="text-sm text-delhi-navy/80">
                    Developed with support from Department of Industries GNCTD & DSIIDC in partnership with NSUT.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ShipperRegister;