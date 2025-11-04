# SlotSwapper (Backend MVP)

A peer-to-peer time-slot swapping application.

Tech: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT.

## Run locally (backend)

- Prereqs: Node 18+, MongoDB running.
- Setup:
  - cd d:\assiment_3\backend
  - cp .env.example .env
  - Update MONGODB_URI and JWT_SECRET in .env
  - npm install
  - npm run dev

Health check: GET http://localhost:4000/health

## API Summary

Auth
- POST /api/auth/signup { name, email, password } -> { token, user }
- POST /api/auth/login { email, password } -> { token, user }

Events (Bearer token required)
- GET /api/events/my -> list my events
- POST /api/events { title, startTime, endTime, status? } -> create
- PUT /api/events/:id -> update (owner only)
- PUT /api/events/:id/status { status } -> update status
- DELETE /api/events/:id -> delete

Swap (Bearer token required)
- GET /api/swappable-slots -> all SWAPPABLE slots from other users
- POST /api/swap-request { mySlotId, theirSlotId } -> create request, set both SWAP_PENDING
- POST /api/swap-response/:requestId { accept: boolean }
  - If accept = false: request -> REJECTED, slots -> SWAPPABLE
  - If accept = true: request -> ACCEPTED, swap owners, slots -> BUSY
- GET /api/requests -> { incoming, outgoing }

Statuses
- Event.status ∈ { BUSY, SWAPPABLE, SWAP_PENDING }
- SwapRequest.status ∈ { PENDING, ACCEPTED, REJECTED }

## Notes/Assumptions

- Swap operations use MongoDB transactions to avoid race conditions.
- Only the responder (owner of theirSlot at request time) can accept/reject.
- If ownership changes unexpectedly, acceptance fails safely.

## Next steps (Frontend)

- React + TypeScript app with:
  - Auth pages
  - Calendar/List view for my events
  - Marketplace for swappable slots
  - Requests view (incoming/outgoing)
- State management to live-update after swaps.
# ServiceHive_assiment
