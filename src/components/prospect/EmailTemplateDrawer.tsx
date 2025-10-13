import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface EmailTemplateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: string;
}

export function EmailTemplateDrawer({ open, onOpenChange, template }: EmailTemplateDrawerProps) {
  const [emailContent, setEmailContent] = useState(template);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent);
    toast.success("Email copied to clipboard");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>Generate Outreach Email</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handleCopy} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
