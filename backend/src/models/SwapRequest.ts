import mongoose, { Schema, Document, Types } from 'mongoose';

export type SwapStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ISwapRequest extends Document {
  requesterUser: Types.ObjectId; // the one who initiated
  responderUser: Types.ObjectId; // owner of theirSlot at creation time
  mySlot: Types.ObjectId;        // requester's slot
  theirSlot: Types.ObjectId;     // responder's slot
  status: SwapStatus;
}

const SwapRequestSchema = new Schema<ISwapRequest>(
  {
    requesterUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    responderUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mySlot: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    theirSlot: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING', index: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);
