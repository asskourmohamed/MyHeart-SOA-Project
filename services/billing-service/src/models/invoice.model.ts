import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  code?: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'other';
  paymentDate?: Date;
  paymentReference?: string;
  insuranceClaim?: {
    provider: string;
    claimNumber: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    approvedAmount?: number;
  };
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  code: { type: String }
});

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  patientId: { 
    type: String, 
    required: true,
    index: true 
  },
  patientName: { type: String, required: true },
  appointmentId: { 
    type: String,
    index: true 
  },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0, default: 0 },
  taxRate: { type: Number, required: true, min: 0, default: 0 },
  discount: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0, default: 0 },
  balance: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'insurance', 'bank_transfer', 'other'] 
  },
  paymentDate: { type: Date },
  paymentReference: { type: String },
  insuranceClaim: {
    provider: { type: String },
    claimNumber: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'paid'] 
    },
    approvedAmount: { type: Number, min: 0 }
  },
  notes: { type: String },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Index composé pour les recherches fréquentes
InvoiceSchema.index({ patientId: 1, status: 1 });
InvoiceSchema.index({ issueDate: 1, status: 1 });

// Middleware pour générer le numéro de facture avant la création
InvoiceSchema.pre('save', async function() {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Compter les factures du mois pour générer un numéro séquentiel
    const count = await mongoose.model('Invoice').countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}${month}`)
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.invoiceNumber = `INV-${year}${month}-${sequence}`;
  };
});

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);