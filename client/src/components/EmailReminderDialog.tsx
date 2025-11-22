import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Tenant, Unit } from '@/types/rental';

interface EmailReminderDialogProps {
  tenant: Tenant;
  unit: Unit;
}

export const EmailReminderDialog = ({ tenant, unit }: EmailReminderDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const defaultSubject = `Rent Payment Reminder - Unit ${unit.unitNumber}`;
  const defaultMessage = `Dear ${tenant.name},

This is a friendly reminder that your rent payment of $${unit.rentAmount.toFixed(2)} for Unit ${unit.unitNumber} is due on day ${tenant.rentDueDate} of this month.

Please ensure your payment is submitted on time to avoid any late fees.

Payment Details:
- Unit: ${unit.unitNumber} (${unit.type})
- Amount Due: $${unit.rentAmount.toFixed(2)}
- Due Date: Day ${tenant.rentDueDate}

If you have already made the payment, please disregard this message.

Thank you for your prompt attention to this matter.

Best regards,
Property Management`;

  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);

  const handleSendReminder = () => {
    // Mock email sending - in a real app, this would call an API
    toast.success(`Email reminder preview shown for ${tenant.email}`, {
      description: 'To enable real email sending, connect to an email service like Resend.',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-3 w-3 mr-1" />
          Send Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Reminder Preview</DialogTitle>
          <DialogDescription>
            Review and customize the email reminder for {tenant.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To:</Label>
            <div className="p-2 bg-muted rounded-md text-sm">{tenant.email}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject:</Label>
            <Textarea
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              rows={1}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message:</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
            <p className="font-semibold mb-1">💡 Note:</p>
            <p>This is a preview of the email that would be sent. To enable actual email sending, you would need to integrate an email service like Resend or SendGrid with backend support.</p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
