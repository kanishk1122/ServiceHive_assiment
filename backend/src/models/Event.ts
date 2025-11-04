import mongoose, { Schema, Document, Types } from 'mongoose';

export type EventStatus = 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';

export interface IEvent extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  owner: Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'], default: 'BUSY', index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
