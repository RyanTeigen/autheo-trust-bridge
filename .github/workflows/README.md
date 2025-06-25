
# GitHub Actions Workflows

## Audit Log Anchoring

This workflow automates the process of anchoring audit logs to the blockchain for compliance and security purposes.

### Schedule
- **Automatic**: Runs every 6 hours
- **Manual**: Can be triggered manually with custom parameters

### Required Secrets
Configure these in your GitHub repository settings under **Settings > Secrets and variables > Actions**:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | Yes |

### Optional Variables
Configure these in your GitHub repository settings under **Settings > Secrets and variables > Actions > Variables**:

| Variable Name | Description | Default |
|---------------|-------------|---------|
| `BLOCKCHAIN_NETWORK` | Target blockchain network | `autheo-testnet` |

### Manual Trigger Parameters
When triggering the workflow manually, you can specify:

- **log_limit**: Number of audit logs to process (default: 100)
- **force_anchor**: Force anchoring even if no new logs (default: false)

### Workflow Features

1. **Automated Execution**: Runs on schedule to ensure regular anchoring
2. **Manual Override**: Allows manual triggering with custom parameters
3. **Health Checks**: Validates system health after anchoring
4. **Error Handling**: Creates GitHub issues when failures occur
5. **Artifact Storage**: Saves anchoring reports for audit trails
6. **Status Updates**: Updates repository badges with current status

### Monitoring

- Check the **Actions** tab in your GitHub repository for workflow runs
- Anchoring reports are saved as artifacts for each run
- Failed runs automatically create GitHub issues for investigation
- Status badge in README.md shows current anchoring health

### Local Testing

You can test the anchoring scripts locally:

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run health check
npm run health-check

# Run anchoring process
npm run anchor

# Run both
npm test
```

### Troubleshooting

1. **Authentication Issues**: Verify your Supabase credentials are correct
2. **Database Access**: Ensure the service role key has proper permissions
3. **Network Issues**: Check if GitHub Actions can access your Supabase instance
4. **Rate Limits**: Monitor for any API rate limiting issues

For more details, check the workflow logs in the Actions tab.
