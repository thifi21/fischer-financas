export function integrationAllowedUserIds(): string[] {
  return (process.env.INTEGRATIONS_ALLOWED_USER_IDS || '')
    .split(',').map(id => id.trim()).filter(id =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    )
}
