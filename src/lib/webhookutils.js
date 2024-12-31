'use server'
import webhook from 'webhook-discord'
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function sendDiscordAlert(groupName, taskCount, THRESHOLD) {
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('Discord webhook URL not configured');
  }
  const message = {
    content: `⚠️ Group "${groupName}" has only ${taskCount} tasks in transcribing , which is below the threshold of ${THRESHOLD}. time to add new data`
  };

  // console.log('Debug - Sending Discord message:', JSON.stringify(message, null, 2));

  try {
    const Hook = new webhook.Webhook(DISCORD_WEBHOOK_URL);
    Hook.warn("PechaTool STT Bot",message.content)
    // console.log('Discord message sent successfully');
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
}