import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  invoiceId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  patientId: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'check' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  cardDetails?: {
    last4: string;
    brand: string;
  };
  checkDetails?: {
    bankName: string;
    checkNumber: string;
    date: Date;
  };
  insuranceDetails?: {
    provider: string;
    claimNumber: string;
    authorizationCode?: string;
  };
  paymentDate: Date;
  receivedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  paymentNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  invoiceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Invoice', 
    required: true,
    index: true 
  },
  invoiceNumber: { type: String, required: true },
  patientId: { 
    type: String, 
    required: true,
    index: true 
  },
  amount: { type: Number, required: true, min: 0 },
  method: { 
    type: String, 
    enum: ['cash', 'card', 'insurance', 'bank_transfer', 'check', 'online'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed',
    index: true 
  },
  transactionId: { type: String },
  cardDetails: {
    last4: { type: String },
    brand: { type: String }
  },
  checkDetails: {
    bankName: { type: String },
    checkNumber: { type: String },
    date: { type: Date }
  },
  insuranceDetails: {
    provider: { type: String },
    claimNumber: { type: String },
    authorizationCode: { type: String }
  },
  paymentDate: { type: Date, required: true, default: Date.now },
  receivedBy: { type: String, required: true },
  notes: { type: String }
}, {
  timestamps: true
});

// Middleware pour générer le numéro de paiement
PaymentSchema.pre('save', async function() {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const count = await mongoose.model('Payment').countDocuments({
      paymentNumber: new RegExp(`^PAY-${year}${month}${day}`)
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.paymentNumber = `PAY-${year}${month}${day}-${sequence}`;
  };
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);