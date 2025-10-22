'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { generateTrackingCode, calculatePrice } from '@/utils/tracking';
import { notifyShipmentCreated } from '@/utils/createNotification';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreateShipmentPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Sender
    sender_name: profile?.full_name || '',
    sender_phone: profile?.phone || '',
    sender_email: profile?.email || '',
    sender_line1: '',
    sender_line2: '',
    sender_city: '',
    sender_state: '',
    sender_postal_code: '',
    sender_country: 'US',
    
    // Recipient
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    recipient_line1: '',
    recipient_line2: '',
    recipient_city: '',
    recipient_state: '',
    recipient_postal_code: '',
    recipient_country: 'US',
    
    // Package details
    weight_kg: '',
    length: '',
    width: '',
    height: '',
    service_type: 'standard',
    special_instructions: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trackingCode = generateTrackingCode();
      
      // Calculate estimated price
      const distanceKm = 100; // Placeholder - would use geocoding API
      const price = calculatePrice(
        parseFloat(formData.weight_kg) || 1,
        distanceKm,
        formData.service_type
      );

      // Calculate ETA (placeholder logic)
      const estimatedDelivery = new Date();
      if (formData.service_type === 'same_day') {
        estimatedDelivery.setHours(estimatedDelivery.getHours() + 8);
      } else if (formData.service_type === 'next_day') {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
      } else {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
      }

      const shipmentData = {
        tracking_code: trackingCode,
        customer_id: profile.id,
        
        sender_name: formData.sender_name,
        sender_phone: formData.sender_phone,
        sender_email: formData.sender_email,
        sender_address: {
          line1: formData.sender_line1,
          line2: formData.sender_line2,
          city: formData.sender_city,
          state: formData.sender_state,
          postal_code: formData.sender_postal_code,
          country: formData.sender_country,
        },
        
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        recipient_email: formData.recipient_email,
        recipient_address: {
          line1: formData.recipient_line1,
          line2: formData.recipient_line2,
          city: formData.recipient_city,
          state: formData.recipient_state,
          postal_code: formData.recipient_postal_code,
          country: formData.recipient_country,
        },
        
        weight_kg: parseFloat(formData.weight_kg) || 0,
        dimensions: {
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          unit: 'cm',
        },
        service_type: formData.service_type,
        special_instructions: formData.special_instructions,
        
        price_quoted: price,
        estimated_delivery: estimatedDelivery.toISOString(),
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select()
        .single();

      if (error) throw error;

      // Create initial tracking event
      await supabase.from('tracking_events').insert([
        {
          shipment_id: data.id,
          event_type: 'created',
          description: 'Shipment created and awaiting pickup',
        },
      ]);

      // Create notification for customer
      await notifyShipmentCreated(profile.id, trackingCode, formData.recipientName);

      toast.success('Shipment created successfully!', {
        description: `Tracking code: ${trackingCode}`,
      });

      router.push(`/track?code=${trackingCode}`);
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="text-slate-400 mb-6" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Create Shipment</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fill in the details to create a new shipment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sender Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Sender Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender_name" className="text-slate-200">Full Name</Label>
                      <Input
                        id="sender_name"
                        name="sender_name"
                        value={formData.sender_name}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_phone" className="text-slate-200">Phone</Label>
                      <Input
                        id="sender_phone"
                        name="sender_phone"
                        type="tel"
                        value={formData.sender_phone}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sender_email" className="text-slate-200">Email</Label>
                      <Input
                        id="sender_email"
                        name="sender_email"
                        type="email"
                        value={formData.sender_email}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sender_line1" className="text-slate-200">Address Line 1</Label>
                      <Input
                        id="sender_line1"
                        name="sender_line1"
                        value={formData.sender_line1}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sender_line2" className="text-slate-200">Address Line 2</Label>
                      <Input
                        id="sender_line2"
                        name="sender_line2"
                        value={formData.sender_line2}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_city" className="text-slate-200">City</Label>
                      <Input
                        id="sender_city"
                        name="sender_city"
                        value={formData.sender_city}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_state" className="text-slate-200">State/Province</Label>
                      <Input
                        id="sender_state"
                        name="sender_state"
                        value={formData.sender_state}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_postal_code" className="text-slate-200">Postal Code</Label>
                      <Input
                        id="sender_postal_code"
                        name="sender_postal_code"
                        value={formData.sender_postal_code}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sender_country" className="text-slate-200">Country</Label>
                      <Input
                        id="sender_country"
                        name="sender_country"
                        value={formData.sender_country}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Recipient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient_name" className="text-slate-200">Full Name</Label>
                      <Input
                        id="recipient_name"
                        name="recipient_name"
                        value={formData.recipient_name}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_phone" className="text-slate-200">Phone</Label>
                      <Input
                        id="recipient_phone"
                        name="recipient_phone"
                        type="tel"
                        value={formData.recipient_phone}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recipient_email" className="text-slate-200">Email</Label>
                      <Input
                        id="recipient_email"
                        name="recipient_email"
                        type="email"
                        value={formData.recipient_email}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recipient_line1" className="text-slate-200">Address Line 1</Label>
                      <Input
                        id="recipient_line1"
                        name="recipient_line1"
                        value={formData.recipient_line1}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recipient_line2" className="text-slate-200">Address Line 2</Label>
                      <Input
                        id="recipient_line2"
                        name="recipient_line2"
                        value={formData.recipient_line2}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_city" className="text-slate-200">City</Label>
                      <Input
                        id="recipient_city"
                        name="recipient_city"
                        value={formData.recipient_city}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_state" className="text-slate-200">State/Province</Label>
                      <Input
                        id="recipient_state"
                        name="recipient_state"
                        value={formData.recipient_state}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_postal_code" className="text-slate-200">Postal Code</Label>
                      <Input
                        id="recipient_postal_code"
                        name="recipient_postal_code"
                        value={formData.recipient_postal_code}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_country" className="text-slate-200">Country</Label>
                      <Input
                        id="recipient_country"
                        name="recipient_country"
                        value={formData.recipient_country}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Package Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight_kg" className="text-slate-200">Weight (kg)</Label>
                      <Input
                        id="weight_kg"
                        name="weight_kg"
                        type="number"
                        step="0.1"
                        value={formData.weight_kg}
                        onChange={handleChange}
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service_type" className="text-slate-200">Service Type</Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="same_day" className="text-white">Same Day</SelectItem>
                          <SelectItem value="next_day" className="text-white">Next Day</SelectItem>
                          <SelectItem value="standard" className="text-white">Standard (2-5 days)</SelectItem>
                          <SelectItem value="express" className="text-white">Express</SelectItem>
                          <SelectItem value="freight" className="text-white">Freight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-slate-200">Length (cm)</Label>
                      <Input
                        id="length"
                        name="length"
                        type="number"
                        step="0.1"
                        value={formData.length}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-slate-200">Width (cm)</Label>
                      <Input
                        id="width"
                        name="width"
                        type="number"
                        step="0.1"
                        value={formData.width}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-slate-200">Height (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="special_instructions" className="text-slate-200">
                        Special Instructions (Optional)
                      </Label>
                      <Input
                        id="special_instructions"
                        name="special_instructions"
                        value={formData.special_instructions}
                        onChange={handleChange}
                        className="bg-slate-900/50 border-slate-600 text-white"
                        placeholder="Handle with care, fragile, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-200"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Shipment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

