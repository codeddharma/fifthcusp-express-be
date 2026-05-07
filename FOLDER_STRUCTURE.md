# Folder Structure

```
fifthcusp-express-be/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts          # envalid schema — validates all env vars at boot, exits if any missing
│   │   └── db.ts           # Mongoose connection
│   │
│   ├── models/             # Mongoose schemas + TypeScript Document interfaces
│   │   ├── User.ts         # User model (admin | manager | employee)
│   │   └── RefreshToken.ts # Stored refresh tokens with TTL auto-delete
│   │
│   ├── controllers/        # Express request handlers — thin layer, delegates to services
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── services/           # Business logic — all database queries and rules live here
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   │
│   ├── routes/
│   │   └── v1/
│   │       ├── index.ts        # Mounts all v1 routes + /health endpoint
│   │       ├── auth.routes.ts  # /api/v1/auth/*
│   │       └── user.routes.ts  # /api/v1/users/*
│   │
│   ├── middleware/
│   │   ├── authenticate.ts  # Verifies JWT access token, attaches req.user
│   │   ├── authorize.ts     # RBAC guard — authorize('admin', 'manager') pattern
│   │   ├── rateLimiter.ts   # Global limiter, auth limiter, DDoS slow-down
│   │   └── errorHandler.ts  # Global error handler (ApiError + unhandled errors)
│   │
│   ├── utils/
│   │   ├── ApiError.ts      # Custom error class with statusCode
│   │   ├── ApiResponse.ts   # sendSuccess / sendError helpers (uniform response shape)
│   │   ├── asyncHandler.ts  # Wraps async controllers, forwards thrown errors to errorHandler
│   │   └── tokenUtils.ts    # generateAccessToken, generateRefreshToken, verifyToken helpers
│   │
│   ├── types/
│   │   ├── user.types.ts    # IUser interface + UserRole type
│   │   └── express.d.ts     # Extends Express Request with req.user
│   │
│   ├── app.ts               # Express app — wires all middleware + routes
│   └── server.ts            # Entry point — connects DB then starts HTTP server
│
├── .env.example             # All required environment variables with descriptions
├── .gitignore
├── package.json
├── tsconfig.json
├── FOLDER_STRUCTURE.md      # This file
└── README.md
```

## Adding a New Feature

1. **Model** → `src/models/MyFeature.ts`
2. **Service** → `src/services/myFeature.service.ts` (DB queries + business logic)
3. **Controller** → `src/controllers/myFeature.controller.ts` (parse request → call service → send response)
4. **Routes** → `src/routes/v1/myFeature.routes.ts` (apply `authenticate` + `authorize` guards)
5. **Register** → add `router.use('/my-feature', myFeatureRoutes)` in `src/routes/v1/index.ts`

## Response Shape

All endpoints return a consistent JSON envelope:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

`pagination` is only present on list endpoints.

## RBAC Usage

```ts
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

// Only admins
router.delete('/:id', authenticate, authorize('admin'), deleteHandler)

// Admins and managers
router.get('/', authenticate, authorize('admin', 'manager'), listHandler)

// Any authenticated user
router.get('/me', authenticate, meHandler)
```
