import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Edit } from "lucide-react";
import { OperatorContact } from "@/types/database";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: OperatorContact | null;
  onEdit: () => void;
}

export function ContactDrawer({ open, onOpenChange, contact, onEdit }: ContactDrawerProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{contact.operator_name}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {contact.website && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Website</p>
              <Button variant="outline" size="sm" asChild>
                <a href={contact.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open website
                </a>
              </Button>
            </div>
          )}

          {contact.email_sales && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">{contact.email_sales}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.email_sales!, "Email")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {contact.phone_sales && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">{contact.phone_sales}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.phone_sales!, "Phone")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {contact.last_verified_at && (
            <div>
              <p className="text-sm text-muted-foreground">
                Last verified {formatDistanceToNow(new Date(contact.last_verified_at), { addSuffix: true })}
              </p>
            </div>
          )}

          {contact.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm bg-muted p-3 rounded">{contact.notes}</p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit contact
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
