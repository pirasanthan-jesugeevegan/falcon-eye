export function createDatabaseStack() {
  // Create VPC for the database with NAT gateway for internet access
  const vpc = new sst.aws.Vpc('DatabaseVPC', { nat: 'managed' });

  // Create RDS PostgreSQL instance with proper configuration
  const db = new sst.aws.Postgres('Database', {
    vpc,
    instance: 't3.micro',
  });

  return {
    db,
    vpc,
  };
}
