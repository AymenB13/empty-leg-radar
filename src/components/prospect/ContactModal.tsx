import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpsertOperatorContact } from "@/hooks/supabase/useOperatorContacts";
import { OperatorContact } from "@/types/database";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  operator_name: z.string().min(1, "Operator name is required"),
  email_sales: z.string().email("Invalid email").optional().or(z.literal("")),
  phone_sales: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  source: z.string().optional(),
  notes: z.string().optional(),
});

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: OperatorContact | null;
  prefillOperatorName?: string;
}

export function ContactModal({ open, onOpenChange, contact, prefillOperatorName }: ContactModalProps) {
  const upsertMutation = useUpsertOperatorContact();

  const [formData, setFormData] = useState<Partial<OperatorContact>>({
    operator_name: "",
    email_sales: "",
    phone_sales: "",
    website: "",
    source: "manual",
    notes: "",
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else if (prefillOperatorName) {
      setFormData(prev => ({ ...prev, operator_name: prefillOperatorName }));
    }
  }, [contact, prefillOperatorName, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      contactSchema.parse(formData);
      
      await upsertMutation.mutateAsync({
        ...formData,
        last_verified_at: new Date().toISOString(),
      } as OperatorContact);

      toast.success("Contact saved successfully");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to save contact");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Operator Name *</Label>
            <Input
              value={formData.operator_name}
              onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
              placeholder="NetJets Aviation, Inc."
              disabled={!!contact}
            />
          </div>

          <div className="space-y-2">
            <Label>Email (Sales)</Label>
            <Input
              type="email"
              value={formData.email_sales || ""}
              onChange={(e) => setFormData({ ...formData, email_sales: e.target.value })}
              placeholder="sales@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone (Sales)</Label>
            <Input
              type="tel"
              value={formData.phone_sales || ""}
              onChange={(e) => setFormData({ ...formData, phone_sales: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select 
              value={formData.source || "manual"} 
              onValueChange={(v) => setFormData({ ...formData, source: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="site">Website</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="faa">FAA</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
