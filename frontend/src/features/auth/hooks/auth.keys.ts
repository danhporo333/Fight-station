// Query key của feature auth, gom một chỗ để invalidate đúng key
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}
