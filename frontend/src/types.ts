export type EventStatus = 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';

export interface IEvent {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  owner: string;
}

export type SwapStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ISwapRequest {
  _id: string;
  requesterUser: string;
  responderUser: string;
  mySlot: IEvent;
  theirSlot: IEvent;
  status: SwapStatus;
  createdAt: string;
}
