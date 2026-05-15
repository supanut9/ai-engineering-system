/**
 * configuration returns the application configuration derived from
 * environment variables. All values have safe defaults for local development.
 */
export function configuration(): { port: number } {
  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
  };
}
