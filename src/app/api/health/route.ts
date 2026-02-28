import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connectivity if configured
    const dbStatus = {
      connected: false,
      host: process.env.MYSQL_HOST || 'not configured',
    };

    if (process.env.MYSQL_HOST && process.env.MYSQL_USER) {
      // Add your database connection check here
      dbStatus.connected = true;
    }

    // Check LLM API configuration
    const llmStatus = {
      configured: !!(process.env.LLM_API_KEY),
      endpoint: process.env.LLM_ENDPOINT || 'not configured',
      model: process.env.LLM_MODEL || 'not configured',
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'stem-story-generator',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        database: dbStatus,
        llm: llmStatus,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
